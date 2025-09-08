import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { Brain, Send, MessageSquare, User, Bot, ChevronLeft, Plus, Sparkles } from 'lucide-react';
import { MentorService, MentorConversation, MentorMessage } from '@/services/mentorService';
import { ConversationStarters } from '@/components/mentor/ConversationStarters';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { PersonalityProfile } from '@/types/tps.types';
import { useAssessments } from '@/hooks/useAssessments';
import { supabase } from '@/integrations/supabase/client';
import { IntegralLevelBadge } from '@/components/dashboard/IntegralLevelBadge';
import { MobileResponsiveWrapper } from '@/components/ui/mobile-responsive-wrapper';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ErrorRecovery } from '@/components/ui/error-recovery';
import { logger } from '@/utils/structuredLogging';
import { EnhancedLoadingSpinner } from '@/components/ui/enhanced-loading-spinner';

interface AIMentorProps {
  initialProfile?: PersonalityProfile;
}

export const AIMentor: React.FC<AIMentorProps> = ({ initialProfile }) => {
  const [conversations, setConversations] = useState<MentorConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<MentorConversation | null>(null);
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const mentorService = new MentorService();
  const { assessments } = useAssessments();
  const { handleError, handleAsyncError } = useErrorHandler({
    showToast: true,
    onError: (error) => setError(error.message)
  });

  // Get the latest assessment profile if no initial profile provided
  const profile = initialProfile || (assessments.length > 0 ? assessments[0].profile : null);

  useEffect(() => {
    loadConversations();
    
    // Set up real-time subscriptions for messages
    const channel = supabase
      .channel('mentor-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mentor_messages',
          filter: currentConversation ? `conversation_id=eq.${currentConversation.id}` : undefined
        },
        (payload) => {
          if (currentConversation && payload.new.conversation_id === currentConversation.id) {
            setMessages(prev => [...prev, payload.new as MentorMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const data = await mentorService.getConversations();
      setConversations(data);
    } catch (error) {
      logger.error('Failed to load mentor conversations', {
        component: 'AIMentor',
        action: 'loadConversations'
      }, error as Error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const startNewConversation = async () => {
    if (!profile) {
      toast({
        title: 'No Personality Profile',
        description: 'Please complete a personality assessment first',
        variant: 'destructive'
      });
      return;
    }

    try {
      const latestAssessment = assessments.length > 0 ? assessments[0] : null;
      const newConversation = await mentorService.createConversation(
        latestAssessment?.id,
        `Chat ${new Date().toLocaleDateString()}`
      );
      
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      setMessages([]);
      setShowSidebar(false);
    } catch (error) {
      logger.error('Failed to create mentor conversation', {
        component: 'AIMentor',
        action: 'createConversation'
      }, error as Error);
      toast({
        title: 'Error',
        description: 'Failed to create new conversation',
        variant: 'destructive'
      });
    }
  };

  const selectConversation = async (conversation: MentorConversation) => {
    try {
      setCurrentConversation(conversation);
      const conversationMessages = await mentorService.getMessages(conversation.id);
      setMessages(conversationMessages);
      setShowSidebar(false);
    } catch (error) {
      logger.error('Failed to load mentor messages', {
        component: 'AIMentor',
        action: 'loadMessages'
      }, error as Error);
      toast({
        title: 'Error',
        description: 'Failed to load conversation',
        variant: 'destructive'
      });
    }
  };

  const sendMessage = async (messageText?: string) => {
    const messageToSend = messageText || inputMessage.trim();
    if (!messageToSend || !currentConversation || !profile) return;

    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await mentorService.generateMentorResponse(
        currentConversation.id,
        messageToSend,
        profile
      );

      // Messages will be updated via real-time subscription
      // But let's also manually reload to ensure consistency
      const updatedMessages = await mentorService.getMessages(currentConversation.id);
      setMessages(updatedMessages);
    } catch (error) {
      logger.error('Failed to send mentor message', {
        component: 'AIMentor',
        action: 'sendMessage'
      }, error as Error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarterConversation = async (topic: string, message: string) => {
    if (!profile) return;
    
    try {
      const latestAssessment = assessments.length > 0 ? assessments[0] : null;
      const newConversation = await mentorService.createConversation(
        latestAssessment?.id,
        topic
      );
      
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      setMessages([]);
      setShowSidebar(false);
      
      // Send the starter message
      setTimeout(() => sendMessage(message), 500);
    } catch (error) {
      logger.error('Failed to start mentor conversation', {
        component: 'AIMentor',
        action: 'startConversation'
      }, error as Error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation',
        variant: 'destructive'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (error) {
    return (
      <MobileResponsiveWrapper
        className="container mx-auto px-4 py-8"
        mobileClassName="px-2 py-4"
        enableTouchOptimization
      >
        <ErrorRecovery
          title="AI Mentor Error"
          message={error}
          onRetry={() => {
            setError(null);
            loadConversations();
          }}
          onGoHome={() => window.location.href = '/'}
          variant="detailed"
        />
      </MobileResponsiveWrapper>
    );
  }

  if (!profile) {
    return (
      <MobileResponsiveWrapper
        className="container mx-auto px-4 py-8"
        mobileClassName="px-2 py-4"
        enableTouchOptimization
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Brain className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Personality Profile Found</h2>
            <p className="text-muted-foreground text-center mb-6">
              You need to complete a personality assessment before you can chat with your AI mentor.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Take Assessment
            </Button>
          </CardContent>
        </Card>
      </MobileResponsiveWrapper>
    );
  }

  return (
    <MobileResponsiveWrapper
      enableTouchOptimization
      optimizeForOrientation
    >
      <div className="flex h-[calc(100vh-4rem)] sm:h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className={`${showSidebar ? 'w-80 sm:w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r bg-background`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">AI Mentor</h2>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={startNewConversation}
              disabled={!profile}
            >
              <Plus className="w-4 h-4 mr-1" />
              New Chat
            </Button>
          </div>

          {/* Personality Summary */}
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Your Personality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{profile.mappings.mbti}</Badge>
                <Badge variant="outline">{profile.mappings.enneagram}</Badge>
                {(profile.mappings as any).integralDetail && (
                  <IntegralLevelBadge 
                    level={(profile.mappings as any).integralDetail.primaryLevel}
                    size="sm"
                    showName={false}
                  />
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Dominant Traits: {Object.values(profile.dominantTraits).join(', ')}
              </div>
              {(profile.mappings as any).integralDetail && (
                <div className="text-xs text-muted-foreground">
                  Level: {(profile.mappings as any).integralDetail.primaryLevel.name}
                </div>
              )}
            </CardContent>
          </Card>

          <Separator className="mb-4" />

          {/* Conversations List */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Recent Conversations</h3>
            {isLoadingConversations ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="sm" />
              </div>
            ) : conversations.length > 0 ? (
              <div className="space-y-1">
                {conversations.map(conversation => (
                  <Button
                    key={conversation.id}
                    variant={currentConversation?.id === conversation.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => selectConversation(conversation)}
                  >
                    <div className="truncate">
                      <div className="text-sm font-medium truncate">{conversation.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(conversation.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No conversations yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? <ChevronLeft className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            </Button>
            <Brain className="w-5 h-5 text-primary" />
            <div>
              <h1 className="font-semibold">AI Personality Mentor</h1>
              <p className="text-sm text-muted-foreground">
                {currentConversation ? currentConversation.title : 'Your personal guide based on your personality profile'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {currentConversation ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Welcome to your AI Mentor!</h3>
                  <p className="text-muted-foreground">
                    I'm here to help you understand your personality and provide personalized guidance.
                    What would you like to explore today?
                  </p>
                </div>
              ) : (
                messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <MarkdownRenderer content={message.content} className="text-sm" />
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <LoadingSpinner size="sm" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Welcome section with conversation starters */}
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Welcome to your AI Mentor!</h3>
                <p className="text-muted-foreground mb-6">
                  I'm here to help you understand your personality and provide personalized guidance.
                  Choose a topic below or ask me anything!
                </p>
              </div>
              
              {/* Conversation Starters */}
              <ConversationStarters 
                profile={profile}
                onStartConversation={handleStarterConversation}
              />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        {currentConversation && (
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2 max-w-4xl mx-auto">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask your AI mentor anything about your personality..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={() => sendMessage()} 
                disabled={!inputMessage.trim() || isLoading}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
    </MobileResponsiveWrapper>
  );
};