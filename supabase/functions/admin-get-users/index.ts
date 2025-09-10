import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface UserManagementFilters {
  search?: string
  hasOverrides?: boolean
  hasAssessments?: boolean
  verificationLevel?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify admin access
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user has admin role
    const { data: userRole } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (!userRole) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const filters: UserManagementFilters = await req.json()
    const {
      search = '',
      hasOverrides,
      hasAssessments,
      verificationLevel,
      page = 0,
      pageSize = 50
    } = filters

    // Get profiles (we'll fetch overrides separately to avoid FK dependency)
    let profileQuery = supabaseClient
      .from('profiles')
      .select(`
        user_id,
        display_name,
        username,
        verification_level,
        created_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply search filter
    if (search) {
      profileQuery = profileQuery.or(`display_name.ilike.%${search}%,username.ilike.%${search}%`)
    }

    // Apply verification level filter
    if (verificationLevel) {
      profileQuery = profileQuery.eq('verification_level', verificationLevel)
    }

    // Apply pagination
    const from = page * pageSize
    const to = from + pageSize - 1
    profileQuery = profileQuery.range(from, to)

    const { data: profiles, error: profilesError, count } = await profileQuery

    if (profilesError) {
      throw profilesError
    }

    // Prepare user id list
    const userIds = profiles?.map(p => p.user_id) || []

    // Fetch overrides separately (manual join)
    let overrideMap: Record<string, any> = {}
    if (userIds.length > 0) {
      const { data: overrides, error: overridesError } = await supabaseClient
        .from('personality_overrides')
        .select(`
          user_id,
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
        `)
        .in('user_id', userIds)

      if (overridesError) {
        throw overridesError
      }

      overrideMap = (overrides || []).reduce((acc, o) => {
        if (!acc[o.user_id]) acc[o.user_id] = o
        return acc
      }, {} as Record<string, any>)
    }

    // Get user emails from auth.users (admin access)
    const { data: authUsers, error: authError2 } = await supabaseClient.auth.admin.listUsers()
    
    if (authError2) {
      throw authError2
    }
    
    const userEmails = authUsers.users.reduce((acc, authUser) => {
      acc[authUser.id] = authUser.email || `user-${authUser.id.slice(0, 8)}@example.com`
      return acc
    }, {} as Record<string, string>)

    // Get assessment counts
    let assessmentCounts: Record<string, { count: number; latest: string | null }> = {}
    if (userIds.length > 0) {
      const { data: assessmentData } = await supabaseClient
        .from('assessments')
        .select('user_id, created_at')
        .in('user_id', userIds)
        .order('created_at', { ascending: false })

      if (assessmentData) {
        assessmentCounts = assessmentData.reduce((acc, assessment) => {
          if (!acc[assessment.user_id]) {
            acc[assessment.user_id] = { count: 0, latest: null }
          }
          acc[assessment.user_id].count++
          if (!acc[assessment.user_id].latest) {
            acc[assessment.user_id].latest = assessment.created_at
          }
          return acc
        }, {} as Record<string, { count: number; latest: string | null }>)
      }
    }

    // Transform the data
    const users = profiles?.map(profile => {
      const override = overrideMap[profile.user_id] || null
      const assessmentInfo = assessmentCounts[profile.user_id] || { count: 0, latest: null }

      return {
        id: profile.user_id,
        email: userEmails[profile.user_id] || `user-${profile.user_id.slice(0, 8)}@example.com`,
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
      }
    }) || []

    // Apply post-query filters
    let filteredUsers = users

    if (hasOverrides !== undefined) {
      filteredUsers = filteredUsers.filter(user => {
        const hasAnyOverride = !!(
          user.mbti_type || user.enneagram_type || user.big_five_scores ||
          user.integral_level || user.holland_code || user.alignment ||
          user.socionics_type || user.attachment_style
        )
        return hasOverrides ? hasAnyOverride : !hasAnyOverride
      })
    }

    if (hasAssessments !== undefined) {
      filteredUsers = filteredUsers.filter(user => 
        hasAssessments ? user.assessment_count > 0 : user.assessment_count === 0
      )
    }

    return new Response(JSON.stringify({
      users: filteredUsers,
      totalCount: count || 0,
      hasNextPage: (count || 0) > (page + 1) * pageSize
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in admin-get-users:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})