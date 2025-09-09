import React, { useState } from 'react';
import { TrackedTestComponent } from './TrackedTestComponent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Demo test components that simulate different test scenarios
function DemoAssessmentTest({ onProgress, onComplete, onError }: any) {
  const [step, setStep] = useState(0);
  const totalSteps = 5;

  const runTest = async () => {
    for (let i = 0; i <= totalSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep(i);
      onProgress?.((i / totalSteps) * 100);
      
      // Simulate occasional errors
      if (i === 3 && Math.random() < 0.2) {
        onError?.(new Error('Simulated network timeout'));
        return;
      }
    }
    
    onComplete?.({
      score: Math.round(75 + Math.random() * 25),
      answers: totalSteps,
      timeSpent: totalSteps * 1000,
      testType: 'personality_assessment'
    });
  };

  React.useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="text-center space-y-4">
      <p>Running personality assessment simulation...</p>
      <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
    </div>
  );
}

function DemoPerformanceTest({ onProgress, onComplete, onError }: any) {
  const [metrics, setMetrics] = useState<any>({});

  const runTest = async () => {
    const tests = [
      { name: 'Load Time', target: 2000 },
      { name: 'Memory Usage', target: 50 },
      { name: 'API Response', target: 500 },
      { name: 'Bundle Size', target: 1000 },
    ];

    for (let i = 0; i < tests.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const test = tests[i];
      const actual = test.target * (0.8 + Math.random() * 0.4);
      
      setMetrics((prev: any) => ({
        ...prev,
        [test.name]: {
          actual: Math.round(actual),
          target: test.target,
          passed: actual <= test.target
        }
      }));
      
      onProgress?.((i + 1) / tests.length * 100);
    }

    const allPassed = Object.values(metrics).every((m: any) => m?.passed);
    onComplete?.({
      score: allPassed ? 100 : 75,
      metrics,
      overall: allPassed ? 'PASS' : 'PARTIAL'
    });
  };

  React.useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="space-y-2">
      <p>Running performance benchmarks...</p>
      {Object.entries(metrics).map(([name, data]: [string, any]) => (
        <div key={name} className="flex justify-between text-sm">
          <span>{name}:</span>
          <span className={data.passed ? 'text-green-600' : 'text-red-600'}>
            {data.actual}{name.includes('Size') ? 'kb' : name.includes('Usage') ? '%' : 'ms'}
          </span>
        </div>
      ))}
    </div>
  );
}

function DemoSystemTest({ onProgress, onComplete, onError }: any) {
  const runTest = async () => {
    const checks = ['Database', 'Authentication', 'APIs', 'Storage', 'Security'];
    
    for (let i = 0; i < checks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      onProgress?.((i + 1) / checks.length * 100);
      
      // Simulate random failure
      if (Math.random() < 0.1) {
        onError?.(new Error(`${checks[i]} health check failed`));
        return;
      }
    }

    onComplete?.({
      score: 100,
      checksCompleted: checks.length,
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  };

  React.useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="text-center">
      <p>Checking system health...</p>
      <p className="text-sm text-muted-foreground">Validating core services</p>
    </div>
  );
}

export function DemoTestRunner() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Results Tracking Demo</CardTitle>
          <CardDescription>
            These demo tests showcase the test results tracking system in action.
            All test sessions are logged to the database for analysis in the Test Results tab.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="assessment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assessment">Assessment Test</TabsTrigger>
          <TabsTrigger value="performance">Performance Test</TabsTrigger>
          <TabsTrigger value="system">System Test</TabsTrigger>
        </TabsList>

        <TabsContent value="assessment">
          <TrackedTestComponent
            testName="Personality Assessment Demo"
            testType="assessment"
            onTestComplete={(result) => console.log('Assessment completed:', result)}
          >
            <DemoAssessmentTest />
          </TrackedTestComponent>
        </TabsContent>

        <TabsContent value="performance">
          <TrackedTestComponent
            testName="Performance Benchmark Demo"
            testType="performance"
            onTestComplete={(result) => console.log('Performance test completed:', result)}
          >
            <DemoPerformanceTest />
          </TrackedTestComponent>
        </TabsContent>

        <TabsContent value="system">
          <TrackedTestComponent
            testName="System Health Check Demo"
            testType="system"
            onTestComplete={(result) => console.log('System test completed:', result)}
          >
            <DemoSystemTest />
          </TrackedTestComponent>
        </TabsContent>
      </Tabs>
    </div>
  );
}