import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { TPSScores, PersonalityProfile } from '@/types/tps.types';
import { CuspAnalysis, ConversationTurn } from '@/types/llm.types';
import { SocraticClarificationService } from '@/services/socraticClarificationService';
import { useSocraticSession } from '@/hooks/useSocraticSession';
import { Loader2, MessageCircle, SkipForward, Save } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: PersonalityProfile;
  onProfileUpdate: (updatedProfile: PersonalityProfile) => void;
}

export const RefinementModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  profile, 
  onProfileUpdate 
}) => {
  const [cusps, setCusps] = useState<CuspAnalysis[]>([]);
  const [currentCuspIndex, setCurrentCuspIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const { toast } = useToast();
  const service = new SocraticClarificationService();
  const { currentSession, createSession, updateSession } = useSocraticSession();
  
  const initializeRefinement = async () => {
    setIsLoading(true);
    try {
      const detectedCusps = await service.analyzeCusps(profile.traitScores);
      setCusps(detectedCusps);
      
      if (detectedCusps.length === 0) {
        toast({
          title: "No refinement needed",
          description: "Your personality profile is already well-defined.",
        });
        onClose();
        return;
      }
      
      // Create a new session
      createSession(profile.traitScores, detectedCusps);
      setHasStarted(true);
    } catch (error) {
      console.error('Error initializing refinement:', error);
      toast({
        title: "Error",
        description: "Failed to initialize refinement.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStart = () => {
    initializeRefinement();
  };
  
  const currentCusp = cusps[currentCuspIndex];
  const currentQuestion = currentCusp?.clarificationQuestions?.[0];
  const progress = cusps.length > 0 ? ((currentCuspIndex + 1) / cusps.length) * 100 : 0;
  
  const handleSubmitResponse = async () => {
    if (!currentQuestion || !userResponse.trim() || !currentSession) return;
    
    setIsProcessing(true);
    
    try {
      // Process response and get trait adjustments
      const adjustments = await service.processClarificationResponse(
        currentQuestion,
        userResponse,
        currentCusp
      );
      
      // Update scores
      const newScores = { ...currentSession.finalScores };
      Object.entries(adjustments).forEach(([trait, adjustment]) => {
        newScores[trait] = Math.max(1, Math.min(10, newScores[trait] + adjustment));
      });
      
      // Create conversation turn
      const newTurn: ConversationTurn = {
        question: currentQuestion,
        response: userResponse,
        traitAdjustments: adjustments
      };
      
      const updatedConversations = [...currentSession.conversations, newTurn];
      
      // Update session
      await updateSession(currentSession.id, {
        finalScores: newScores,
        conversations: updatedConversations
      });
      
      // Move to next cusp or complete
      if (currentCuspIndex < cusps.length - 1) {
        setCurrentCuspIndex(currentCuspIndex + 1);
        setUserResponse('');
      } else {
        // Complete refinement
        const updatedProfile = {
          ...profile,
          traitScores: newScores
        };
        onProfileUpdate(updatedProfile);
        toast({
          title: "Refinement complete",
          description: "Your personality profile has been updated with your refined answers.",
        });
        onClose();
      }
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
  
  const handleSaveProgress = async () => {
    if (!currentSession) return;
    
    try {
      // Save current progress
      localStorage.setItem('refinement_progress', JSON.stringify({
        sessionId: currentSession.id,
        cuspIndex: currentCuspIndex,
        response: userResponse
      }));
      
      toast({
        title: "Progress saved",
        description: "You can continue where you left off later.",
      });
      onClose();
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: "Error",
        description: "Failed to save progress.",
        variant: "destructive"
      });
    }
  };
  
  const handleSkip = () => {
    if (currentCuspIndex < cusps.length - 1) {
      setCurrentCuspIndex(currentCuspIndex + 1);
      setUserResponse('');
    } else {
      onClose();
    }
  };
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && !hasStarted) {
      setCurrentCuspIndex(0);
      setUserResponse('');
      setHasStarted(false);
      setCusps([]);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Refine Your Results
          </DialogTitle>
          <DialogDescription>
            Let's clarify some close personality traits to make your profile even more accurate.
          </DialogDescription>
        </DialogHeader>
        
        {!hasStarted ? (
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground">
              I've identified some areas where your personality traits are very close. 
              A few targeted questions can help refine your results for greater accuracy.
            </p>
            <Button onClick={handleStart} disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Refinement
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Question {currentCuspIndex + 1} of {cusps.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            {/* Current Traits Being Clarified */}
            <Card className="border-muted/50">
              <CardContent className="pt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
                  Clarifying: {currentCusp?.triad}
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {currentCusp?.traits.map((trait, i) => (
                    <div key={trait} className="text-center">
                      <div className="text-xs font-medium">{trait}</div>
                      <div className="text-lg font-bold">
                        {currentCusp.scores[i].toFixed(1)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Question */}
            <Card className="border-primary/30">
              <CardContent className="pt-4">
                <p className="text-base leading-relaxed">
                  {currentQuestion}
                </p>
              </CardContent>
            </Card>
            
            <Textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              className="min-h-[100px] resize-none"
              placeholder="Share your thoughts... be authentic."
              disabled={isProcessing}
            />
            
            {/* Actions */}
            <div className="flex justify-between gap-2">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="gap-2"
                >
                  <SkipForward className="h-4 w-4" />
                  Skip
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSaveProgress}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Progress
                </Button>
              </div>
              
              <Button
                onClick={handleSubmitResponse}
                disabled={!userResponse.trim() || isProcessing}
                className="gap-2"
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                {currentCuspIndex === cusps.length - 1 ? 'Complete' : 'Continue'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};