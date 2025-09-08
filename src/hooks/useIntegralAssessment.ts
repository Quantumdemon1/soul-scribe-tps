import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { IntegralDetail } from '@/types/tps.types';
import { PersonalityProfile } from '@/types/tps.types';
import { supabase } from '@/integrations/supabase/client';

interface UseIntegralAssessmentReturn {
  saveIntegralResults: (integralDetail: IntegralDetail) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export const useIntegralAssessment = (): UseIntegralAssessmentReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const saveIntegralResults = useCallback(async (integralDetail: IntegralDetail) => {
    setIsLoading(true);
    setError(null);

    try {
      if (user) {
        // For authenticated users, update the latest assessment
        const { data: assessments, error: fetchError } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (fetchError) throw fetchError;

        if (assessments && assessments.length > 0) {
          const latestAssessment = assessments[0];
          const existingProfile = latestAssessment.profile as unknown as PersonalityProfile;
          const updatedProfile: PersonalityProfile = {
            ...existingProfile,
            mappings: {
              ...existingProfile.mappings,
              integralDetail
            }
          };

          const { error: updateError } = await supabase
            .from('assessments')
            .update({ profile: updatedProfile as any })
            .eq('id', latestAssessment.id);

          if (updateError) throw updateError;

          toast({
            title: "Integral Assessment Saved",
            description: "Your cognitive development level has been added to your profile.",
          });
        } else {
          // No existing assessment, create a new one with just integral data
          const basicProfile: PersonalityProfile = {
            dominantTraits: {},
            traitScores: {},
            domainScores: {
              External: 0,
              Internal: 0,
              Interpersonal: 0,
              Processing: 0,
            },
            mappings: {
              mbti: '',
              enneagram: '',
              enneagramDetails: { type: 0, wing: 0, tritype: '' },
              bigFive: {},
              dndAlignment: '',
              socionics: '',
              hollandCode: '',
              personalityMatches: [],
              integralDetail
            },
            timestamp: new Date().toISOString(),
          };

          const { error: createError } = await supabase
            .from('assessments')
            .insert([{
              user_id: user.id,
              profile: basicProfile as any,
              responses: [] as any,
              variant: 'integral'
            }]);

          if (createError) throw createError;

          toast({
            title: "Integral Assessment Completed",
            description: "Your cognitive development profile has been saved.",
          });
        }
      } else {
        // For guest users, save to localStorage
        const existingProfile = localStorage.getItem('tps-profile');
        
        if (existingProfile) {
          try {
            const profile = JSON.parse(existingProfile);
            const updatedProfile = {
              ...profile,
              mappings: {
                ...profile.mappings,
                integralDetail
              }
            };
            localStorage.setItem('tps-profile', JSON.stringify(updatedProfile));
          } catch (parseError) {
            // If existing profile is corrupted, create new one
            const basicProfile: PersonalityProfile = {
              dominantTraits: {},
              traitScores: {},
              domainScores: {
                External: 0,
                Internal: 0,
                Interpersonal: 0,
                Processing: 0,
              },
              mappings: {
                mbti: '',
                enneagram: '',
                enneagramDetails: { type: 0, wing: 0, tritype: '' },
                bigFive: {},
                dndAlignment: '',
                socionics: '',
                hollandCode: '',
                personalityMatches: [],
                integralDetail
              },
              timestamp: new Date().toISOString(),
            };
            localStorage.setItem('tps-profile', JSON.stringify(basicProfile));
          }
        } else {
          // Create new profile with integral data
          const basicProfile: PersonalityProfile = {
            dominantTraits: {},
            traitScores: {},
            domainScores: {
              External: 0,
              Internal: 0,
              Interpersonal: 0,
              Processing: 0,
            },
            mappings: {
              mbti: '',
              enneagram: '',
              enneagramDetails: { type: 0, wing: 0, tritype: '' },
              bigFive: {},
              dndAlignment: '',
              socionics: '',
              hollandCode: '',
              personalityMatches: [],
              integralDetail
            },
            timestamp: new Date().toISOString(),
          };
          localStorage.setItem('tps-profile', JSON.stringify(basicProfile));
        }

        toast({
          title: "Results Saved Locally",
          description: "Your integral assessment has been saved. Sign up to sync across devices!",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save results';
      setError(new Error(errorMessage));
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  return {
    saveIntegralResults,
    isLoading,
    error
  };
};