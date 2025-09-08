import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAssessments } from '@/hooks/useAssessments';
import { PersonalityProfile } from '@/types/tps.types';
import { IntegralPersonalityService } from '@/services/integralPersonalityService';
import { useToast } from '@/hooks/use-toast';

interface DataConsistencyResult {
  hasIntegralGaps: boolean;
  missingIntegralCount: number;
  backfillProgress: number;
}

export function useAssessmentDataConsistency() {
  const [isChecking, setIsChecking] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [result, setResult] = useState<DataConsistencyResult | null>(null);
  const { user } = useAuth();
  const { assessments, updateAssessmentProfile } = useAssessments();
  const { toast } = useToast();

  const checkDataConsistency = useCallback(async () => {
    if (!assessments.length) return;

    setIsChecking(true);
    try {
      const assessmentsWithoutIntegral = assessments.filter(
        assessment => !assessment.profile.mappings.integralDetail
      );

      const consistencyResult: DataConsistencyResult = {
        hasIntegralGaps: assessmentsWithoutIntegral.length > 0,
        missingIntegralCount: assessmentsWithoutIntegral.length,
        backfillProgress: 0
      };

      setResult(consistencyResult);
    } catch (error) {
      console.error('Error checking data consistency:', error);
    } finally {
      setIsChecking(false);
    }
  }, [assessments]);

  const backfillIntegralData = useCallback(async () => {
    if (!result?.hasIntegralGaps || !user) return;

    setIsBackfilling(true);
    const integralService = new IntegralPersonalityService();
    
    try {
      const assessmentsWithoutIntegral = assessments.filter(
        assessment => !assessment.profile.mappings.integralDetail
      );

      let processed = 0;
      for (const assessment of assessmentsWithoutIntegral) {
        try {
          // Generate integral detail for this assessment
          const integralDetail = await integralService.generatePersonalityIntegration(
            {} as any, // Mock integral detail - this would need proper implementation
            assessment.profile
          );

          // Update the assessment with the integral detail
          const updatedProfile: PersonalityProfile = {
            ...assessment.profile,
            mappings: {
              ...assessment.profile.mappings,
              integralDetail: integralDetail.integralLevel
            }
          };

          await updateAssessmentProfile(assessment.id, updatedProfile);
          processed++;

          // Update progress
          setResult(prev => prev ? {
            ...prev,
            backfillProgress: (processed / assessmentsWithoutIntegral.length) * 100
          } : null);

          // Small delay to prevent overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.warn(`Failed to backfill integral data for assessment ${assessment.id}:`, error);
        }
      }

      toast({
        title: 'Data Backfill Complete',
        description: `Successfully added integral data to ${processed} assessments.`,
      });

      // Refresh consistency check
      await checkDataConsistency();
    } catch (error) {
      console.error('Error backfilling integral data:', error);
      toast({
        title: 'Backfill Failed',
        description: 'Failed to complete data backfill. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsBackfilling(false);
    }
  }, [result, user, assessments, updateAssessmentProfile, toast, checkDataConsistency]);

  useEffect(() => {
    if (assessments.length > 0) {
      checkDataConsistency();
    }
  }, [assessments, checkDataConsistency]);

  return {
    isChecking,
    isBackfilling,
    result,
    checkDataConsistency,
    backfillIntegralData
  };
}