import React from 'react';
import { PersonalityProfile } from '../../types/tps.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PersonalityInsightGenerator } from '../../utils/personalityInsights';
import { Target, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface PersonalDevelopmentProps {
  profile: PersonalityProfile;
}

export const PersonalDevelopment: React.FC<PersonalDevelopmentProps> = ({ profile }) => {
  const insights = PersonalityInsightGenerator.generateCoreInsights(profile);
  const developmentAreas = PersonalityInsightGenerator.generateDevelopmentAreas(profile);

  return (
    <div className="space-y-6">
      {/* Growth Areas Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Areas for Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.growthAreas.map((area, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-foreground/80">{area}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Development Plan */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Detailed Development Plan</h3>
        {developmentAreas.map((area, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{index + 1}</span>
                  </div>
                  {area.area}
                </span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {area.timeframe}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/80">{area.description}</p>
              
              <div>
                <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Recommended Activities
                </h4>
                <div className="space-y-2">
                  {area.activities.map((activity, actIndex) => (
                    <div key={actIndex} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span className="text-sm text-foreground/70">{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* General Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>General Development Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-foreground/80">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Development Mindset */}
      <Card>
        <CardHeader>
          <CardTitle>Development Mindset</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Remember: Growth is a Journey</h4>
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                Personal development is an ongoing process. Focus on one area at a time and celebrate small wins along the way.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Leverage Your Strengths</h4>
              <p className="text-green-800 dark:text-green-200 text-sm">
                While working on growth areas, don't forget to continue developing and utilizing your natural strengths.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};