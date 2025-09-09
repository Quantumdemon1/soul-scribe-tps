import React, { useState, useEffect } from 'react';
import { PersonalityProfile } from '@/types/tps.types';
import { AIInsights } from '@/types/llm.types';
import { AIInsightsService } from '@/services/aiInsightsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import { Brain, Briefcase, TrendingUp, Heart, Sparkles, ChevronDown, RefreshCw, Target, Database } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/structuredLogging';

interface AIInsightsPanelProps {
  profile: PersonalityProfile;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ profile }) => {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    general: true,
    career: false,
    development: false,
    relationships: false
  });
  
  const { user } = useAuth();
  const aiInsightsService = new AIInsightsService();

  useEffect(() => {
    if (user) {
      loadExistingInsights();
    }
  }, [user, profile]); // Also reload when profile changes

  const loadExistingInsights = async () => {
    if (!user) return;
    
    try {
      logger.info('Loading existing AI insights', {
        component: 'AIInsightsPanel',
        userId: user.id
      });
      const existingInsights = await aiInsightsService.getInsights(user.id);
      if (existingInsights) {
        logger.info('Loaded existing AI insights from database', {
          component: 'AIInsightsPanel',
          userId: user.id
        });
        setInsights(existingInsights);
        setIsFromCache(true);
      } else {
        logger.info('No existing AI insights found in database', {
          component: 'AIInsightsPanel',
          userId: user.id
        });
        setIsFromCache(false);
      }
    } catch (error) {
      logger.error('Error loading existing insights', {
        component: 'AIInsightsPanel',
        userId: user?.id,
        metadata: { errorMessage: error instanceof Error ? error.message : 'Unknown error' }
      });
      setIsFromCache(false);
    }
  };

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    setIsFromCache(false);
    
    try {
      logger.info('Generating new AI insights', {
        component: 'AIInsightsPanel',
        userId: user?.id,
        metadata: { hasProfile: !!profile }
      });
      const newInsights = await aiInsightsService.generateInsights(profile, user?.id);
      setInsights(newInsights);
      
      toast({
        title: "AI Insights Generated",
        description: "Your personalized insights are ready!"
      });
    } catch (error) {
      logger.error('Error generating insights', {
        component: 'AIInsightsPanel',
        userId: user?.id,
        metadata: { errorMessage: error instanceof Error ? error.message : 'Unknown error' }
      });
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate insights';
      setError(`Failed to generate insights: ${errorMessage}. Please check your internet connection and try again.`);
      
      toast({
        title: "Error",
        description: `Failed to generate AI insights: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const InsightSection = ({ 
    title, 
    content, 
    icon: Icon, 
    sectionKey,
    integrationNote,
    children 
  }: { 
    title: string; 
    content: string; 
    icon: React.ComponentType<any>; 
    sectionKey: string;
    integrationNote?: string;
    children?: React.ReactNode;
  }) => (
    <Collapsible open={openSections[sectionKey]} onOpenChange={() => toggleSection(sectionKey)}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary">
                  <Icon className="w-4 h-4 text-primary-foreground" />
                </div>
                {title}
                {integrationNote && (
                  <HelpTooltip content={integrationNote} />
                )}
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${openSections[sectionKey] ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <div className="border-t border-border pt-6">
              <div className="prose prose-sm max-w-none text-foreground space-y-4">
                {content.split('\n\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="leading-relaxed">
                      {paragraph.trim()}
                    </p>
                  )
                ))}
              </div>
              {children}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );

  if (!insights && !loading) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Generate Comprehensive AI Insights</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Get personalized insights about your personality, career guidance, development recommendations, and relationship patterns powered by advanced AI analysis.
            </p>
            <Button onClick={generateInsights} disabled={loading} size="lg">
              <Brain className="w-4 h-4 mr-2" />
              {loading ? 'Generating...' : 'Generate AI Insights'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <LoadingSpinner size="lg" text="Generating comprehensive AI insights..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={generateInsights} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Comprehensive AI Insights</h2>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Generated
          </Badge>
          {isFromCache && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Database className="w-3 h-3" />
              Cached
            </Badge>
          )}
          <HelpTooltip content="These insights integrate your personality framework correlations and core insights to provide comprehensive, personalized guidance." />
        </div>
        <Button onClick={generateInsights} disabled={loading} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerate
        </Button>
      </div>

      <div className="space-y-4">
        <InsightSection
          title="General Personality Insights"
          content={insights?.general || ''}
          icon={Brain}
          sectionKey="general"
          integrationNote="Integrates with your core personality summary and framework correlations"
        />

        <InsightSection
          title="Career Guidance"
          content={insights?.career || ''}
          icon={Briefcase}
          sectionKey="career"
          integrationNote="Based on your Holland Code, MBTI type, and domain strengths"
        />

        <InsightSection
          title="Personal Development"
          content={insights?.development || ''}
          icon={TrendingUp}
          sectionKey="development"
          integrationNote="Tailored to your specific trait combinations and growth opportunities"
        />

        <InsightSection
          title="Relationship Insights"
          content={insights?.relationship || ''}
          icon={Heart}
          sectionKey="relationships"
          integrationNote="Based on your communication style, emotional patterns, and interpersonal traits"
        />
      </div>

      {/* Integration Summary */}
      <div className="mt-8 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Integrated Analysis Overview
        </h3>
        <div className="text-muted-foreground space-y-2 text-sm">
          <p>
            These insights combine data from multiple sources to provide you with comprehensive, personalized guidance:
          </p>
          <ul className="space-y-1 ml-4">
            <li>• Your unique trait combinations and domain scores</li>
            <li>• Framework correlations across MBTI, Enneagram, Big Five, and more</li>
            <li>• Core personality strengths and development areas</li>
            <li>• Advanced AI analysis for practical applications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};