import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PersonalityProfile } from '@/types/tps.types';
import { IntegralLevelBadge } from '@/components/dashboard/IntegralLevelBadge';
import { CircularProgress } from '@/components/charts/CircularProgress';
import { Brain, Target, Users, Heart, Compass, Zap } from 'lucide-react';

interface PersonalityDisplayProps {
  personalityProfile?: PersonalityProfile;
  integralLevel?: any;
  isOwner?: boolean;
  visibilityLevel?: 'public' | 'connections' | 'private';
}

export const PersonalityDisplay: React.FC<PersonalityDisplayProps> = ({
  personalityProfile,
  integralLevel,
  isOwner = false,
  visibilityLevel = 'public'
}) => {
  if (!personalityProfile && !integralLevel) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {isOwner ? 'Take an assessment to display your personality profile' : 'No personality data available'}
          </p>
        </CardContent>
      </Card>
    );
  }

  const getVisibilityBadge = () => {
    const variants = {
      public: { variant: 'default' as const, icon: Users, text: 'Public' },
      connections: { variant: 'secondary' as const, icon: Heart, text: 'Connections Only' },
      private: { variant: 'outline' as const, icon: Target, text: 'Private' }
    };
    
    const config = variants[visibilityLevel];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Personality Profile
            </CardTitle>
            {isOwner && getVisibilityBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Integral Level */}
          {integralLevel?.primaryLevel && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Integral Development Level
              </h3>
              <div className="flex items-center gap-3">
                <IntegralLevelBadge level={integralLevel.primaryLevel} size="lg" />
                <div>
                  <p className="font-medium">{integralLevel.primaryLevel.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round(integralLevel.primaryLevel.score * 100)}% confidence
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MBTI Type */}
          {personalityProfile?.mappings?.mbti && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="w-5 h-5" />
                MBTI Type
              </h3>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-lg px-4 py-2 font-bold">
                  {personalityProfile.mappings.mbti}
                </Badge>
                <div>
                  <p className="font-medium">Myers-Briggs Type</p>
                  <p className="text-sm text-muted-foreground">
                    Personality framework classification
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enneagram */}
          {personalityProfile?.mappings?.enneagram && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Compass className="w-5 h-5" />
                Enneagram
              </h3>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-lg px-4 py-2 font-bold">
                  Type {personalityProfile.mappings.enneagram}
                </Badge>
                <div>
                  <p className="font-medium">Enneagram Type</p>
                  {personalityProfile.mappings.enneagramDetails?.wing && (
                    <p className="text-sm text-muted-foreground">
                      Wing: {personalityProfile.mappings.enneagramDetails.wing}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Big Five Traits */}
          {personalityProfile?.mappings?.bigFive && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Big Five Traits</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(personalityProfile.mappings.bigFive).map(([trait, score]) => (
                  <div key={trait} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">{trait}</span>
                      <span className="text-sm text-muted-foreground">{Math.round((score as number) * 100)}%</span>
                    </div>
                    <CircularProgress 
                      value={(score as number) * 100} 
                      size={60}
                      strokeWidth={6}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dominant Traits */}
          {personalityProfile?.dominantTraits && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Dominant Traits</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(personalityProfile.dominantTraits).map(([category, trait]) => (
                  <Badge key={category} variant="secondary">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};