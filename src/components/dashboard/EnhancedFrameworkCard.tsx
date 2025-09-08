import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PersonalityProfile } from '@/types/tps.types';
import { IntegralLevelBadge } from './IntegralLevelBadge';
import { Button } from '@/components/ui/button';
import { Layers } from 'lucide-react';

interface EnhancedFrameworkCardProps {
  title: string;
  value: string;
  description: string;
  profile: PersonalityProfile;
  className?: string;
}

const getIntegralExpression = (framework: string, type: string, integralLevel: any) => {
  if (!integralLevel) return null;

  const levelNumber = integralLevel.number;
  const levelColor = integralLevel.color;

  // Framework-specific integral expressions
  const expressions = {
    'MBTI': {
      'ENFP': {
        2: 'Impulsive enthusiasm, immediate inspiration-seeking',
        3: 'Structured idealism, organized enthusiasm',
        4: 'Achievement-oriented visionary, goal-focused inspiration',
        5: 'Community-centered empathy, collective inspiration',
        6: 'Integrated wisdom, systemic vision',
        7: 'Holistic consciousness, transpersonal inspiration'
      },
      'INTJ': {
        2: 'Dominant strategic thinking, power-focused planning',
        3: 'Systematic planning, rule-based strategy',
        4: 'Efficient achievement, goal-oriented systems',
        5: 'Inclusive planning, community-aware strategy',
        6: 'Integral systems thinking, balanced perspectives',
        7: 'Holistic wisdom, transpersonal planning'
      },
      // Add more types as needed
      'default': {
        2: `${type} with impulsive, power-focused expression`,
        3: `${type} with structured, rule-oriented approach`,
        4: `${type} with achievement-focused, efficient expression`,
        5: `${type} with community-aware, inclusive perspective`,
        6: `${type} with integrated, systemic understanding`,
        7: `${type} with holistic, transpersonal awareness`
      }
    },
    'Enneagram': {
      '1': {
        2: 'Impulsive perfectionism, power-driven reform',
        3: 'Structured improvement, rule-based excellence',
        4: 'Achievement-oriented perfection, efficient reform',
        5: 'Community-focused improvement, inclusive excellence',
        6: 'Integrated wholeness, systemic perfection',
        7: 'Holistic acceptance, transpersonal completeness'
      },
      // Add more types as needed
      'default': {
        2: `Type ${type} with impulsive, ego-driven expression`,
        3: `Type ${type} with structured, conformist approach`,
        4: `Type ${type} with achievement-focused expression`,
        5: `Type ${type} with community-aware perspective`,
        6: `Type ${type} with integrated, balanced expression`,
        7: `Type ${type} with holistic, transpersonal awareness`
      }
    }
  };

  const frameworkExpressions = expressions[framework as keyof typeof expressions];
  if (!frameworkExpressions) return null;

  const typeExpressions = frameworkExpressions[type as keyof typeof frameworkExpressions] || 
                          frameworkExpressions['default' as keyof typeof frameworkExpressions];
  
  return typeExpressions[levelNumber as keyof typeof typeExpressions] || 
         typeExpressions[4 as keyof typeof typeExpressions]; // Default to Orange level
};

export const EnhancedFrameworkCard: React.FC<EnhancedFrameworkCardProps> = ({
  title,
  value,
  description,
  profile,
  className
}) => {
  const integralDetail = profile.mappings.integralDetail;
  const integralExpression = integralDetail ? 
    getIntegralExpression(title, value, integralDetail.primaryLevel) : null;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {integralDetail && (
            <IntegralLevelBadge 
              level={integralDetail.primaryLevel} 
              size="sm" 
              showName={false}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-2xl font-bold text-primary mb-2">{value}</div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {integralExpression && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                At Level {integralDetail?.primaryLevel.number} ({integralDetail?.primaryLevel.color})
              </span>
            </div>
            <p className="text-sm text-muted-foreground italic">
              {integralExpression}
            </p>
          </div>
        )}

        {!integralDetail && (
          <div className="pt-3 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = '/integral'}
              className="w-full"
            >
              <Layers className="h-4 w-4 mr-2" />
              See Expression at Your Level
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};