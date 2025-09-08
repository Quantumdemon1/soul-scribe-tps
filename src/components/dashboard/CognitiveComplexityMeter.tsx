import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';

interface CognitiveComplexityMeterProps {
  complexity: number;
  primaryLevel: {
    number: number;
    color: string;
    name: string;
  };
  className?: string;
}

export const CognitiveComplexityMeter: React.FC<CognitiveComplexityMeterProps> = ({
  complexity,
  primaryLevel,
  className
}) => {
  const getComplexityLabel = (score: number) => {
    if (score >= 80) return 'Highly Integrated';
    if (score >= 65) return 'Well Developed';
    if (score >= 50) return 'Moderately Complex';
    if (score >= 35) return 'Developing';
    return 'Early Stage';
  };

  const getComplexityDescription = (score: number) => {
    if (score >= 80) return 'Demonstrates sophisticated meta-cognitive awareness and systems thinking';
    if (score >= 65) return 'Shows good abstract reasoning and perspective-taking abilities';
    if (score >= 50) return 'Developing capacity for complex problem-solving and multiple perspectives';
    if (score >= 35) return 'Building foundational cognitive skills and self-awareness';
    return 'Focus on developing basic reasoning and self-reflection capabilities';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-primary" />
          Cognitive Complexity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            {Math.round(complexity)}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            {getComplexityLabel(complexity)}
          </span>
        </div>
        
        <Progress 
          value={complexity} 
          className="h-3"
        />
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            At Level {primaryLevel.number} ({primaryLevel.color}), your cognitive complexity reflects:
          </p>
          <p className="text-sm font-medium">
            {getComplexityDescription(complexity)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};