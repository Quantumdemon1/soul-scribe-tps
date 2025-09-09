import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get the JWT token from the request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the user is an admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has admin role
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.error('Admin check failed:', roleError);
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email, displayName, personalityTypes } = await req.json();

    // Validate input
    if (!email || !displayName) {
      return new Response(JSON.stringify({ error: 'Email and display name are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate a temporary password
    const tempPassword = crypto.randomUUID();

    // Create the user account
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: displayName,
        created_by_admin: true,
        temp_password: true
      }
    });

    if (createError) {
      console.error('User creation error:', createError);
      return new Response(JSON.stringify({ 
        error: 'Failed to create user',
        details: createError?.message ?? createError
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const newUserId = userData.user.id;

    // Create or update profile entry (handle existing profile via trigger)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: newUserId,
        display_name: displayName,
        username: email.split('@')[0], // Default username from email
        verification_level: 'basic'
      });

    if (profileError) {
      // If profile already exists (likely from a signup trigger), update it instead
      const code = (profileError as any)?.code;
      if (code === '23505') { // unique_violation
        console.warn('Profile already exists, updating instead.');
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            display_name: displayName,
            // Re-set username if needed
            username: email.split('@')[0],
          })
          .eq('user_id', newUserId);
        if (updateError) {
          console.error('Profile update error:', updateError);
          return new Response(JSON.stringify({
            error: 'Failed to update existing profile',
            details: (updateError as any)?.message ?? updateError
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      } else {
        console.error('Profile creation error:', profileError);
        // Clean up the user if profile creation fails for other reasons
        await supabaseAdmin.auth.admin.deleteUser(newUserId);
        return new Response(JSON.stringify({ 
          error: 'Failed to create profile',
          details: (profileError as any)?.message ?? profileError
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Create privacy settings if not exists
    const { error: privacyError } = await supabaseAdmin
      .from('privacy_settings')
      .insert({
        user_id: newUserId
      });

    if (privacyError) {
      const code = (privacyError as any)?.code;
      if (code === '23505') {
        console.warn('Privacy settings already exist, continuing.');
      } else {
        console.error('Privacy settings error:', privacyError);
      }
    }

    // Insert personality overrides if provided
    if (personalityTypes && Object.keys(personalityTypes).length > 0) {
      const overrideData = {
        user_id: newUserId,
        created_by: user.id,
        ...personalityTypes
      };

      const { error: overrideError } = await supabaseAdmin
        .from('personality_overrides')
        .insert(overrideData);

      if (overrideError) {
        console.error('Personality override error:', overrideError);
      }
    }

    console.log(`Admin user created successfully: ${email} by ${user.email}`);

    return new Response(JSON.stringify({ 
      success: true, 
      userId: newUserId,
      temporaryPassword: tempPassword,
      message: 'User created successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in admin-create-user function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});