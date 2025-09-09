import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { PersonalityProfile } from '@/types/tps.types';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/structuredLogging';

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
          user_id: (await supabase.auth.getUser()).data.user!.id,
          variant,
          responses: responses as unknown as Json,
          profile: profile as unknown as Json
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
    } catch (error: unknown) {
      logger.error('Error saving assessment', { 
        component: 'useAssessments', 
        action: 'saveAssessment' 
      }, error as Error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save assessment. Please try again.",
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
    } catch (error: unknown) {
      logger.error('Error loading assessments', { 
        component: 'useAssessments', 
        action: 'loadAssessments' 
      }, error as Error);
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
    } catch (error: unknown) {
      logger.error('Error deleting assessment', { 
        component: 'useAssessments', 
        action: 'deleteAssessment' 
      }, error as Error);
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

  const updateAssessmentProfile = async (assessmentId: string, profile: PersonalityProfile) => {
    try {
      const { error } = await supabase
        .from('assessments')
        .update({ profile: profile as unknown as Json })
        .eq('id', assessmentId);

      if (error) throw error;

      // Update the local state
      setAssessments(prev => prev.map(assessment => 
        assessment.id === assessmentId 
          ? { ...assessment, profile }
          : assessment
      ));
    } catch (error: unknown) {
      logger.error('Error updating assessment profile', { 
        component: 'useAssessments', 
        action: 'updateAssessmentProfile' 
      }, error as Error);
      toast({
        title: "Update Failed",
        description: "Failed to update assessment profile.",
        variant: "destructive"
      });
    }
  };

  return {
    assessments,
    loading,
    saveAssessment,
    loadAssessments,
    deleteAssessment,
    updateAssessmentProfile
  };
}