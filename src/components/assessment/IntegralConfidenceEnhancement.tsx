import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, Target, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { IntegralDetail } from '@/mappings/integral.enhanced';
import { PersonalityProfile } from '@/types/tps.types';
import { IntegralConfidenceService, ConfidenceAnalysis, DynamicQuestion } from '@/services/integralConfidenceService';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { EnhancedLoadingSpinner } from '@/components/ui/enhanced-loading-spinner';
import { ErrorRecovery } from '@/components/ui/error-recovery';

interface IntegralConfidenceEnhancementProps {
  integralDetail: IntegralDetail;
  personalityProfile?: PersonalityProfile;
  onConfidenceImproved: (updatedAssessment: IntegralDetail) => void;
  onSkip: () => void;
}

export const IntegralConfidenceEnhancement: React.FC<IntegralConfidenceEnhancementProps> = ({
  integralDetail,
  personalityProfile,
  onConfidenceImproved,
  onSkip
}) => {
  const [confidenceService] = useState(() => new IntegralConfidenceService());
  const [analysis, setAnalysis] = useState<ConfidenceAnalysis | null>(null);
  const [questions, setQuestions] = useState<DynamicQuestion[]>([]);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { handleAsyncError } = useErrorHandler();

  useEffect(() => {
    initializeConfidenceAnalysis();
  }, [integralDetail]);

  const initializeConfidenceAnalysis = async () => {
    await handleAsyncError(async () => {
      setIsLoading(true);
      setError(null);
      
      const confidenceAnalysis = confidenceService.analyzeConfidence(integralDetail);
      setAnalysis(confidenceAnalysis);

      if (confidenceAnalysis.needsAdditionalQuestions) {
        const generatedQuestions = await confidenceService.generateClarificationQuestions(
          integralDetail,
          confidenceAnalysis.uncertainAreas,
          personalityProfile
        );
        setQuestions(generatedQuestions);
      }
    }, 'Failed to analyze confidence. Please try again.');
    
    setIsLoading(false);
  };

  const handleResponseChange = (questionId: string, response: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: response
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleProcessResponses = async () => {
    const result = await handleAsyncError(async () => {
      setIsProcessing(true);
      const updatedAssessment = await confidenceService.processConfidenceEnhancement(
        integralDetail,
        responses,
        questions
      );
      
      toast({
        title: 'Confidence Enhanced!',
        description: `Your assessment confidence improved to ${Math.round(updatedAssessment.confidence)}%`,
      });
      
      onConfidenceImproved(updatedAssessment);
      return updatedAssessment;
    }, 'Failed to process responses. Please try again.');
    
    setIsProcessing(false);
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'scenario': return <Target className="w-4 h-4" />;
      case 'values': return <Brain className="w-4 h-4" />;
      case 'behavior': return <TrendingUp className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getQuestionTypeBadge = (type: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      scenario: 'default',
      values: 'secondary',
      behavior: 'outline',
      preference: 'outline'
    };
    return variants[type] || 'outline';
  };

  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <ErrorRecovery
          title="Analysis Failed"
          message="We couldn't analyze your assessment confidence. Please try again."
          onRetry={initializeConfidenceAnalysis}
          onGoBack={onSkip}
          variant="detailed"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <EnhancedLoadingSpinner
          variant="brain"
          size="lg"
          message="Analyzing assessment confidence and determining enhancement needs..."
        />
      </div>
    );
  }

  if (!analysis?.needsAdditionalQuestions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Assessment Complete</h3>
            <p className="text-muted-foreground mb-4">
              Your assessment has sufficient confidence ({Math.round(integralDetail.confidence)}%). 
              No additional questions needed.
            </p>
            <Button onClick={onSkip} className="w-full">
              Continue to Results
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const allQuestionsAnswered = questions.every(q => responses[q.id]?.trim());
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary mr-2 sm:mr-3" />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Confidence Enhancement
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground px-2">
            Let's ask a few targeted questions to increase your assessment confidence
          </p>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </CardContent>
        </Card>

        {/* Current Confidence Analysis */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
              Current Assessment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {Math.round(integralDetail.confidence)}%
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Current Confidence</div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  Level {integralDetail.primaryLevel.number}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {integralDetail.primaryLevel.color}
                </div>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-xl sm:text-2xl font-bold text-primary">
                  {analysis?.uncertainAreas.length || 0}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Areas to Clarify</div>
              </div>
            </div>
            
            {analysis?.uncertainAreas && analysis.uncertainAreas.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Areas needing clarification:</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.uncertainAreas.map((area, index) => (
                    <Badge key={index} variant="outline">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Question */}
        {currentQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getQuestionTypeIcon(currentQuestion.type)}
                  Question {currentQuestionIndex + 1}
                </CardTitle>
                <Badge variant={getQuestionTypeBadge(currentQuestion.type)}>
                  {currentQuestion.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-lg">{currentQuestion.question}</p>
                
                {currentQuestion.context && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Context:</strong> {currentQuestion.context}
                    </p>
                  </div>
                )}

                <Textarea
                  placeholder="Share your thoughts and perspective..."
                  value={responses[currentQuestion.id] || ''}
                  onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-2 order-2 sm:order-1">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              size="sm"
              className="w-full sm:w-auto"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={onSkip}
              size="sm"
              className="w-full sm:w-auto"
            >
              Skip Enhancement
            </Button>
          </div>

          <div className="flex gap-2 order-1 sm:order-2">
            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                onClick={handleNextQuestion}
                disabled={!responses[currentQuestion?.id]?.trim()}
                size="sm"
                className="w-full sm:w-auto"
              >
                <span className="hidden sm:inline">Next Question</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="w-4 h-4 ml-1 sm:ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleProcessResponses}
                disabled={!allQuestionsAnswered || isProcessing}
                size="sm"
                className="w-full sm:w-auto"
              >
                <span className="hidden sm:inline">{isProcessing ? 'Processing...' : 'Enhance Confidence'}</span>
                <span className="sm:hidden">{isProcessing ? 'Processing...' : 'Enhance'}</span>
                <TrendingUp className="w-4 h-4 ml-1 sm:ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};