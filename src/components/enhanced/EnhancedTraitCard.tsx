import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TraitData {
  name: string;
  score: number;
  description: string;
  behavioralIndicators: string[];
  practicalImplications: string[];
  developmentTips: string[];
}

interface EnhancedTraitCardProps {
  trait: TraitData;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export const EnhancedTraitCard: React.FC<EnhancedTraitCardProps> = ({ 
  trait, 
  isExpanded = false, 
  onToggle 
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = onToggle ? isExpanded : internalExpanded;
  const toggle = onToggle || (() => setInternalExpanded(!internalExpanded));

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 7) return <TrendingUp className="w-4 h-4" />;
    if (score >= 4) return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 7) return 'High';
    if (score >= 4) return 'Moderate';
    return 'Low';
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{trait.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 ${getScoreColor(trait.score)}`}
            >
              {getScoreIcon(trait.score)}
              {getScoreLabel(trait.score)} ({trait.score.toFixed(1)})
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggle}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <Progress value={trait.score * 10} className="mt-2" />
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{trait.description}</p>
          </div>
          
          {trait.behavioralIndicators.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Behavioral Indicators</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {trait.behavioralIndicators.map((indicator, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                    {indicator}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {trait.practicalImplications.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Practical Implications</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {trait.practicalImplications.map((implication, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    {implication}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {trait.developmentTips.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Development Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {trait.developmentTips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};