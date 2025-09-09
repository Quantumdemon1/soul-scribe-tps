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
    const {
      search = '',
      hasOverrides,
      hasAssessments,
      verificationLevel,
      page = 0,
      pageSize = 50
    } = filters;

    // Start with profiles query including assessment counts
    let query = supabase
      .from('profiles')
      .select(`
        user_id,
        display_name,
        username,
        verification_level,
        created_at,
        personality_overrides!left (
          mbti_type,
          enneagram_type,
          big_five_scores,
          integral_level,
          holland_code,
          alignment,
          socionics_type,
          attachment_style,
          created_by,
          created_at,
          updated_at
        )
      `)
      .order('created_at', { ascending: false });

    // Apply search filter
    if (search) {
      query = query.or(`display_name.ilike.%${search}%,username.ilike.%${search}%`);
    }

    // Apply verification level filter
    if (verificationLevel) {
      query = query.eq('verification_level', verificationLevel);
    }

    // Apply pagination
    const from = page * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: profiles, error: profilesError, count } = await query;

    if (profilesError) {
      throw profilesError;
    }

    // Get assessment counts separately due to RLS limitations
    const userIds = profiles?.map(p => p.user_id) || [];
    let assessmentCounts: Record<string, { count: number; latest: string | null }> = {};

    if (userIds.length > 0) {
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select('user_id, created_at')
        .in('user_id', userIds)
        .order('created_at', { ascending: false });

      if (!assessmentError && assessmentData) {
        // Group by user_id and count
        assessmentCounts = assessmentData.reduce((acc, assessment) => {
          if (!acc[assessment.user_id]) {
            acc[assessment.user_id] = { count: 0, latest: null };
          }
          acc[assessment.user_id].count++;
          if (!acc[assessment.user_id].latest) {
            acc[assessment.user_id].latest = assessment.created_at;
          }
          return acc;
        }, {} as Record<string, { count: number; latest: string | null }>);
      }
    }

    // Transform the data
    const users: UserWithOverrides[] = profiles?.map(profile => {
      const override = Array.isArray(profile.personality_overrides) 
        ? profile.personality_overrides[0] 
        : profile.personality_overrides;
      const assessmentInfo = assessmentCounts[profile.user_id] || { count: 0, latest: null };

      return {
        id: profile.user_id,
        email: '', // We'll fetch this separately if needed
        display_name: profile.display_name,
        username: profile.username,
        verification_level: profile.verification_level,
        created_at: profile.created_at,
        assessment_count: assessmentInfo.count,
        last_assessment_date: assessmentInfo.latest,
        mbti_type: override?.mbti_type || null,
        enneagram_type: override?.enneagram_type || null,
        big_five_scores: override?.big_five_scores || null,
        integral_level: override?.integral_level || null,
        holland_code: override?.holland_code || null,
        alignment: override?.alignment || null,
        socionics_type: override?.socionics_type || null,
        attachment_style: override?.attachment_style || null,
        override_created_by: override?.created_by || null,
        override_created_at: override?.created_at || null,
        override_updated_at: override?.updated_at || null,
      };
    }) || [];

    // Apply post-query filters
    let filteredUsers = users;

    if (hasOverrides !== undefined) {
      filteredUsers = filteredUsers.filter(user => {
        const hasAnyOverride = !!(
          user.mbti_type || user.enneagram_type || user.big_five_scores ||
          user.integral_level || user.holland_code || user.alignment ||
          user.socionics_type || user.attachment_style
        );
        return hasOverrides ? hasAnyOverride : !hasAnyOverride;
      });
    }

    if (hasAssessments !== undefined) {
      filteredUsers = filteredUsers.filter(user => 
        hasAssessments ? user.assessment_count > 0 : user.assessment_count === 0
      );
    }

    return {
      users: filteredUsers,
      totalCount: count || 0,
      hasNextPage: (count || 0) > (page + 1) * pageSize
    };

  } catch (error) {
    logger.error('Error fetching users with overrides', { component: 'userManagementService' }, error as Error);
    throw error;
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
      .single();

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