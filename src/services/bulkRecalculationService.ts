import { supabase } from '@/integrations/supabase/client';

export type BulkListItem = {
  id: string;
  responses: number[];
  profile: any;
  user_id: string;
  variant: string;
  updated_at: string;
};

export async function bulkListAssessments(params: { offset?: number; limit?: number; since?: string | null; variant?: string | null; }) {
  const { offset = 0, limit = 200, since = null, variant = null } = params || {} as any;
  const { data, error } = await supabase.functions.invoke('bulk-recalculate', {
    body: {
      mode: 'list',
      offset,
      limit,
      filter: {
        since: since || undefined,
        variant: variant || undefined,
      }
    }
  });
  if (error) throw error;
  return data as { items: BulkListItem[]; total: number | null; nextOffset: number | null };
}

export async function bulkApplyRecalculation(params: { items: Array<{ id: string; oldProfile?: any; newProfile: any }>; dryRun?: boolean; operationId?: string | null; }) {
  const { items, dryRun = false, operationId = null } = params;
  const { data, error } = await supabase.functions.invoke('bulk-recalculate', {
    body: {
      mode: 'apply',
      items,
      dryRun,
      operationId,
    }
  });
  if (error) throw error;
  return data as { operationId: string; success: number; errors: Array<{ id: string; error: string }>} ;
}
