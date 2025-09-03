import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { FrameworkInsightsService } from '@/services/frameworkInsightsService';
import { AIInsightsService } from '@/services/aiInsightsService';
import { SocraticClarificationService } from '@/services/socraticClarificationService';
import { PersonalityProfile, TPSScores } from '@/types/tps.types';
import { Database, Zap, Users, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const SAMPLE_PROFILE: PersonalityProfile = {
  dominantTraits: {
    'Cognitive - Processing': 'Analytical',
    'Emotional - Regulation': 'Stoic',
    'Social - Navigation': 'Independent Navigate'
  },
  traitScores: {
    'Analytical': 8.5,
    'Intuitive': 6.2,
    'Pragmatic': 7.1,
    'Stoic': 8.8,
    'Independent Navigate': 7.9
  } as TPSScores,
  domainScores: {
    External: 7.2,
    Internal: 8.1,
    Interpersonal: 6.5,
    Processing: 8.3
  },
  mappings: {
    mbti: 'INTJ',
    enneagram: '5w6',
    enneagramDetails: { type: 5, wing: 6, tritype: '514' },
    bigFive: { openness: 0.85, conscientiousness: 0.78, extraversion: 0.32, agreeableness: 0.65, neuroticism: 0.24 },
    dndAlignment: 'Lawful Neutral',
    socionics: 'LII',
    hollandCode: 'IAR',
    personalityMatches: []
  },
  timestamp: new Date().toISOString()
};

export const CacheIntegrationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const { user } = useAuth();

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    
    try {
      const startTime = Date.now();
      const result = await testFn();
      const endTime = Date.now();
      
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: true,
          duration: endTime - startTime,
          data: result,
          timestamp: new Date().toISOString()
        }
      }));
      
      toast({
        title: `${testName} Test Passed`,
        description: `Completed in ${endTime - startTime}ms`
      });
    } catch (error) {
      console.error(`Test ${testName} failed:`, error);
      setTestResults(prev => ({
        ...prev,
        [testName]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }));
      
      toast({
        title: `${testName} Test Failed`,
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const testFrameworkInsights = async () => {
    const service = new FrameworkInsightsService();
    return await service.generateFrameworkInsights(SAMPLE_PROFILE, SAMPLE_PROFILE.traitScores);
  };

  const testAIInsights = async () => {
    const service = new AIInsightsService();
    return await service.generateInsights(SAMPLE_PROFILE, user?.id);
  };

  const testSocraticQuestions = async () => {
    const service = new SocraticClarificationService();
    const cusps = await service.analyzeCusps(SAMPLE_PROFILE.traitScores);
    return cusps;
  };

  const testCachePerformance = async () => {
    const service = new FrameworkInsightsService();
    
    // First call (should be slow)
    const start1 = Date.now();
    await service.generateFrameworkInsights(SAMPLE_PROFILE, SAMPLE_PROFILE.traitScores);
    const duration1 = Date.now() - start1;
    
    // Second call (should be fast due to caching)
    const start2 = Date.now();
    await service.generateFrameworkInsights(SAMPLE_PROFILE, SAMPLE_PROFILE.traitScores);
    const duration2 = Date.now() - start2;
    
    return {
      firstCall: duration1,
      secondCall: duration2,
      speedup: Math.round(duration1 / duration2)
    };
  };

  const TestCard = ({ 
    title, 
    description, 
    testKey, 
    onTest, 
    icon: Icon,
    color = "default"
  }: {
    title: string;
    description: string;
    testKey: string;
    onTest: () => Promise<any>;
    icon: React.ComponentType<any>;
    color?: "default" | "blue" | "green" | "purple";
  }) => {
    const result = testResults[testKey];
    const isLoading = loading[testKey];

    const colorClasses = {
      default: "border-border",
      blue: "border-blue-200 bg-blue-50/50",
      green: "border-green-200 bg-green-50/50", 
      purple: "border-purple-200 bg-purple-50/50"
    };

    return (
      <Card className={colorClasses[color]}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={() => runTest(testKey, onTest)} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              {isLoading ? 'Running Test...' : 'Run Test'}
            </Button>

            {result && (
              <div className="space-y-2">
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? 'PASSED' : 'FAILED'}
                </Badge>
                
                {result.success && result.duration && (
                  <div className="text-xs text-muted-foreground">
                    Duration: {result.duration}ms
                  </div>
                )}
                
                {result.error && (
                  <div className="text-xs text-destructive">
                    Error: {result.error}
                  </div>
                )}
                
                {result.data && typeof result.data === 'object' && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground">
                      View Result Data
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Please log in to run cache integration tests.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Cache Integration Tests</h2>
        <p className="text-muted-foreground">
          Verify that all caching mechanisms work correctly across services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TestCard
          title="Framework Insights Cache"
          description="Test memory and database caching for framework correlations"
          testKey="framework"
          onTest={testFrameworkInsights}
          icon={Database}
          color="blue"
        />

        <TestCard
          title="AI Insights Cache"
          description="Test comprehensive AI insights generation and caching"
          testKey="ai"
          onTest={testAIInsights}
          icon={Zap}
          color="green"
        />

        <TestCard
          title="Socratic Questions Cache"
          description="Test caching of clarification questions for cusp analysis"
          testKey="socratic"
          onTest={testSocraticQuestions}
          icon={Users}
          color="purple"
        />

        <TestCard
          title="Cache Performance"
          description="Measure cache hit performance vs generation time"
          testKey="performance"
          onTest={testCachePerformance}
          icon={Clock}
          color="default"
        />
      </div>

      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(testResults).map(([key, result]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="font-medium capitalize">{key}</span>
                  <Badge variant={result.success ? "default" : "destructive"}>
                    {result.success ? 'PASSED' : 'FAILED'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};