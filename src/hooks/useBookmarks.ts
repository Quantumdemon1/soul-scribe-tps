import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Bookmark {
  id: string;
  user_id: string;
  section_name: string;
  insight_content: any;
  title: string;
  description?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id?: string;
  user_id: string;
  dashboard_layout: Record<string, any>;
  hidden_sections: string[];
  insight_detail_level: 'brief' | 'detailed' | 'comprehensive';
  theme_preference: 'light' | 'dark' | 'system';
  notification_settings: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export const useBookmarks = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const addBookmark = async (
    sectionName: string,
    insightContent: any,
    title: string,
    description?: string,
    tags: string[] = []
  ): Promise<Bookmark | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert({
          user_id: user.id,
          section_name: sectionName,
          insight_content: insightContent,
          title,
          description,
          tags
        })
        .select()
        .single();

      if (error) throw error;
      
      setBookmarks(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add bookmark');
      return null;
    }
  };

  const removeBookmark = async (bookmarkId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId);

      if (error) throw error;
      
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove bookmark');
      return false;
    }
  };

  const updateBookmark = async (
    bookmarkId: string,
    updates: Partial<Pick<Bookmark, 'title' | 'description' | 'tags'>>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .update(updates)
        .eq('id', bookmarkId);

      if (error) throw error;
      
      setBookmarks(prev => prev.map(b => 
        b.id === bookmarkId ? { ...b, ...updates } : b
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update bookmark');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  return {
    bookmarks,
    loading,
    error,
    addBookmark,
    removeBookmark,
    updateBookmark,
    refetch: fetchBookmarks
  };
};

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        // Create default preferences
        const defaultPrefs = {
          user_id: user.id,
          dashboard_layout: {},
          hidden_sections: [],
          insight_detail_level: 'detailed' as const,
          theme_preference: 'system' as const,
          notification_settings: {}
        };
        
        const { data: newData, error: createError } = await supabase
          .from('user_preferences')
          .insert(defaultPrefs)
          .select()
          .single();

        if (createError) throw createError;
        setPreferences({
          ...newData,
          dashboard_layout: newData.dashboard_layout as Record<string, any>,
          notification_settings: newData.notification_settings as Record<string, any>,
          hidden_sections: newData.hidden_sections || [],
          insight_detail_level: (newData.insight_detail_level as 'brief' | 'detailed' | 'comprehensive') || 'detailed',
          theme_preference: (newData.theme_preference as 'light' | 'dark' | 'system') || 'system'
        });
      } else {
        setPreferences({
          ...data,
          dashboard_layout: data.dashboard_layout as Record<string, any>,
          notification_settings: data.notification_settings as Record<string, any>,
          hidden_sections: data.hidden_sections || [],
          insight_detail_level: (data.insight_detail_level as 'brief' | 'detailed' | 'comprehensive') || 'detailed',
          theme_preference: (data.theme_preference as 'light' | 'dark' | 'system') || 'system'
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (
    updates: Partial<Pick<UserPreferences, 'dashboard_layout' | 'hidden_sections' | 'insight_detail_level' | 'theme_preference' | 'notification_settings'>>
  ): Promise<boolean> => {
    if (!user || !preferences) return false;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setPreferences(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refetch: fetchPreferences
  };
};