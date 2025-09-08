import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IntegralLevel } from '@/mappings/integral.enhanced';
import { IntegralLevelBadge } from './IntegralLevelBadge';
import { ArrowRight, Target } from 'lucide-react';

interface SpiralDynamicsTimelineProps {
  primaryLevel: IntegralLevel;
  secondaryLevel?: IntegralLevel;
  developmentalEdge: string;
  className?: string;
}

const timelineLevels = [
  { number: 2, color: 'Red', name: 'Power/Control', stage: 'Preoperational' },
  { number: 3, color: 'Amber', name: 'Order/Rules', stage: 'Concrete Operational' },
  { number: 4, color: 'Orange', name: 'Achievement', stage: 'Formal Operational' },
  { number: 5, color: 'Green', name: 'Community', stage: 'Systemic' },
  { number: 6, color: 'Teal', name: 'Integration', stage: 'Meta-systemic' },
  { number: 7, color: 'Turquoise', name: 'Holistic', stage: 'Para-dialectical' },
];

export const SpiralDynamicsTimeline: React.FC<SpiralDynamicsTimelineProps> = ({
  primaryLevel,
  secondaryLevel,
  developmentalEdge,
  className
}) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Cognitive Development Journey
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your position on the spiral of cognitive development
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Position */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Current Level</h4>
          <div className="flex items-center gap-3">
            <IntegralLevelBadge level={primaryLevel} size="lg" />
            <div className="flex-1">
              <p className="font-medium">{primaryLevel.name}</p>
              <p className="text-sm text-muted-foreground">{primaryLevel.cognitiveStage}</p>
            </div>
          </div>
          
          {secondaryLevel && (
            <div className="flex items-center gap-3 ml-4">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <IntegralLevelBadge level={secondaryLevel} size="md" />
              <span className="text-sm text-muted-foreground">Secondary influence</span>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Development Timeline</h4>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
            
            {timelineLevels.map((level, index) => {
              const isCurrentLevel = level.number === primaryLevel.number;
              const isSecondaryLevel = secondaryLevel && level.number === secondaryLevel.number;
              const isPassed = level.number < primaryLevel.number;
              const isFuture = level.number > primaryLevel.number;
              
              return (
                <div key={level.number} className="relative flex items-center gap-4 pb-4">
                  {/* Timeline dot */}
                  <div className={`w-3 h-3 rounded-full border-2 z-10 ${
                    isCurrentLevel 
                      ? 'bg-primary border-primary' 
                      : isPassed 
                        ? 'bg-muted-foreground border-muted-foreground'
                        : 'bg-background border-border'
                  }`} />
                  
                  {/* Level info */}
                  <div className={`flex-1 ${isFuture ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={isCurrentLevel ? 'default' : 'outline'}
                        className={isCurrentLevel ? 'bg-primary' : ''}
                      >
                        {level.number} • {level.color}
                      </Badge>
                      {isCurrentLevel && <span className="text-xs font-medium text-primary">You are here</span>}
                      {isSecondaryLevel && <span className="text-xs text-muted-foreground">Secondary</span>}
                    </div>
                    <p className="text-sm font-medium mt-1">{level.name}</p>
                    <p className="text-xs text-muted-foreground">{level.stage}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Developmental Edge */}
        <div className="pt-4 border-t space-y-2">
          <h4 className="font-semibold text-sm">Your Developmental Edge</h4>
          <p className="text-sm text-muted-foreground">{developmentalEdge}</p>
        </div>
      </CardContent>
    </Card>
  );
};