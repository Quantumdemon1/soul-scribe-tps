import { useState, useCallback } from 'react';
import { PersonalityProfile } from '@/types/tps.types';
import { FrameworkInsightsService } from '@/services/frameworkInsightsService';
import { AIInsightsService } from '@/services/aiInsightsService';
import { useToast } from '@/hooks/use-toast';
import { usePerformanceOptimization } from './usePerformanceOptimization';
import { useErrorHandler } from './useErrorHandler';
import { useLoadingState } from './useLoadingState';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UseAssessmentWithInsightsReturn {
  enhanceProfileWithInsights: (profile: PersonalityProfile, userId?: string) => Promise<PersonalityProfile>;
  isGeneratingInsights: boolean;
  insightsError: Error | null;
  cancelInsights: () => void;
  retryInsights: () => void;
}

export const useAssessmentWithInsights = (): UseAssessmentWithInsightsReturn => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { performanceUtils, trackComponentRender } = usePerformanceOptimization();
  const { handleAsyncError } = useErrorHandler({
    showToast: false, // Handle toasts manually for better UX
    fallbackMessage: "Failed to generate enhanced insights"
  });
  
  const loadingState = useLoadingState<PersonalityProfile>({
    timeout: 30000, // 30 seconds for insights generation
    retryCount: 2,
    showErrorToast: false // Handle manually
  });

  const enhanceProfileWithInsights = useCallback(async (profile: PersonalityProfile, userId?: string): Promise<PersonalityProfile> => {
    // If insights already exist, return as-is
    if (profile.frameworkInsights) {
      return profile;
    }

    const trackRender = trackComponentRender('InsightsGeneration');

    const result = await loadingState.execute(async (signal) => {
      // Check if operation was cancelled
      if (signal?.aborted) return profile;

      const frameworkService = new FrameworkInsightsService();
      const aiInsightsService = new AIInsightsService();
      
      // Generate framework insights with performance tracking
      const frameworkInsights = await handleAsyncError(
        () => frameworkService.generateFrameworkInsights(profile, profile.traitScores, userId),
        "Failed to generate framework insights"
      );

      // Generate AI insights in background (not blocking)
      handleAsyncError(
        () => aiInsightsService.generateInsights(profile, userId),
        "Failed to generate AI insights"
      ).catch(() => {
        // Silently handle AI insights failure - they're stored separately
      });

      // Check if operation was cancelled
      if (signal?.aborted) return profile;
      
      const enhancedProfile: PersonalityProfile = {
        ...profile,
        frameworkInsights: frameworkInsights || undefined,
        timestamp: new Date().toISOString()
      };

      // Persist the enhanced profile
      await persistEnhancedProfile(enhancedProfile);

      if (frameworkInsights) {
        toast({
          title: "Enhanced Insights Generated",
          description: "Your personality profile now includes comprehensive AI insights and framework correlations."
        });
      } else {
        toast({
          title: "Partial Insights Generated",
          description: "Basic results are available. Some enhanced insights may be generated in the background.",
          variant: "default"
        });
      }

      trackRender(); // Track completion time
      return enhancedProfile;
    }, { retryOnError: true });

    return result || profile;
  }, [toast, user, performanceUtils, handleAsyncError, loadingState, trackComponentRender]);

  const persistEnhancedProfile = async (updatedProfile: PersonalityProfile) => {
    try {
      if (user) {
        // For authenticated users: update the latest assessment in Supabase
        const { data: assessments } = await supabase
          .from('assessments')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (assessments && assessments.length > 0) {
          await supabase
            .from('assessments')
            .update({ profile: updatedProfile as any })
            .eq('id', assessments[0].id);
        }
      } else {
        // For guests: update localStorage
        localStorage.setItem('tps-profile', JSON.stringify(updatedProfile));
      }
    } catch (error) {
      console.error('Error persisting enhanced profile:', error);
      // Don't throw - this shouldn't block the UI
    }
  };

  return {
    enhanceProfileWithInsights,
    isGeneratingInsights: loadingState.isLoading,
    insightsError: loadingState.error,
    cancelInsights: loadingState.cancel,
    retryInsights: () => loadingState.reset()
  };
};