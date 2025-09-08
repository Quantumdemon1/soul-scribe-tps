import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { IntegralDetail } from '@/mappings/integral.enhanced';
import { Brain, TrendingUp, Target, Lightbulb } from 'lucide-react';

interface IntegralInsightsProps {
  integralDetail: IntegralDetail;
}

export const IntegralInsights: React.FC<IntegralInsightsProps> = ({ integralDetail }) => {
  const { primaryLevel, secondaryLevel, realityTriadMapping, cognitiveComplexity, developmentalEdge } = integralDetail;

  const getLevelColor = (color: string) => {
    const colors = {
      'Red': 'bg-red-500',
      'Amber': 'bg-amber-500', 
      'Orange': 'bg-orange-500',
      'Green': 'bg-green-500',
      'Teal': 'bg-teal-500',
      'Turquoise': 'bg-cyan-500'
    };
    return colors[color as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Primary Level */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Cognitive Development Level
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${getLevelColor(primaryLevel.color)}`} />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{primaryLevel.color} - {primaryLevel.name}</h3>
              <p className="text-sm text-muted-foreground">{primaryLevel.cognitiveStage}</p>
            </div>
            <Badge variant="secondary">
              {primaryLevel.confidence}% confidence
            </Badge>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Worldview & Thinking Pattern</h4>
            <p className="text-sm text-muted-foreground mb-2">{primaryLevel.worldview}</p>
            <p className="text-sm">{primaryLevel.thinkingPattern}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Key Characteristics
              </h4>
              <ul className="text-sm space-y-1">
                {primaryLevel.characteristics.map((char, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                    {char}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Growth Opportunities
              </h4>
              <ul className="text-sm space-y-1">
                {primaryLevel.growthEdge.map((edge, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    {edge}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Level (if present) */}
      {secondaryLevel && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Secondary Development Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${getLevelColor(secondaryLevel.color)}`} />
              <div className="flex-1">
                <h3 className="font-medium">{secondaryLevel.color} - {secondaryLevel.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Score: {secondaryLevel.score.toFixed(1)} | Confidence: {secondaryLevel.confidence}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reality Triad Mapping */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Reality Triad Focus</CardTitle>
          <p className="text-sm text-muted-foreground">
            How you naturally orient to different aspects of reality
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Physical Reality</span>
                <span className="text-sm text-muted-foreground">
                  {(realityTriadMapping.physical * 10).toFixed(0)}%
                </span>
              </div>
              <Progress value={realityTriadMapping.physical * 10} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Concrete, tangible aspects • Maps to Red/Amber levels
              </p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Social Reality</span>
                <span className="text-sm text-muted-foreground">
                  {(realityTriadMapping.social * 10).toFixed(0)}%
                </span>
              </div>
              <Progress value={realityTriadMapping.social * 10} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Relationships and social systems • Maps to Orange/Green levels
              </p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Universal Reality</span>
                <span className="text-sm text-muted-foreground">
                  {(realityTriadMapping.universal * 10).toFixed(0)}%
                </span>
              </div>
              <Progress value={realityTriadMapping.universal * 10} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Abstract principles and patterns • Maps to Teal/Turquoise levels
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cognitive Complexity & Development Edge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Cognitive Complexity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold">{cognitiveComplexity.toFixed(1)}</div>
              <div className="flex-1">
                <Progress value={cognitiveComplexity * 10} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  Ability to handle complex, multi-perspective thinking
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Development Edge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{developmentalEdge}</p>
          </CardContent>
        </Card>
      </div>

      {/* Typical Concerns */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Core Life Concerns</CardTitle>
          <p className="text-sm text-muted-foreground">
            What typically matters most at your development level
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {primaryLevel.typicalConcerns.map((concern, index) => (
              <Badge key={index} variant="outline">
                {concern}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};