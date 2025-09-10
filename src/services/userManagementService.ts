import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/structuredLogging';

export interface UserWithOverrides {
  id: string;
  email: string;
  display_name: string | null;
  username: string | null;
  verification_level: string | null;
  created_at: string;
  assessment_count: number;
  last_assessment_date: string | null;
  mbti_type: string | null;
  enneagram_type: string | null;
  big_five_scores: any;
  integral_level: string | null;
  holland_code: string | null;
  alignment: string | null;
  socionics_type: string | null;
  attachment_style: string | null;
  override_created_by: string | null;
  override_created_at: string | null;
  override_updated_at: string | null;
}

export interface UserManagementFilters {
  search?: string;
  hasOverrides?: boolean;
  hasAssessments?: boolean;
  verificationLevel?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface UserManagementResponse {
  users: UserWithOverrides[];
  totalCount: number;
  hasNextPage: boolean;
}

export async function fetchUsersWithOverrides(
  filters: UserManagementFilters = {}
): Promise<UserManagementResponse> {
  try {
    // Use admin edge function to get user data with proper auth.users access
    const { data, error } = await supabase.functions.invoke('admin-get-users', {
      body: filters
    });

    if (error) {
      throw error;
    }

    if (!data || data.error) {
      throw new Error(data?.error || 'Failed to fetch users');
    }

    return {
      users: data.users || [],
      totalCount: data.totalCount || 0,
      hasNextPage: data.hasNextPage || false
    };

  } catch (error) {
    logger.error('Error fetching users with overrides', { 
      component: 'userManagementService'
    }, error as Error);
    
    // Return empty state instead of throwing to prevent UI crashes
    return {
      users: [],
      totalCount: 0,
      hasNextPage: false
    };
  }
}

export async function updateUserOverride(
  userId: string,
  framework: string,
  value: string | null,
  reason?: string
): Promise<void> {
  try {
    // Check if user has existing overrides
    const { data: existing } = await supabase
      .from('personality_overrides')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const updateData = {
      [framework]: value,
      updated_at: new Date().toISOString()
    };

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('personality_overrides')
        .update(updateData)
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      // Create new record
      const { error } = await supabase
        .from('personality_overrides')
        .insert({
          user_id: userId,
          created_by: (await supabase.auth.getUser()).data.user?.id || '',
          ...updateData
        });

      if (error) throw error;
    }
  } catch (error) {
    logger.error('Error updating user override', { 
      component: 'userManagementService',
      userId
    }, error as Error);
    throw error;
  }
}

export async function bulkUpdateOverrides(
  userIds: string[],
  framework: string,
  value: string | null
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = { success: 0, failed: 0, errors: [] as string[] };

  for (const userId of userIds) {
    try {
      await updateUserOverride(userId, framework, value);
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(`User ${userId}: ${(error as Error).message}`);
    }
  }

  return results;
}

export async function bulkClearOverrides(
  userIds: string[],
  frameworks: string[]
): Promise<{ success: number; failed: number; errors: string[] }> {
  const results = { success: 0, failed: 0, errors: [] as string[] };

  for (const userId of userIds) {
    try {
      const clearData = frameworks.reduce((acc, framework) => {
        acc[framework] = null;
        return acc;
      }, {} as Record<string, null>);

      const { data: existing } = await supabase
        .from('personality_overrides')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('personality_overrides')
          .update({ ...clearData, updated_at: new Date().toISOString() })
          .eq('user_id', userId);

        if (error) throw error;
      }
      
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(`User ${userId}: ${(error as Error).message}`);
    }
  }

  return results;
}

export const FRAMEWORK_OPTIONS = {
  mbti_type: [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ],
  enneagram_type: [
    '1', '2', '3', '4', '5', '6', '7', '8', '9',
    '1w9', '1w2', '2w1', '2w3', '3w2', '3w4',
    '4w3', '4w5', '5w4', '5w6', '6w5', '6w7',
    '7w6', '7w8', '8w7', '8w9', '9w8', '9w1'
  ],
  holland_code: [
    'R', 'I', 'A', 'S', 'E', 'C',
    'RI', 'RA', 'RS', 'RE', 'RC', 'IR', 'IA', 'IS', 'IE', 'IC',
    'AR', 'AI', 'AS', 'AE', 'AC', 'SR', 'SI', 'SA', 'SE', 'SC',
    'ER', 'EI', 'EA', 'ES', 'EC', 'CR', 'CI', 'CA', 'CS', 'CE',
    'RIA', 'RIE', 'RIC', 'RAI', 'RAS', 'RAE', 'RAC', 'RSI', 'RSA', 'RSE', 'RSC'
  ],
  alignment: [
    'Lawful Good', 'Neutral Good', 'Chaotic Good',
    'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
    'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
  ],
  socionics_type: [
    'ILE', 'SEI', 'ESE', 'LII', 'EIE', 'LSI', 'SLE', 'IEI',
    'LIE', 'ESI', 'IEE', 'SLI', 'SEE', 'ILI', 'LSE', 'EII'
  ],
  integral_level: [
    'Beige', 'Purple', 'Red', 'Blue', 'Orange', 'Green', 'Yellow', 'Turquoise'
  ],
  attachment_style: [
    'Secure', 'Anxious', 'Avoidant', 'Disorganized'
  ]
} as const;