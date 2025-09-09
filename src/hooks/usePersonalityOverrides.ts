import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { logger } from '@/utils/structuredLogging';

interface PersonalityOverride {
  id: string;
  user_id: string;
  mbti_type?: string | null;
  enneagram_type?: string | null;
  big_five_scores?: any;
  integral_level?: string | null;
  holland_code?: string | null;
  alignment?: string | null;
  socionics_type?: string | null;
  attachment_style?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function usePersonalityOverrides() {
  const { user } = useAuth();
  const [override, setOverride] = useState<PersonalityOverride | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOverride() {
      if (!user) {
        setOverride(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('personality_overrides')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // Not found error
            logger.error('Error fetching personality override', { component: 'usePersonalityOverrides' }, error as Error);
          }
          setOverride(null);
        } else {
          setOverride(data);
        }
      } catch (error) {
        logger.error('Error in personality override fetch', { component: 'usePersonalityOverrides' }, error as Error);
        setOverride(null);
      } finally {
        setLoading(false);
      }
    }

    fetchOverride();
  }, [user]);

  return { override, loading };
}