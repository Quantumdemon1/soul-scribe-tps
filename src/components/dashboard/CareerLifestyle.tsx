import React from 'react';
import { PersonalityProfile } from '../../types/tps.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CareerLifestyleProps {
  profile: PersonalityProfile;
}

export const CareerLifestyle: React.FC<CareerLifestyleProps> = ({ profile }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Career & Lifestyle Suggestions</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Career recommendations based on your personality profile.</p>
      </CardContent>
    </Card>
  );
};