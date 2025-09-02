import React, { useState, useEffect } from 'react';
import { PersonalityProfile } from '@/types/tps.types';
import { AIInsights } from '@/types/llm.types';
import { AIInsightsService } from '@/services/aiInsightsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Briefcase, TrendingUp, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface AIInsightsPanelProps {
  profile: PersonalityProfile;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ profile }) => {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const aiInsightsService = new AIInsightsService();

  useEffect(() => {
    if (user) {
      loadExistingInsights();
    }
  }, [user]);

  const loadExistingInsights = async () => {
    if (!user) return;
    
    try {
      const existingInsights = await aiInsightsService.getInsights(user.id);
      if (existingInsights) {
        setInsights(existingInsights);
      }
    } catch (error) {
      console.error('Error loading existing insights:', error);
    }
  };

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Generate insights without requiring authentication
      const newInsights = await aiInsightsService.generateInsights(profile);
      setInsights(newInsights);
      
      toast({
        title: "AI Insights Generated",
        description: "Your personalized insights are ready!"
      });
    } catch (error) {
      console.error('Error generating insights:', error);
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

  const InsightCard = ({ title, content, icon: Icon, color }: { 
    title: string; 
    content: string; 
    icon: React.ComponentType<any>; 
    color: string;
  }) => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm max-w-none text-foreground">
          {content.split('\n').map((paragraph, index) => (
            paragraph.trim() && (
              <p key={index} className="mb-3 last:mb-0">
                {paragraph.trim()}
              </p>
            )
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    </div>
  );

  if (!insights && !loading) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Generate AI Insights</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Get personalized insights about your personality, career guidance, and development recommendations powered by AI.
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
    return <LoadingSkeleton />;
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
          <h2 className="text-2xl font-bold">AI Insights</h2>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Generated
          </Badge>
        </div>
        <Button onClick={generateInsights} disabled={loading} variant="outline" size="sm">
          Regenerate
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="career">Career</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <InsightCard
            title="Personality Overview"
            content={insights?.general || ''}
            icon={Brain}
            color="bg-primary"
          />
        </TabsContent>

        <TabsContent value="career" className="space-y-6">
          <InsightCard
            title="Career Guidance"
            content={insights?.career || ''}
            icon={Briefcase}
            color="bg-blue-500"
          />
        </TabsContent>

        <TabsContent value="development" className="space-y-6">
          <InsightCard
            title="Personal Development"
            content={insights?.development || ''}
            icon={TrendingUp}
            color="bg-green-500"
          />
        </TabsContent>

        <TabsContent value="relationships" className="space-y-6">
          <InsightCard
            title="Relationship Insights"
            content={insights?.relationship || ''}
            icon={Heart}
            color="bg-pink-500"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};