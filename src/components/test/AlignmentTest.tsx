import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TPSScoring } from '@/utils/tpsScoring';
import { Badge } from '@/components/ui/badge';

export const AlignmentTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runEnhancedMappingTest = async () => {
    setIsLoading(true);
    
    try {
      // Test with sample scores that should produce clear results
      const sampleScores = {
        'Lawful': 8.5,
        'Structured': 7.2,
        'Diplomatic': 6.8,
        'Self-Mastery': 7.0,
        'Self-Principled': 4.2,
        'Independent': 3.8,
        'Dynamic': 5.1,
        'Intuitive': 6.5,
        'Communal Navigate': 8.0,
        'Optimistic': 7.5,
        'Responsive': 6.5,
        'Social': 7.8,
        'Self-Indulgent': 3.2,
        'Independent Navigate': 4.0,
        'Assertive': 5.0,
        'Pessimistic': 2.8,
        'Analytical': 7.0,
        'Physical': 5.5,
        'Universal': 6.0,
        'Stoic': 5.8,
        'Turbulent': 4.2,
        'Self-Aware': 6.5,
        'Extrinsic': 5.5,
        'Intrinsic': 6.0,
        'Realistic': 6.2,
        'Pragmatic': 6.8,
        'Varied': 5.5,
        'Mixed Navigate': 5.8,
        'Direct': 6.0,
        'Mixed Communication': 5.5,
        'Passive Communication': 4.5,
        'Modular': 5.5,
        'Static': 4.8,
        'Responsive Regulation': 6.0,
        'Passive': 4.5
      };

      console.log('Testing Enhanced Mappings with sample scores:', sampleScores);
      
      // Generate a full profile with enhanced mappings
      const mockResponses = new Array(108).fill(5);
      const profile = TPSScoring.generateFullProfile(mockResponses);
      
      // Test specific enhanced calculations
      const results = {
        version: profile.version,
        basicAlignment: profile.mappings.dndAlignment,
        enhancedAlignment: profile.mappings.alignmentDetail?.alignment,
        mbtiType: profile.mappings.mbti,
        mbtiConfidence: profile.mappings.mbtiDetail?.confidence,
        enneagramType: profile.mappings.enneagram,
        attachmentStyle: profile.mappings.attachmentStyle?.style,
        hollandCode: profile.mappings.hollandDetail?.code,
        bigFiveOpenness: profile.mappings.bigFiveDetail?.dimensions.Openness?.score,
        socionicsType: profile.mappings.socionicsDetail?.type,
        hasAllEnhancements: !!(
          profile.mappings.mbtiDetail &&
          profile.mappings.enneagramDetail &&
          profile.mappings.bigFiveDetail &&
          profile.mappings.alignmentDetail &&
          profile.mappings.hollandDetail &&
          profile.mappings.attachmentStyle &&
          profile.mappings.socionicsDetail
        )
      };
      
      console.log('Enhanced Mappings Test Results:', results);
      setTestResults(results);
    } catch (error) {
      console.error('Enhanced mappings test failed:', error);
      setTestResults({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Enhanced Mappings Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runEnhancedMappingTest} 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Test Enhanced Mappings v2.1.0'}
        </Button>
        
        {testResults && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="space-y-1">
                <Badge variant="outline">Version: {testResults.version}</Badge>
                <Badge variant={testResults.hasAllEnhancements ? "default" : "destructive"}>
                  {testResults.hasAllEnhancements ? "✓ All Enhanced" : "✗ Missing Features"}
                </Badge>
              </div>
              <div className="space-y-1">
                <Badge variant="secondary">MBTI: {testResults.mbtiType}</Badge>
                <Badge variant="secondary">Attachment: {testResults.attachmentStyle}</Badge>
              </div>
            </div>
            
            {testResults.error && (
              <Badge variant="destructive" className="w-full">
                Error: {testResults.error}
              </Badge>
            )}
            
            <div className="text-xs text-muted-foreground">
              Check console for detailed test results and validation
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};