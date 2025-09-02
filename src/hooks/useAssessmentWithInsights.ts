import { useState, useCallback } from 'react';
import { PersonalityProfile } from '@/types/tps.types';
import { FrameworkInsightsService } from '@/services/frameworkInsightsService';
import { useToast } from '@/hooks/use-toast';

interface UseAssessmentWithInsightsReturn {
  enhanceProfileWithInsights: (profile: PersonalityProfile) => Promise<PersonalityProfile>;
  isGeneratingInsights: boolean;
  insightsError: Error | null;
}

export const useAssessmentWithInsights = (): UseAssessmentWithInsightsReturn => {
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<Error | null>(null);
  const { toast } = useToast();

  const enhanceProfileWithInsights = useCallback(async (profile: PersonalityProfile): Promise<PersonalityProfile> => {
    // If insights already exist, return as-is
    if (profile.frameworkInsights) {
      return profile;
    }

    setIsGeneratingInsights(true);
    setInsightsError(null);

    try {
      const insightsService = new FrameworkInsightsService();
      const insights = await insightsService.generateFrameworkInsights(profile, profile.traitScores);
      
      const enhancedProfile: PersonalityProfile = {
        ...profile,
        frameworkInsights: insights
      };

      toast({
        title: "Enhanced Insights Generated",
        description: "Your personality framework correlations now include detailed explanations and reasoning."
      });

      return enhancedProfile;
    } catch (error) {
      const err = error as Error;
      setInsightsError(err);
      
      console.error('Error generating framework insights:', err);
      
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