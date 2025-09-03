import { useState, useCallback } from 'react';
import { PersonalityProfile } from '@/types/tps.types';
import { FrameworkInsightsService } from '@/services/frameworkInsightsService';
import { AIInsightsService } from '@/services/aiInsightsService';
import { useToast } from '@/hooks/use-toast';
import { usePerformanceOptimization } from './usePerformanceOptimization';
import { useErrorHandler } from './useErrorHandler';
import { useLoadingState } from './useLoadingState';

interface UseAssessmentWithInsightsReturn {
  enhanceProfileWithInsights: (profile: PersonalityProfile, userId?: string) => Promise<PersonalityProfile>;
  isGeneratingInsights: boolean;
  insightsError: Error | null;
  cancelInsights: () => void;
  retryInsights: () => void;
}

export const useAssessmentWithInsights = (): UseAssessmentWithInsightsReturn => {
  const { toast } = useToast();
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
        () => frameworkService.generateFrameworkInsights(profile, profile.traitScores),
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
        frameworkInsights: frameworkInsights || undefined
      };

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
  }, [toast, performanceUtils, handleAsyncError, loadingState, trackComponentRender]);

  return {
    enhanceProfileWithInsights,
    isGeneratingInsights: loadingState.isLoading,
    insightsError: loadingState.error,
    cancelInsights: loadingState.cancel,
    retryInsights: () => loadingState.reset()
  };
};