import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { INTEGRAL_QUESTIONS, calculateIntegralScores } from '@/data/integralQuestions';
import { logScoringDetails, explainScores } from '@/utils/integralValidation';
import { ChevronLeft, ChevronRight, Brain } from 'lucide-react';

interface IntegralInitialAssessmentProps {
  onComplete: (scores: Record<string, number>) => void;
  onBack: () => void;
}

export const IntegralInitialAssessment: React.FC<IntegralInitialAssessmentProps> = ({
  onComplete,
  onBack
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  
  const questionsPerPage = 3;
  const totalPages = Math.ceil(INTEGRAL_QUESTIONS.length / questionsPerPage);
  const currentQuestions = INTEGRAL_QUESTIONS.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );
  
  const progress = ((currentPage + 1) / totalPages) * 100;
  const canProceed = currentQuestions.every(q => responses.hasOwnProperty(q.id));
  const isLastPage = currentPage === totalPages - 1;

  const handleAnswerSelect = (questionId: number, answerIndex: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleNext = () => {
    if (isLastPage) {
      const scores = calculateIntegralScores(responses);
      
      // Log scoring details for debugging
      logScoringDetails('Initial Assessment Complete', scores);
      console.log('🎓 Score Explanation:', explainScores(scores));
      
      onComplete(scores);
    } else {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-primary mr-3" />
            <h1 className="text-3xl font-bold text-foreground">
              Integral Level Assessment
            </h1>
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            Discover your cognitive development level through the lens of Integral Theory
          </p>
          
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Page {currentPage + 1} of {totalPages}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {currentQuestions.map((question) => (
            <Card key={question.id} className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                    {question.id}
                  </span>
                  <span className="flex-1">{question.question}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={responses[question.id]?.toString() || ""}
                  onValueChange={(value) => handleAnswerSelect(question.id, parseInt(value))}
                  className="space-y-3"
                >
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem 
                        value={index.toString()} 
                        id={`q${question.id}-${index}`}
                        className="mt-0.5"
                      />
                      <Label 
                        htmlFor={`q${question.id}-${index}`}
                        className="flex-1 cursor-pointer text-sm leading-relaxed"
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {currentPage === 0 ? 'Back to Selection' : 'Previous'}
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Questions answered: {Object.keys(responses).length} / {INTEGRAL_QUESTIONS.length}
          </div>
          
          <Button 
            onClick={handleNext}
            disabled={!canProceed}
            className="flex items-center gap-2"
          >
            {isLastPage ? 'Complete Assessment' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};