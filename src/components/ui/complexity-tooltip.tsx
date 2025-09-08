import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface ComplexityTooltipProps {
  score: number;
  className?: string;
}

export const ComplexityTooltip: React.FC<ComplexityTooltipProps> = ({ score, className }) => {
  const getComplexityDescription = (score: number) => {
    if (score <= 2) return "Basic cognitive patterns, concrete thinking";
    if (score <= 4) return "Rule-based thinking, structured approach";
    if (score <= 6) return "Analytical thinking, some flexibility";
    if (score <= 8) return "Systems thinking, comfortable with complexity";
    return "Meta-systemic thinking, integrates multiple perspectives";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 cursor-help ${className}`}>
            <span>Complexity</span>
            <Info className="w-3 h-3 text-muted-foreground" />
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <div className="font-semibold">Cognitive Complexity: {score}/10</div>
            <div className="text-xs">{getComplexityDescription(score)}</div>
            <div className="text-xs text-muted-foreground">
              Measures your ability to think in nuanced, multi-perspective ways. 
              Higher scores indicate comfort with paradox, systems thinking, and 
              integrating multiple viewpoints.
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};