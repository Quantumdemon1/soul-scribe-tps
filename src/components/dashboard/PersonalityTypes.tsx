import React from 'react';
import { PersonalityProfile } from '../../types/tps.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PersonalityTypesProps {
  profile: PersonalityProfile;
}

export const PersonalityTypes: React.FC<PersonalityTypesProps> = ({ profile }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>MBTI: {profile.mappings.mbti}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your MBTI type based on TPS analysis.</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Enneagram: {profile.mappings.enneagram}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your Enneagram type based on TPS analysis.</p>
        </CardContent>
      </Card>
    </div>
  );
};