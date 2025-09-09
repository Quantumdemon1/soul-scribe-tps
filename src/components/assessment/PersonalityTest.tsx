import React, { useState, useEffect } from 'react';
import { Question } from './Question';
import { TPS_QUESTIONS } from '../../data/questions';
import { TPSScoring } from '../../utils/tpsScoring';
import { PersonalityProfile, TPSScores } from '../../types/tps.types';
import { AssessmentVariations } from '../../utils/assessmentVariations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PersonalityDashboard } from '../dashboard/PersonalityDashboard';
import { SocraticClarification } from './SocraticClarification';
import { ChevronLeft, ChevronRight, Brain, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAssessments } from '@/hooks/useAssessments';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTestSession } from '@/hooks/useTestSession';
import { useTestResultsTracking } from '@/hooks/useTestResultsTracking';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/structuredLogging';
import { useNavigate } from 'react-router-dom';

interface PersonalityTestProps {
  assessmentType?: string;
  onComplete?: (profile: PersonalityProfile) => void;
}

export const PersonalityTest: React.FC<PersonalityTestProps> = ({ assessmentType = 'full', onComplete }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [responses, setResponses] = useState<number[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const [showClarification, setShowClarification] = useState(false);
  const [initialScores, setInitialScores] = useState<any>(null);
  const { user } = useAuth();
  const { saveAssessment } = useAssessments();
  const { 
    currentSession, 
    createSession, 
    updateSession, 
    completeSession, 
    getActiveSession 
  } = useTestSession();
  const { startTest, updateTest, endTest } = useTestResultsTracking();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Enforce authentication requirement
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You must be signed in to take personality assessments. This ensures your progress is saved and you can access your results from any device.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/auth')} className="w-full">
                Sign In to Continue
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  // Initialize test session and responses
  useEffect(() => {
    const initializeTest = async () => {
      // Check for existing active session
      const activeSession = await getActiveSession(assessmentType);
      
      if (activeSession) {
        // Resume existing session
        setCurrentPage(activeSession.current_page);
        setResponses(activeSession.responses);
        toast({
          title: "Session Resumed",
          description: "Continuing from where you left off."
        });
      } else {
        // Create new session
        const session = await createSession(
          assessmentType,
          assessmentConfig.name,
          totalPages
        );
        
        if (session) {
          // Start test tracking
          await startTest(assessmentType, assessmentConfig.name);
          
          // Initialize responses
          const initialResponses = Array(assessmentConfig.questionCount).fill(5);
          setResponses(initialResponses);
          await updateSession(session.id, { responses: initialResponses });
        }
      }
    };

    if (user && assessmentConfig) {
      initializeTest();
    }
  }, [user, assessmentType, assessmentConfig, getActiveSession, createSession, startTest, updateSession, totalPages]);

  const handleResponseChange = async (questionIndex: number, value: number) => {
    const newResponses = [...responses];
    newResponses[questionIndex] = value;
    setResponses(newResponses);
    
    // Update session with new responses
    if (currentSession) {
      const completionPercentage = Math.round(((currentPage + 1) / totalPages) * 100);
      await updateSession(currentSession.id, { 
        responses: newResponses,
        completion_percentage: completionPercentage
      });
      
      // Update test tracking
      await updateTest(currentSession.session_token, {
        completion_percentage: completionPercentage,
        metadata: { lastQuestionAnswered: questionIndex }
      });
    }
  };

  const handleNext = async () => {
    if (currentPage < totalPages - 1) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      
      // Update session with new page
      if (currentSession) {
        const completionPercentage = Math.round((newPage / totalPages) * 100);
        await updateSession(currentSession.id, { 
          current_page: newPage,
          completion_percentage: completionPercentage
        });
      }
    } else {
      calculateResults();
    }
  };

  const handlePrevious = async () => {
    if (currentPage > 0) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      
      // Update session with new page
      if (currentSession) {
        const completionPercentage = Math.round((newPage / totalPages) * 100);
        await updateSession(currentSession.id, { 
          current_page: newPage,
          completion_percentage: completionPercentage
        });
      }
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

  const handleClarificationComplete = async (finalScores: TPSScores) => {
    // Adjust responses for shortened assessments
    const fullResponses = assessmentType === 'full' 
      ? responses 
      : AssessmentVariations.adjustScoring(responses, assessmentConfig);
    
    // Generate personality profile with final scores
    const personalityProfile = TPSScoring.generateFullProfileWithAdjustedScores(fullResponses, finalScores);
    setProfile(personalityProfile);
    setIsComplete(true);
    setShowClarification(false);
    
    // Complete session tracking
    if (currentSession) {
      await completeSession(currentSession.id, fullResponses);
      await endTest(currentSession.session_token, 'completed', {
        score: 100,
        completion_percentage: 100,
        metadata: { assessmentType, profile: personalityProfile }
      });
    }
    
    // Save to localStorage for immediate access
    localStorage.setItem('tps-profile', JSON.stringify(personalityProfile));
    
    // Save to Supabase
    try {
      await saveAssessment(personalityProfile, fullResponses, assessmentType);
      toast({
        title: "Assessment Complete",
        description: "Your personality profile has been saved successfully."
      });
    } catch (error) {
      logger.error('Failed to save assessment', {
        component: 'PersonalityTest',
        metadata: { error: error.message, assessmentType }
      });
      toast({
        title: "Save Error", 
        description: "Failed to save assessment. Your results are available locally.",
        variant: "destructive"
      });
    }
  };

  const currentQuestions = questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  // This useEffect must come before any early returns
  useEffect(() => {
    if (isComplete && profile && onComplete) {
      onComplete(profile);
    }
  }, [isComplete, profile, onComplete]);

  if (showClarification && initialScores) {
    return (
      <SocraticClarification 
        initialScores={initialScores}
        onComplete={handleClarificationComplete}
      />
    );
  }

  if (isComplete && profile && !onComplete) {
    return <PersonalityDashboard profile={profile} />;
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className={`${isMobile ? 'p-4' : 'p-6'} ${isMobile ? 'mb-4' : 'mb-8'}`}>
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
            <CardHeader className={`text-center ${isMobile ? 'pb-3 px-4 pt-4' : 'pb-4'}`}>
              <div className={`flex items-center justify-center ${isMobile ? 'mb-2' : 'mb-4'}`}>
                <Brain className={`${isMobile ? 'w-8 h-8 mr-2' : 'w-12 h-12 mr-3'}`} />
                <CardTitle className={`font-bold ${isMobile ? 'text-xl' : 'text-3xl'}`}>
                  {isMobile ? 'Psyforge Assessment' : 'Psyforge Personality Assessment'}
                </CardTitle>
              </div>
              <p className={`opacity-90 ${isMobile ? 'text-sm' : 'text-lg'}`}>
                {assessmentConfig.name}
              </p>
            </CardHeader>
            <CardContent className={`pt-0 ${isMobile ? 'px-4 pb-4' : ''}`}>
              <div className="space-y-3">
                <div className={`flex justify-between items-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  <span className="font-medium">Assessment Progress</span>
                  <span className="font-mono">
                    Question {(currentPage * questionsPerPage) + 1}-{Math.min((currentPage + 1) * questionsPerPage, assessmentConfig.questionCount)} of {assessmentConfig.questionCount}
                  </span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  className={`bg-primary-foreground/20 ${isMobile ? 'h-2.5' : 'h-3'}`}
                />
                <div className={`flex justify-between opacity-90 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  <span className="font-medium">{Math.round(progressPercentage)}% Complete</span>
                  <span>{assessmentConfig.questionCount - (currentPage * questionsPerPage + questionsPerPage)} questions remaining</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Questions */}
      <div className={`max-w-4xl mx-auto ${isMobile ? 'px-4 space-y-4' : 'space-y-6'}`}>
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
      <div className={`max-w-4xl mx-auto ${isMobile ? 'mt-6 px-4' : 'mt-8'}`}>
        {isMobile ? (
          // Mobile: Stack navigation vertically
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Page {currentPage + 1} of {totalPages}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handlePrevious}
                disabled={currentPage === 0}
                variant="outline"
                className="flex-1 h-12 touch-manipulation"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 h-12 touch-manipulation"
              >
                {currentPage === totalPages - 1 ? (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Results
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          // Desktop: Horizontal layout
          <div className="flex justify-between items-center">
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
        )}
      </div>

      {/* Instructions */}
      <div className={`max-w-4xl mx-auto ${isMobile ? 'mt-6 px-4' : 'mt-8'}`}>
        <Card className="bg-muted/50">
          <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
            <p className={`text-muted-foreground text-center ${isMobile ? 'text-xs leading-relaxed' : 'text-sm'}`}>
              <strong>Instructions:</strong> Rate each statement from 1 (Strongly Disagree) to 10 (Strongly Agree) based on how accurately it describes you. 
              {!isMobile && <br />}
              There are no right or wrong answers - be honest about your typical thoughts, feelings, and behaviors.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};