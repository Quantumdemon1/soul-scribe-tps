import React from 'react';
import { PersonalityProfile } from '../../types/tps.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CoreInsightsProps {
  profile: PersonalityProfile;
}

export const CoreInsights: React.FC<CoreInsightsProps> = ({ profile }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Core Personality Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(profile.domainScores).map(([domain, score]) => (
            <div key={domain}>
              <h3 className="font-semibold">{domain}</h3>
              <p>Score: {(score * 10).toFixed(1)}/10</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};