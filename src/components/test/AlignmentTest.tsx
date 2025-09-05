import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TPSScoring } from '@/utils/tpsScoring';
import { Badge } from '@/components/ui/badge';

export const AlignmentTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testScores, setTestScores] = useState<any>(null);

  const runAlignmentTest = () => {
    // Test with sample scores that should produce a clear non-neutral result
    const sampleScores = {
      'Lawful': 8.5,
      'Structured': 7.2,
      'Diplomatic': 6.8,
      'Self-Mastery': 7.0,
      'Self-Principled': 4.2,
      'Independent': 3.8,
      'Dynamic': 5.1,
      'Intuitive': 4.5,
      'Communal Navigate': 8.0,
      'Optimistic': 7.5,
      'Responsive': 6.5,
      'Social': 7.8,
      'Self-Indulgent': 3.2,
      'Independent Navigate': 4.0,
      'Assertive': 5.0,
      'Pessimistic': 2.8
    };

    console.log('Testing D&D Alignment with sample scores:', sampleScores);
    
    // Use the private method through generateFullProfile to test
    const mockResponses = new Array(108).fill(5); // Neutral responses
    const profile = TPSScoring.generateFullProfile(mockResponses);
    
    // Manually calculate alignment with our test scores
    const alignment = (TPSScoring as any).calculateAlignment(sampleScores);
    
    console.log('Manual alignment calculation result:', alignment);
    setTestResult(alignment);
    setTestScores(sampleScores);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>D&D Alignment Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runAlignmentTest} className="w-full">
          Test Alignment Calculation
        </Button>
        
        {testResult && (
          <div className="space-y-2">
            <div className="text-center">
              <Badge variant="secondary" className="text-lg">
                {testResult}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Check console for detailed calculation logs
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};