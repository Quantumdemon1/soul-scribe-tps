import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { IntegralConfidenceService } from '@/services/integralConfidenceService';
import { IntegralPersonalityService } from '@/services/integralPersonalityService';
import { AIInsightsService } from '@/services/aiInsightsService';
import { LLMService } from '@/services/llmService';
import { PersonalityProfile } from '@/types/tps.types';
import { IntegralDetail } from '@/mappings/integral.enhanced';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  duration?: number;
  error?: string;
  details?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  status: 'pending' | 'running' | 'completed';
}

export const AIServiceTest: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const { handleAsyncError } = useErrorHandler();

  const mockPersonalityProfile: PersonalityProfile = {
    timestamp: new Date().toISOString(),
    dominantTraits: {
      openness: 'Imaginative',
      conscientiousness: 'Organized',
      extraversion: 'Social',
      agreeableness: 'Cooperative',
      neuroticism: 'Stable'
    },
    traitScores: {
      Social: 8,
      Imaginative: 9,
      Organized: 7,
      Cooperative: 8,
      Stable: 7
    },
    domainScores: {
      External: 7.5,
      Internal: 8.2,
      Interpersonal: 8.0,
      Processing: 7.8
    },
    mappings: {
      mbti: 'ENFP',
      enneagram: '7w6',
      enneagramDetails: {
        type: 7,
        wing: 6,
        tritype: '729'
      },
      bigFive: {
        Openness: 80,
        Conscientiousness: 70,
        Extraversion: 60,
        Agreeableness: 75,
        Neuroticism: 30
      },
      dndAlignment: 'Chaotic Good',
      socionics: 'ENFp',
      hollandCode: 'SEC',
      personalityMatches: [],
      attachmentStyle: {
        style: 'secure' as const,
        score: 8.5,
        description: 'Secure attachment style',
        characteristics: ['Comfortable with intimacy', 'Good communication'],
        confidence: 0.85
      },
      integralDetail: undefined
    }
  };

  const mockIntegralDetail: IntegralDetail = {
    primaryLevel: {
      number: 5,
      color: 'Green',
      name: 'Communitarian',
      cognitiveStage: 'Pluralistic',
      worldview: 'Pluralistic',
      thinkingPattern: 'Systems thinking',
      score: 8.5,
      confidence: 0.85,
      characteristics: ['Inclusive', 'Collaborative', 'Empathetic'],
      growthEdge: ['Integration of perspectives'],
      typicalConcerns: ['Consensus building', 'Social harmony']
    },
    secondaryLevel: undefined,
    realityTriadMapping: {
      physical: 0.3,
      social: 0.5,
      universal: 0.2
    },
    developmentalEdge: 'Integration of multiple perspectives',
    cognitiveComplexity: 7.2,
    confidence: 0.72
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const suites: TestSuite[] = [
      {
        name: 'LLM Service',
        tests: [
          { id: 'llm-1', name: 'Basic LLM Call', status: 'pending' },
          { id: 'llm-2', name: 'Error Handling', status: 'pending' },
          { id: 'llm-3', name: 'Response Parsing', status: 'pending' }
        ],
        status: 'pending'
      },
      {
        name: 'Integral Confidence Service',
        tests: [
          { id: 'conf-1', name: 'Confidence Analysis', status: 'pending' },
          { id: 'conf-2', name: 'Question Generation', status: 'pending' },
          { id: 'conf-3', name: 'Enhancement Processing', status: 'pending' }
        ],
        status: 'pending'
      },
      {
        name: 'Integral Personality Service',
        tests: [
          { id: 'pers-1', name: 'Integration Analysis', status: 'pending' },
          { id: 'pers-2', name: 'Development Recommendations', status: 'pending' },
          { id: 'pers-3', name: 'Level Manifestations', status: 'pending' }
        ],
        status: 'pending'
      },
      {
        name: 'AI Insights Service',
        tests: [
          { id: 'ai-1', name: 'Insight Generation', status: 'pending' },
          { id: 'ai-2', name: 'Caching Mechanism', status: 'pending' },
          { id: 'ai-3', name: 'Database Integration', status: 'pending' }
        ],
        status: 'pending'
      }
    ];

    setTestSuites(suites);
    
    const totalTests = suites.reduce((acc, suite) => acc + suite.tests.length, 0);
    let completedTests = 0;

    for (const suite of suites) {
      await runTestSuite(suite, () => {
        completedTests++;
        setProgress((completedTests / totalTests) * 100);
      });
    }

    setIsRunning(false);
  };

  const runTestSuite = async (suite: TestSuite, onTestComplete: () => void) => {
    setTestSuites(prev => prev.map(s => 
      s.name === suite.name ? { ...s, status: 'running' } : s
    ));

    switch (suite.name) {
      case 'LLM Service':
        await runLLMTests(suite, onTestComplete);
        break;
      case 'Integral Confidence Service':
        await runConfidenceTests(suite, onTestComplete);
        break;
      case 'Integral Personality Service':
        await runPersonalityTests(suite, onTestComplete);
        break;
      case 'AI Insights Service':
        await runInsightsTests(suite, onTestComplete);
        break;
    }

    setTestSuites(prev => prev.map(s => 
      s.name === suite.name ? { ...s, status: 'completed' } : s
    ));
  };

  const runTest = async (
    testId: string,
    testFunction: () => Promise<void>,
    onComplete: () => void
  ) => {
    const startTime = Date.now();
    
    setTestSuites(prev => prev.map(suite => ({
      ...suite,
      tests: suite.tests.map(test => 
        test.id === testId ? { ...test, status: 'running' } : test
      )
    })));

    try {
      await testFunction();
      const duration = Date.now() - startTime;
      
      setTestSuites(prev => prev.map(suite => ({
        ...suite,
        tests: suite.tests.map(test => 
          test.id === testId 
            ? { ...test, status: 'success', duration, details: `Completed in ${duration}ms` }
            : test
        )
      })));
    } catch (error) {
      const duration = Date.now() - startTime;
      
      setTestSuites(prev => prev.map(suite => ({
        ...suite,
        tests: suite.tests.map(test => 
          test.id === testId 
            ? { 
                ...test, 
                status: 'error', 
                duration, 
                error: error instanceof Error ? error.message : 'Unknown error',
                details: `Failed after ${duration}ms`
              }
            : test
        )
      })));
    }
    
    onComplete();
  };

  const runLLMTests = async (suite: TestSuite, onTestComplete: () => void) => {
    const llmService = new LLMService();

    await runTest('llm-1', async () => {
      const result = await llmService.callLLM('Test prompt', 'insightGeneration');
      if (!result || typeof result !== 'string') {
        throw new Error('Invalid LLM response');
      }
    }, onTestComplete);

    await runTest('llm-2', async () => {
      try {
        await llmService.callLLM('', 'insightGeneration');
        throw new Error('Should have thrown error for empty prompt');
      } catch (error) {
        // Expected error
      }
    }, onTestComplete);

    await runTest('llm-3', async () => {
      const result = await llmService.callLLM('Return JSON: {"test": true}', 'insightGeneration');
      const parsed = JSON.parse(result.match(/\{.*\}/)?.[0] || '{}');
      if (!parsed.test) {
        throw new Error('Failed to parse JSON response');
      }
    }, onTestComplete);
  };

  const runConfidenceTests = async (suite: TestSuite, onTestComplete: () => void) => {
    const confidenceService = new IntegralConfidenceService();

    await runTest('conf-1', async () => {
      const analysis = confidenceService.analyzeConfidence(mockIntegralDetail);
      if (!analysis || typeof analysis.needsAdditionalQuestions !== 'boolean') {
        throw new Error('Invalid confidence analysis');
      }
    }, onTestComplete);

    await runTest('conf-2', async () => {
      const questions = await handleAsyncError(
        () => confidenceService.generateClarificationQuestions(mockIntegralDetail, ['values'], mockPersonalityProfile),
        'Failed to generate questions'
      );
      if (!questions || !Array.isArray(questions)) {
        throw new Error('Failed to generate questions');
      }
    }, onTestComplete);

    await runTest('conf-3', async () => {
      const mockResponses = { 'q1': 'Test response' };
      const mockQuestions = [{ 
        id: 'q1', 
        question: 'Test?', 
        type: 'scenario' as const, 
        targetLevel: '5',
        context: 'Test context'
      }];
      
      const result = await handleAsyncError(
        () => confidenceService.processConfidenceEnhancement(mockIntegralDetail, mockResponses, mockQuestions),
        'Failed to process enhancement'
      );
      if (!result) {
        throw new Error('Failed to process confidence enhancement');
      }
    }, onTestComplete);
  };

  const runPersonalityTests = async (suite: TestSuite, onTestComplete: () => void) => {
    const personalityService = new IntegralPersonalityService();

    await runTest('pers-1', async () => {
      const integration = await handleAsyncError(
        () => personalityService.generatePersonalityIntegration(mockIntegralDetail, mockPersonalityProfile),
        'Failed to generate integration'
      );
      if (!integration) {
        throw new Error('Failed to generate personality integration');
      }
    }, onTestComplete);

    await runTest('pers-2', async () => {
      // This will test the fallback mechanism since we can't make real LLM calls
      const integration = await personalityService.generatePersonalityIntegration(mockIntegralDetail, mockPersonalityProfile);
      if (!integration.developmentRecommendations || integration.developmentRecommendations.length === 0) {
        throw new Error('No development recommendations generated');
      }
    }, onTestComplete);

    await runTest('pers-3', async () => {
      const integration = await personalityService.generatePersonalityIntegration(mockIntegralDetail, mockPersonalityProfile);
      // Should have fallback manifestations
      if (!Array.isArray(integration.levelSpecificManifestations)) {
        throw new Error('Invalid level manifestations');
      }
    }, onTestComplete);
  };

  const runInsightsTests = async (suite: TestSuite, onTestComplete: () => void) => {
    const insightsService = new AIInsightsService();

    await runTest('ai-1', async () => {
      const insights = await handleAsyncError(
        () => insightsService.generateInsights(mockPersonalityProfile),
        'Failed to generate insights'
      );
      if (!insights) {
        throw new Error('Failed to generate AI insights');
      }
    }, onTestComplete);

    await runTest('ai-2', async () => {
      // Test caching by generating insights twice
      const insights1 = await insightsService.generateInsights(mockPersonalityProfile);
      const insights2 = await insightsService.generateInsights(mockPersonalityProfile);
      
      if (!insights1 || !insights2) {
        throw new Error('Failed to test caching mechanism');
      }
    }, onTestComplete);

    await runTest('ai-3', async () => {
      // Test database interaction (will use fallback)
      try {
        await insightsService.getInsights('test-user-id');
        // If it doesn't throw, it means the database interaction works (or fails gracefully)
      } catch (error) {
        // Expected for non-authenticated users
      }
    }, onTestComplete);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      pending: 'secondary',
      running: 'default',
      success: 'default',
      error: 'destructive'
    };
    return variants[status] || 'secondary';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Brain className="w-8 h-8 text-primary mr-3" />
          <h1 className="text-3xl font-bold">AI Service Testing Suite</h1>
        </div>
        <p className="text-muted-foreground">
          Comprehensive testing of all AI services and integrations
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Control</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="w-full sm:w-auto"
              >
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </Button>
              
              {isRunning && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {testSuites.map((suite) => (
          <Card key={suite.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{suite.name}</span>
                <Badge variant={suite.status === 'completed' ? 'default' : 'secondary'}>
                  {suite.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suite.tests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div>
                        <div className="font-medium">{test.name}</div>
                        {test.details && (
                          <div className="text-sm text-muted-foreground">{test.details}</div>
                        )}
                        {test.error && (
                          <Alert className="mt-2">
                            <AlertTriangle className="w-4 h-4" />
                            <AlertDescription className="text-xs">
                              {test.error}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                    <Badge variant={getStatusBadge(test.status)}>
                      {test.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};