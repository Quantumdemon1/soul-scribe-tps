import React, { useState, useEffect } from 'react';
import { IntegralInitialAssessment } from '@/components/assessment/IntegralInitialAssessment';
import { IntegralSocraticClarification } from '@/components/assessment/IntegralSocraticClarification';
import { IntegralConfidenceEnhancement } from '@/components/assessment/IntegralConfidenceEnhancement';
import { EnhancedIntegralResults } from '@/components/assessment/EnhancedIntegralResults';
import { IntegralDetail } from '@/mappings/integral.enhanced';
import { useAssessments } from '@/hooks/useAssessments';
import { PersonalityProfile } from '@/types/tps.types';

type AssessmentStage = 'initial' | 'clarification' | 'confidence' | 'results';

export const IntegralAssessment: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<AssessmentStage>('initial');
  const [preliminaryScores, setPreliminaryScores] = useState<Record<string, number>>({});
  const [finalAssessment, setFinalAssessment] = useState<IntegralDetail | null>(null);
  const [personalityProfile, setPersonalityProfile] = useState<PersonalityProfile | null>(null);
  const { assessments } = useAssessments();

  const handleInitialComplete = (scores: Record<string, number>) => {
    setPreliminaryScores(scores);
    setCurrentStage('clarification');
  };

  const handleClarificationComplete = (assessment: IntegralDetail) => {
    setFinalAssessment(assessment);
    // Check if confidence enhancement is needed
    if (assessment.confidence < 75) {
      setCurrentStage('confidence');
    } else {
      setCurrentStage('results');
    }
  };

  const handleConfidenceImproved = (updatedAssessment: IntegralDetail) => {
    setFinalAssessment(updatedAssessment);
    setCurrentStage('results');
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
  };

  switch (currentStage) {
    case 'initial':
      return (
        <IntegralInitialAssessment
          onComplete={handleInitialComplete}
          onBack={handleBackToSelection}
        />
      );

    case 'clarification':
      return (
        <IntegralSocraticClarification
          preliminaryScores={preliminaryScores}
          onComplete={handleClarificationComplete}
          onBack={handleBackToInitial}
        />
      );

    case 'confidence':
      return finalAssessment ? (
        <IntegralConfidenceEnhancement
          integralDetail={finalAssessment}
          personalityProfile={personalityProfile}
          onConfidenceImproved={handleConfidenceImproved}
          onSkip={handleSkipConfidence}
        />
      ) : (
        <div>Error: No assessment results available</div>
      );

    case 'results':
      return finalAssessment ? (
        <EnhancedIntegralResults
          integralDetail={finalAssessment}
          onRetakeAssessment={handleRetakeAssessment}
          onBackToSelection={handleBackToSelection}
          personalityProfile={personalityProfile}
        />
      ) : (
        <div>Error: No assessment results available</div>
      );

    default:
      return <div>Invalid assessment stage</div>;
  }
};

export default IntegralAssessment;