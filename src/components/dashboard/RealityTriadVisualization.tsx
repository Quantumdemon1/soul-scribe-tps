import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain, Users, Sparkles } from 'lucide-react';

interface RealityTriadVisualizationProps {
  triadMapping: {
    physical: number;
    social: number;
    universal: number;
  };
  className?: string;
}

const getTriadColor = (value: number) => {
  if (value >= 70) return 'text-green-600 dark:text-green-400';
  if (value >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

const getTriadDescription = (domain: string, score: number) => {
  const descriptions = {
    physical: {
      high: 'Strong focus on material reality, practical concerns, and tangible outcomes',
      medium: 'Balanced attention to physical world and practical needs',
      low: 'Less emphasis on material concerns, more abstract focus'
    },
    social: {
      high: 'Deep engagement with relationships, cultural dynamics, and social systems',
      medium: 'Healthy balance of individual and social considerations',
      low: 'More individualistic approach, less social orientation'
    },
    universal: {
      high: 'Strong connection to transpersonal, spiritual, and global perspectives',
      medium: 'Growing awareness of universal principles and broader contexts',
      low: 'More focused on personal and immediate social concerns'
    }
  };

  const level = score >= 60 ? 'high' : score >= 40 ? 'medium' : 'low';
  return descriptions[domain as keyof typeof descriptions][level];
};

export const RealityTriadVisualization: React.FC<RealityTriadVisualizationProps> = ({
  triadMapping,
  className
}) => {
  const triads = [
    {
      name: 'Physical Reality',
      value: triadMapping.physical,
      icon: Mountain,
      description: 'Material world focus, practical concerns, survival needs'
    },
    {
      name: 'Social Reality',
      value: triadMapping.social,
      icon: Users,
      description: 'Relationships, culture, group dynamics, social systems'
    },
    {
      name: 'Universal Reality',
      value: triadMapping.universal,
      icon: Sparkles,
      description: 'Transpersonal awareness, spiritual insights, global perspectives'
    }
  ];

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Reality Triad Focus</CardTitle>
        <p className="text-sm text-muted-foreground">
          Your orientation across different dimensions of reality
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {triads.map((triad) => {
          const Icon = triad.icon;
          return (
            <div key={triad.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="font-medium">{triad.name}</span>
                </div>
                <span className={`font-semibold ${getTriadColor(triad.value)}`}>
                  {Math.round(triad.value)}%
                </span>
              </div>
              
              <Progress value={triad.value} className="h-2" />
              
              <p className="text-xs text-muted-foreground">
                {getTriadDescription(triad.name.toLowerCase().split(' ')[0], triad.value)}
              </p>
            </div>
          );
        })}
        
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            This shows your cognitive emphasis across physical, social, and universal dimensions 
            of reality based on Integral Theory's framework.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};