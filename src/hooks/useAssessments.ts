import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PersonalityProfile } from '@/types/tps.types';
import { toast } from '@/hooks/use-toast';

interface Assessment {
  id: string;
  variant: string;
  profile: PersonalityProfile;
  created_at: string;
  updated_at: string;
  user_id: string;
  responses: number[] | null;
}

export function useAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(false);

  const saveAssessment = async (
    profile: PersonalityProfile,
    responses: number[],
    variant: string = 'full'
  ) => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          variant,
          responses: responses as any,
          profile: profile as any
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Assessment Saved",
        description: "Your personality profile has been saved to your account.",
      });

      await loadAssessments();
      return data;
    } catch (error: any) {
      console.error('Error saving assessment:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save assessment. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const loadAssessments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssessments((data || []).map(item => ({
        ...item,
        profile: item.profile as unknown as PersonalityProfile,
        responses: item.responses as unknown as number[] | null
      })));
    } catch (error: any) {
      console.error('Error loading assessments:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load your saved assessments.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAssessment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Assessment Deleted",
        description: "The assessment has been removed from your account.",
      });

      await loadAssessments();
    } catch (error: any) {
      console.error('Error deleting assessment:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete assessment. Please try again.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    // Load assessments when auth state is available
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        loadAssessments();
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setTimeout(() => {
          loadAssessments();
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setAssessments([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    assessments,
    loading,
    saveAssessment,
    loadAssessments,
    deleteAssessment
  };
}