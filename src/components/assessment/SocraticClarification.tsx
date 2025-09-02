import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { TPSScores } from '@/types/tps.types';
import { CuspAnalysis, ConversationTurn } from '@/types/llm.types';
import { SocraticClarificationService } from '@/services/socraticClarificationService';
import { Loader2, MessageCircle, SkipForward } from 'lucide-react';

interface Props {
  initialScores: TPSScores;
  onComplete: (finalScores: TPSScores) => void;
}

export const SocraticClarification: React.FC<Props> = ({ initialScores, onComplete }) => {
  const [cusps, setCusps] = useState<CuspAnalysis[]>([]);
  const [currentCuspIndex, setCurrentCuspIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [userResponse, setUserResponse] = useState('');
  const [adjustedScores, setAdjustedScores] = useState(initialScores);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  const service = new SocraticClarificationService();
  
  useEffect(() => {
    initializeClarification();
  }, []);
  
  const initializeClarification = async () => {
    try {
      const detectedCusps = await service.analyzeCusps(initialScores);
      setCusps(detectedCusps);
      
      if (detectedCusps.length === 0) {
        // No cusps detected, skip clarification
        onComplete(initialScores);
        return;
      }
    } catch (error) {
      console.error('Error initializing clarification:', error);
      toast({
        title: "Error",
        description: "Failed to initialize clarification. Proceeding with original results.",
        variant: "destructive"
      });
      onComplete(initialScores);
    } finally {
      setIsLoading(false);
    }
  };
  
  const currentCusp = cusps[currentCuspIndex];
  const currentQuestion = currentCusp?.clarificationQuestions?.[currentQuestionIndex];
  
  const handleSubmitResponse = async () => {
    if (!currentQuestion || !userResponse.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // Process response and get trait adjustments
      const adjustments = await service.processClarificationResponse(
        currentQuestion,
        userResponse,
        currentCusp
      );
      
      // Update scores
      const newScores = { ...adjustedScores };
      Object.entries(adjustments).forEach(([trait, adjustment]) => {
        newScores[trait] = Math.max(1, Math.min(10, newScores[trait] + adjustment));
      });
      setAdjustedScores(newScores);
      
      // Save conversation turn
      const newTurn: ConversationTurn = {
        question: currentQuestion,
        response: userResponse,
        traitAdjustments: adjustments
      };
      setConversation([...conversation, newTurn]);
      
      // Move to next question or cusp
      if (currentQuestionIndex < (currentCusp.clarificationQuestions?.length || 0) - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (currentCuspIndex < cusps.length - 1) {
        setCurrentCuspIndex(currentCuspIndex + 1);
        setCurrentQuestionIndex(0);
      } else {
        // All clarifications complete
        onComplete(newScores);
        return;
      }
      
      setUserResponse('');
    } catch (error) {
      console.error('Error processing response:', error);
      toast({
        title: "Error",
        description: "Failed to process your response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const progress = cusps.length > 0 
    ? ((currentCuspIndex * 3 + currentQuestionIndex + 1) / (cusps.length * 3)) * 100
    : 0;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Analyzing your responses...</p>
        </div>
      </div>
    );
  }
  
  if (cusps.length === 0) {
    return null; // Component handles this in initializeClarification
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="border-primary/20 bg-background/95 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <CardTitle>Let's Refine Your Results</CardTitle>
          </div>
          <CardDescription>
            Your responses show some traits that are very close. Let me ask a few questions to better understand your preferences.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Current Traits Being Clarified */}
          <Card className="border-muted/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Currently clarifying: {currentCusp?.triad}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentCusp?.traits.map((trait, i) => (
                  <div key={trait} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{trait}</span>
                      <span className="text-xs text-muted-foreground">
                        {currentCusp.scores[i].toFixed(1)}
                      </span>
                    </div>
                    <Progress 
                      value={currentCusp.scores[i] * 10} 
                      className="h-1"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Question */}
          <div className="space-y-4">
            <Card className="border-primary/30">
              <CardContent className="pt-6">
                <p className="text-lg leading-relaxed">
                  {currentQuestion}
                </p>
              </CardContent>
            </Card>
            
            <Textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              className="min-h-[120px] resize-none"
              placeholder="Share your thoughts... There's no right or wrong answer, just be authentic."
              disabled={isProcessing}
            />
          </div>
          
          {/* Previous Responses */}
          {conversation.length > 0 && (
            <details className="cursor-pointer">
              <summary className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                View previous responses ({conversation.length})
              </summary>
              <div className="mt-4 space-y-3">
                {conversation.slice(-3).map((turn, i) => (
                  <Card key={i} className="border-muted/30 bg-muted/20">
                    <CardContent className="pt-4 space-y-2">
                      <p className="text-xs text-muted-foreground">Q: {turn.question}</p>
                      <p className="text-sm">{turn.response}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </details>
          )}
          
          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={() => onComplete(adjustedScores)}
              className="gap-2"
            >
              <SkipForward className="h-4 w-4" />
              Skip Clarification
            </Button>
            
            <Button
              onClick={handleSubmitResponse}
              disabled={!userResponse.trim() || isProcessing}
              className="gap-2"
            >
              {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
              {isProcessing ? 'Processing...' : 'Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};