import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/structuredLogging';

export interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  website: string | null;
  birth_date: string | null;
  personality_visibility: 'public' | 'connections' | 'private';
  profile_visibility: 'public' | 'connections' | 'private';
  verification_level: 'basic' | 'verified' | 'expert';
  created_at: string;
  updated_at: string;
}

export interface PrivacySettings {
  id: string;
  user_id: string;
  show_assessment_results: boolean;
  allow_forum_mentions: boolean;
  allow_direct_messages: boolean;
  show_online_status: boolean;
  allow_personality_matching: boolean;
  data_sharing_consent: boolean;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchPrivacySettings();
    } else {
      setProfile(null);
      setPrivacySettings(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data as UserProfile);
    } catch (error) {
      logger.error('Failed to fetch user profile', {
        component: 'useProfile',
        action: 'fetchProfile',
        metadata: { userId: user.id }
      }, error as Error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      });
    }
  };

  const fetchPrivacySettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setPrivacySettings(data);
    } catch (error) {
      logger.error('Failed to fetch privacy settings', {
        component: 'useProfile',
        action: 'fetchPrivacySettings',
        metadata: { userId: user.id }
      }, error as Error);
      toast({
        title: 'Error',
        description: 'Failed to load privacy settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return false;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile({ ...profile, ...updates });
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      return true;
    } catch (error) {
      logger.error('Failed to update user profile', {
        component: 'useProfile',
        action: 'updateProfile',
        metadata: { userId: user.id, updates: Object.keys(updates) }
      }, error as Error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updatePrivacySettings = async (updates: Partial<PrivacySettings>) => {
    if (!user || !privacySettings) return false;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('privacy_settings')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setPrivacySettings({ ...privacySettings, ...updates });
      toast({
        title: 'Success',
        description: 'Privacy settings updated successfully',
      });
      return true;
    } catch (error) {
      logger.error('Failed to update privacy settings', {
        component: 'useProfile',
        action: 'updatePrivacySettings',
        metadata: { userId: user.id, updates: Object.keys(updates) }
      }, error as Error);
      toast({
        title: 'Error',
        description: 'Failed to update privacy settings',
        variant: 'destructive',
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const validateUsername = async (username: string): Promise<boolean> => {
    if (!username) return false;

    try {
      const { data, error } = await supabase.rpc('validate_username', {
        username_input: username
      });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to validate username', {
        component: 'useProfile',
        action: 'validateUsername',
        metadata: { username }
      }, error as Error);
      return false;
    }
  };

  return {
    profile,
    privacySettings,
    loading,
    saving,
    updateProfile,
    updatePrivacySettings,
    validateUsername,
    refetch: () => {
      fetchProfile();
      fetchPrivacySettings();
    }
  };
}