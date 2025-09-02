import React, { useState, useEffect } from 'react';
import { Question } from './Question';
import { TPS_QUESTIONS } from '../../data/questions';
import { TPSScoring } from '../../utils/tpsScoring';
import { PersonalityProfile } from '../../types/tps.types';
import { AssessmentVariations } from '../../utils/assessmentVariations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PersonalityDashboard } from '../dashboard/PersonalityDashboard';
import { SocraticClarification } from './SocraticClarification';
import { ChevronLeft, ChevronRight, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAssessments } from '@/hooks/useAssessments';
import { toast } from '@/hooks/use-toast';

interface PersonalityTestProps {
  assessmentType?: string;
}

export const PersonalityTest: React.FC<PersonalityTestProps> = ({ assessmentType = 'full' }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [responses, setResponses] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const [showClarification, setShowClarification] = useState(false);
  const [initialScores, setInitialScores] = useState<any>(null);
  const { user } = useAuth();
  const { saveAssessment } = useAssessments();

  // Get assessment configuration
  const assessmentConfig = React.useMemo(() => {
    switch (assessmentType) {
      case 'quick':
        return AssessmentVariations.getQuickAssessmentConfig();
      case 'mini':
        return AssessmentVariations.getMiniAssessmentConfig();
      default:
        return {
          name: 'Complete Assessment',
          description: 'Comprehensive 108-question assessment for maximum accuracy',
          questionCount: 108,
          estimatedTime: '20-25 minutes',
          questions: Array.from({ length: 108 }, (_, i) => i + 1)
        };
    }
  }, [assessmentType]);

  const questions = React.useMemo(() => {
    return assessmentConfig.questions.map(index => TPS_QUESTIONS[index - 1]);
  }, [assessmentConfig]);

  const questionsPerPage = 6;
  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const progressPercentage = ((currentPage + 1) / totalPages) * 100;

  // Initialize responses array with correct length
  useEffect(() => {
    if (responses.length === 0) {
      setResponses(Array(assessmentConfig.questionCount).fill(5));
    }
  }, [assessmentConfig.questionCount, responses.length]);

  // Load saved responses from localStorage
  useEffect(() => {
    const storageKey = `tps-responses-${assessmentType}`;
    const pageKey = `tps-current-page-${assessmentType}`;
    
    const savedResponses = localStorage.getItem(storageKey);
    const savedPage = localStorage.getItem(pageKey);
    
    if (savedResponses) {
      const parsed = JSON.parse(savedResponses);
      if (parsed.length === assessmentConfig.questionCount) {
        setResponses(parsed);
      }
    }
    if (savedPage) {
      setCurrentPage(parseInt(savedPage));
    }
  }, [assessmentType, assessmentConfig.questionCount]);

  // Save responses to localStorage
  useEffect(() => {
    if (responses.length > 0) {
      const storageKey = `tps-responses-${assessmentType}`;
      const pageKey = `tps-current-page-${assessmentType}`;
      localStorage.setItem(storageKey, JSON.stringify(responses));
      localStorage.setItem(pageKey, currentPage.toString());
    }
  }, [responses, currentPage, assessmentType]);

  const handleResponseChange = (questionIndex: number, value: number) => {
    const newResponses = [...responses];
    newResponses[questionIndex] = value;
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const calculateResults = async () => {
    // Adjust responses for shortened assessments
    const fullResponses = assessmentType === 'full' 
      ? responses 
      : AssessmentVariations.adjustScoring(responses, assessmentConfig);

    // Calculate initial trait scores for cusp detection
    const scores = TPSScoring.calculateTraitScores(fullResponses);
    setInitialScores(scores);
    setShowClarification(true);
  };

  const handleClarificationComplete = async (finalScores: any) => {
    // Adjust responses for shortened assessments
    const fullResponses = assessmentType === 'full' 
      ? responses 
      : AssessmentVariations.adjustScoring(responses, assessmentConfig);
    
    // Generate personality profile with final scores
    const personalityProfile = TPSScoring.generateFullProfileWithAdjustedScores(fullResponses, finalScores);
    setProfile(personalityProfile);
    setIsComplete(true);
    setShowClarification(false);
    
    // Save to localStorage for immediate access
    localStorage.setItem('tps-profile', JSON.stringify(personalityProfile));
    localStorage.removeItem(`tps-responses-${assessmentType}`);
    localStorage.removeItem(`tps-current-page-${assessmentType}`);

    // Save to Supabase if user is authenticated
    if (user) {
      try {
        await saveAssessment(personalityProfile, fullResponses, assessmentType);
      } catch (error) {
        // Error handling is done in useAssessments hook
        console.log('Assessment not saved to cloud, but available locally');
      }
    } else {
      toast({
        title: "Profile Complete",
        description: "Sign in to save your profile and access it from any device."
      });
    }
  };

  const currentQuestions = questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  if (showClarification && initialScores) {
    return (
      <SocraticClarification 
        initialScores={initialScores}
        onComplete={handleClarificationComplete}
      />
    );
  }

  if (isComplete && profile) {
    return <PersonalityDashboard profile={profile} />;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <Brain className="w-12 h-12 mr-3" />
              <CardTitle className="text-3xl font-bold">
                Triadic Personality System
              </CardTitle>
            </div>
            <p className="text-lg opacity-90">
              {assessmentConfig.name}
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span>Progress</span>
                <span>{currentPage + 1} of {totalPages} pages</span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-3 bg-primary-foreground/20"
              />
              <div className="flex justify-between text-sm opacity-90">
                <span>{Math.round(progressPercentage)}% Complete</span>
                <span>{assessmentConfig.questionCount - (currentPage * questionsPerPage)} questions remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions */}
      <div className="max-w-4xl mx-auto space-y-6">
        {currentQuestions.map((question, idx) => {
          const globalIdx = currentPage * questionsPerPage + idx;
          return (
            <Question
              key={globalIdx}
              question={question}
              questionNumber={globalIdx + 1}
              value={responses[globalIdx]}
              onChange={(value) => handleResponseChange(globalIdx, value)}
            />
          );
        })}
      </div>

      {/* Navigation */}
      <div className="max-w-4xl mx-auto mt-8 flex justify-between items-center">
        <Button
          onClick={handlePrevious}
          disabled={currentPage === 0}
          variant="outline"
          className="px-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages}
          </p>
        </div>

        <Button
          onClick={handleNext}
          className="px-6"
        >
          {currentPage === totalPages - 1 ? (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Calculate Results
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto mt-8">
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              <strong>Instructions:</strong> Rate each statement from 1 (Strongly Disagree) to 10 (Strongly Agree) based on how accurately it describes you. 
              There are no right or wrong answers - be honest about your typical thoughts, feelings, and behaviors.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};