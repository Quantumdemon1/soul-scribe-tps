import React from 'react';
import { PersonalityProfile } from '../../types/tps.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PersonalDevelopmentProps {
  profile: PersonalityProfile;
}

export const PersonalDevelopment: React.FC<PersonalDevelopmentProps> = ({ profile }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Development Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Based on your TPS profile, here are personalized development suggestions.</p>
      </CardContent>
    </Card>
  );
};