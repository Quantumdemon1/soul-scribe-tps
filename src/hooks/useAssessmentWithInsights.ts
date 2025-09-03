import { useState, useCallback } from 'react';
import { PersonalityProfile } from '@/types/tps.types';
import { FrameworkInsightsService } from '@/services/frameworkInsightsService';
import { AIInsightsService } from '@/services/aiInsightsService';
import { useToast } from '@/hooks/use-toast';

interface UseAssessmentWithInsightsReturn {
  enhanceProfileWithInsights: (profile: PersonalityProfile, userId?: string) => Promise<PersonalityProfile>;
  isGeneratingInsights: boolean;
  insightsError: Error | null;
}

export const useAssessmentWithInsights = (): UseAssessmentWithInsightsReturn => {
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<Error | null>(null);
  const { toast } = useToast();

  const enhanceProfileWithInsights = useCallback(async (profile: PersonalityProfile, userId?: string): Promise<PersonalityProfile> => {
    // If insights already exist, return as-is
    if (profile.frameworkInsights) {
      return profile;
    }

    setIsGeneratingInsights(true);
    setInsightsError(null);

    try {
      const frameworkService = new FrameworkInsightsService();
      const aiInsightsService = new AIInsightsService();
      
      // Generate framework insights with caching
      const frameworkInsights = await frameworkService.generateFrameworkInsights(profile, profile.traitScores);
      
      // Generate comprehensive AI insights with caching (stored separately, not in profile)
      await aiInsightsService.generateInsights(profile, userId);
      
      const enhancedProfile: PersonalityProfile = {
        ...profile,
        frameworkInsights
      };

      toast({
        title: "Enhanced Insights Generated",
        description: "Your personality profile now includes comprehensive AI insights and framework correlations."
      });

      return enhancedProfile;
    } catch (error) {
      const err = error as Error;
      setInsightsError(err);
      
      console.error('Error generating enhanced insights:', err);
      
      toast({
        title: "Insight Generation Error",
        description: "Basic results are available. Enhanced insights will be generated in the background.",
        variant: "destructive"
      });

      // Return original profile if insights generation fails
      return profile;
    } finally {
      setIsGeneratingInsights(false);
    }
  }, [toast]);

  return {
    enhanceProfileWithInsights,
    isGeneratingInsights,
    insightsError
  };
};