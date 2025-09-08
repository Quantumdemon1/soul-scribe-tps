import React, { useState, useEffect } from 'react';
import { IntegralInitialAssessment } from '@/components/assessment/IntegralInitialAssessment';
import { IntegralSocraticClarification } from '@/components/assessment/IntegralSocraticClarification';
import { IntegralConfidenceEnhancement } from '@/components/assessment/IntegralConfidenceEnhancement';
import { EnhancedIntegralResults } from '@/components/assessment/EnhancedIntegralResults';
import { IntegralDetail } from '@/mappings/integral.enhanced';
import { useAssessments } from '@/hooks/useAssessments';
import { PersonalityProfile } from '@/types/tps.types';
import { MobileResponsiveWrapper } from '@/components/ui/mobile-responsive-wrapper';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ErrorRecovery } from '@/components/ui/error-recovery';
import { EnhancedLoadingSpinner } from '@/components/ui/enhanced-loading-spinner';

type AssessmentStage = 'initial' | 'clarification' | 'confidence' | 'results';

export const IntegralAssessment: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<AssessmentStage>('initial');
  const [preliminaryScores, setPreliminaryScores] = useState<Record<string, number>>({});
  const [finalAssessment, setFinalAssessment] = useState<IntegralDetail | null>(null);
  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { assessments } = useAssessments();
  const { handleError, handleAsyncError } = useErrorHandler({
    showToast: true,
    onError: (error) => setError(error.message)
  });

  const handleInitialComplete = async (scores: Record<string, number>) => {
    await handleAsyncError(async () => {
      setIsLoading(true);
      setPreliminaryScores(scores);
      setCurrentStage('clarification');
      setError(null);
    }, 'Failed to proceed to clarification stage');
    setIsLoading(false);
  };

  const handleClarificationComplete = async (assessment: IntegralDetail) => {
    await handleAsyncError(async () => {
      setIsLoading(true);
      setFinalAssessment(assessment);
      setError(null);
      // Check if confidence enhancement is needed
      if (assessment.confidence < 75) {
        setCurrentStage('confidence');
      } else {
        setCurrentStage('results');
      }
    }, 'Failed to complete clarification stage');
    setIsLoading(false);
  };

  const handleConfidenceImproved = async (updatedAssessment: IntegralDetail) => {
    await handleAsyncError(async () => {
      setIsLoading(true);
      setFinalAssessment(updatedAssessment);
      setCurrentStage('results');
      setError(null);
    }, 'Failed to improve confidence');
    setIsLoading(false);
  };

  const handleSkipConfidence = () => {
    setCurrentStage('results');
  };

  // Load existing personality profile
  useEffect(() => {
    if (assessments.length > 0) {
      // Get the most recent personality assessment
      const latestAssessment = assessments[0];
      if (latestAssessment?.profile) {
        setPersonalityProfile(latestAssessment.profile);
      }
    }
  }, [assessments]);

  const handleRetakeAssessment = () => {
    setCurrentStage('initial');
    setPreliminaryScores({});
    setFinalAssessment(null);
  };

  const handleBackToSelection = () => {
    // Navigate back to main assessment selection
    window.location.href = '/';
  };

  const handleBackToInitial = () => {
    setCurrentStage('initial');
    setPreliminaryScores({});
    setFinalAssessment(null);
  };

  if (error) {
    return (
      <MobileResponsiveWrapper
        className="container mx-auto px-4 py-8"
        mobileClassName="px-2 py-4"
        enableTouchOptimization
      >
        <ErrorRecovery
          title="Assessment Error"
          message={error}
          onRetry={() => {
            setError(null);
            setCurrentStage('initial');
          }}
          onGoHome={() => window.location.href = '/'}
          variant="detailed"
        />
      </MobileResponsiveWrapper>
    );
  }

  if (isLoading) {
    return (
      <MobileResponsiveWrapper
        className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]"
        enableTouchOptimization
      >
        <EnhancedLoadingSpinner
          size="lg"
          variant="brain"
          message="Processing your assessment..."
        />
      </MobileResponsiveWrapper>
    );
  }

  switch (currentStage) {
    case 'initial':
      return (
        <MobileResponsiveWrapper
          enableTouchOptimization
          optimizeForOrientation
        >
          <IntegralInitialAssessment
            onComplete={handleInitialComplete}
            onBack={handleBackToSelection}
          />
        </MobileResponsiveWrapper>
      );

    case 'clarification':
      return (
        <MobileResponsiveWrapper
          enableTouchOptimization
          optimizeForOrientation
        >
          <IntegralSocraticClarification
            preliminaryScores={preliminaryScores}
            onComplete={handleClarificationComplete}
            onBack={handleBackToInitial}
          />
        </MobileResponsiveWrapper>
      );

    case 'confidence':
      return finalAssessment ? (
        <MobileResponsiveWrapper
          enableTouchOptimization
          optimizeForOrientation
        >
          <IntegralConfidenceEnhancement
            integralDetail={finalAssessment}
            personalityProfile={personalityProfile}
            onConfidenceImproved={handleConfidenceImproved}
            onSkip={handleSkipConfidence}
          />
        </MobileResponsiveWrapper>
      ) : (
        <MobileResponsiveWrapper className="container mx-auto px-4 py-8">
          <ErrorRecovery
            title="Assessment Data Missing"
            message="No assessment results available to enhance confidence"
            onRetry={handleBackToInitial}
            onGoHome={() => window.location.href = '/'}
          />
        </MobileResponsiveWrapper>
      );

    case 'results':
      return finalAssessment ? (
        <MobileResponsiveWrapper
          enableTouchOptimization
          optimizeForOrientation
        >
          <EnhancedIntegralResults
            integralDetail={finalAssessment}
            onRetakeAssessment={handleRetakeAssessment}
            onBackToSelection={handleBackToSelection}
            personalityProfile={personalityProfile}
          />
        </MobileResponsiveWrapper>
      ) : (
        <MobileResponsiveWrapper className="container mx-auto px-4 py-8">
          <ErrorRecovery
            title="Assessment Results Missing"
            message="No assessment results available to display"
            onRetry={handleBackToInitial}
            onGoHome={() => window.location.href = '/'}
          />
        </MobileResponsiveWrapper>
      );

    default:
      return (
        <MobileResponsiveWrapper className="container mx-auto px-4 py-8">
          <ErrorRecovery
            title="Invalid Assessment Stage"
            message="An unexpected error occurred in the assessment flow"
            onRetry={handleBackToInitial}
            onGoHome={() => window.location.href = '/'}
          />
        </MobileResponsiveWrapper>
      );
  }
};

export default IntegralAssessment;