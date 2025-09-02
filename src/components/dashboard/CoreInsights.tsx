import React from 'react';
import { PersonalityProfile } from '../../types/tps.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { PersonalityInsightGenerator } from '../../utils/personalityInsights';
import { TrendingUp, Brain, Target, Lightbulb } from 'lucide-react';

interface CoreInsightsProps {
  profile: PersonalityProfile;
}

export const CoreInsights: React.FC<CoreInsightsProps> = ({ profile }) => {
  const insights = PersonalityInsightGenerator.generateCoreInsights(profile);
  
  // Get top traits
  const topTraits = Object.entries(profile.traitScores)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Personality Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Personality Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/80 leading-relaxed">{insights.summary}</p>
        </CardContent>
      </Card>

      {/* Domain Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Domain Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(profile.domainScores).map(([domain, score]) => (
              <div key={domain} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{domain}</h3>
                  <Badge variant={score > 7 ? "default" : score > 5 ? "secondary" : "outline"}>
                    {(score * 10).toFixed(1)}/10
                  </Badge>
                </div>
                <Progress value={score * 10} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {getDomainDescription(domain, score)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Traits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Your Strongest Traits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topTraits.map(([trait, score]) => (
              <div key={trait} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="font-medium text-foreground">{trait}</span>
                <Badge variant="default">{score.toFixed(1)}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Core Strengths */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Your Core Strengths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.strengths.map((strength, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-foreground/80">{strength}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to get domain descriptions
function getDomainDescription(domain: string, score: number): string {
  const descriptions = {
    'External': score > 7 ? 'You excel at organizing and managing your environment' : 
                score > 5 ? 'You have moderate skills in external organization' : 
                'Focus on developing better organizational systems',
    'Internal': score > 7 ? 'You have strong self-awareness and emotional regulation' : 
                score > 5 ? 'You show good internal awareness with room for growth' : 
                'Developing self-awareness could be beneficial',
    'Interpersonal': score > 7 ? 'You navigate relationships and social situations skillfully' : 
                     score > 5 ? 'You handle social interactions reasonably well' : 
                     'Building stronger interpersonal skills could help',
    'Processing': score > 7 ? 'You have excellent analytical and cognitive abilities' : 
                  score > 5 ? 'You show solid problem-solving capabilities' : 
                  'Strengthening analytical thinking could be valuable'
  };
  
  return descriptions[domain as keyof typeof descriptions] || 'This domain reflects important aspects of your personality.';
}