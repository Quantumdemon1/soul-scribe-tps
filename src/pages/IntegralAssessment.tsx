import React, { useState } from 'react';
import { IntegralInitialAssessment } from '@/components/assessment/IntegralInitialAssessment';
import { IntegralSocraticClarification } from '@/components/assessment/IntegralSocraticClarification';
import { IntegralResults } from '@/components/assessment/IntegralResults';
import { IntegralDetail } from '@/mappings/integral.enhanced';

type AssessmentStage = 'initial' | 'clarification' | 'results';

export const IntegralAssessment: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<AssessmentStage>('initial');
  const [preliminaryScores, setPreliminaryScores] = useState<Record<string, number>>({});
  const [finalAssessment, setFinalAssessment] = useState<IntegralDetail | null>(null);

  const handleInitialComplete = (scores: Record<string, number>) => {
    setPreliminaryScores(scores);
    setCurrentStage('clarification');
  };

  const handleClarificationComplete = (assessment: IntegralDetail) => {
    setFinalAssessment(assessment);
    setCurrentStage('results');
  };

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

    case 'results':
      return finalAssessment ? (
        <IntegralResults
          integralDetail={finalAssessment}
          onRetakeAssessment={handleRetakeAssessment}
          onBackToSelection={handleBackToSelection}
        />
      ) : (
        <div>Error: No assessment results available</div>
      );

    default:
      return <div>Invalid assessment stage</div>;
  }
};

export default IntegralAssessment;