import React, { useState, useEffect } from 'react';
import { Question } from './Question';
import { TPS_QUESTIONS } from '../../data/questions';
import { TPSScoring } from '../../utils/tpsScoring';
import { PersonalityProfile } from '../../types/tps.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PersonalityDashboard } from '../dashboard/PersonalityDashboard';
import { ChevronLeft, ChevronRight, Brain } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAssessments } from '@/hooks/useAssessments';
import { toast } from '@/hooks/use-toast';

export const PersonalityTest: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [responses, setResponses] = useState<number[]>(Array(108).fill(5));
  const [isComplete, setIsComplete] = useState(false);
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const { user } = useAuth();
  const { saveAssessment } = useAssessments();

  const questionsPerPage = 6;
  const totalPages = Math.ceil(TPS_QUESTIONS.length / questionsPerPage);
  const progressPercentage = ((currentPage + 1) / totalPages) * 100;

  // Load saved responses from localStorage
  useEffect(() => {
    const savedResponses = localStorage.getItem('tps-responses');
    const savedPage = localStorage.getItem('tps-current-page');
    
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses));
    }
    if (savedPage) {
      setCurrentPage(parseInt(savedPage));
    }
  }, []);

  // Save responses to localStorage
  useEffect(() => {
    localStorage.setItem('tps-responses', JSON.stringify(responses));
    localStorage.setItem('tps-current-page', currentPage.toString());
  }, [responses, currentPage]);

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
    const personalityProfile = TPSScoring.generateFullProfile(responses);
    setProfile(personalityProfile);
    setIsComplete(true);
    
    // Save to localStorage for immediate access
    localStorage.setItem('tps-profile', JSON.stringify(personalityProfile));
    localStorage.removeItem('tps-responses');
    localStorage.removeItem('tps-current-page');

    // Save to Supabase if user is authenticated
    if (user) {
      try {
        await saveAssessment(personalityProfile, responses, 'full');
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

  const currentQuestions = TPS_QUESTIONS.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

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
              Comprehensive Personality Assessment
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
                <span>{108 - (currentPage * questionsPerPage)} questions remaining</span>
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