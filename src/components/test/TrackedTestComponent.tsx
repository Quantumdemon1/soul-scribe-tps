import React, { useEffect, useState } from 'react';
import { useTestResultsTracking } from '@/hooks/useTestResultsTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TrackedTestComponentProps {
  testName: string;
  testType: string;
  children: React.ReactNode;
  onTestComplete?: (result: any) => void;
}

export function TrackedTestComponent({ 
  testName, 
  testType, 
  children, 
  onTestComplete 
}: TrackedTestComponentProps) {
  const { currentSession, startTest, updateTest, endTest, logError } = useTestResultsTracking();
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [progress, setProgress] = useState(0);
  const [testResult, setTestResult] = useState<any>(null);

  const handleStartTest = async () => {
    const session = await startTest(testType, testName);
    if (session) {
      setTestStatus('running');
      setProgress(0);
    }
  };

  const handleProgress = async (newProgress: number) => {
    setProgress(newProgress);
    if (currentSession) {
      await updateTest(currentSession.sessionId, {
        completion_percentage: newProgress,
      });
    }
  };

  const handleTestComplete = async (result: any, success: boolean = true) => {
    if (currentSession) {
      const status = success ? 'completed' : 'failed';
      await endTest(currentSession.sessionId, status, {
        score: result?.score || (success ? 100 : 0),
        completion_percentage: 100,
        metadata: {
          result,
          testDetails: { testName, testType },
        },
      });
      
      setTestStatus(status);
      setTestResult(result);
      onTestComplete?.(result);
    }
  };

  const handleError = async (error: any) => {
    if (currentSession) {
      await logError(currentSession.sessionId, error);
      await handleTestComplete(null, false);
    }
  };

  const getStatusIcon = () => {
    switch (testStatus) {
      case 'idle':
        return <PlayCircle className="w-5 h-5" />;
      case 'running':
        return <AlertCircle className="w-5 h-5 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <PlayCircle className="w-5 h-5" />;
    }
  };

  const getStatusBadge = () => {
    switch (testStatus) {
      case 'idle':
        return <Badge variant="outline">Ready</Badge>;
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {testName}
          </div>
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Test Type: {testType} | Session: {currentSession?.sessionId || 'Not started'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {testStatus === 'running' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {testStatus === 'idle' && (
          <Button onClick={handleStartTest} className="w-full">
            <PlayCircle className="w-4 h-4 mr-2" />
            Start Test
          </Button>
        )}

        {testStatus === 'running' && (
          <div className="space-y-4">
            {React.cloneElement(children as React.ReactElement, {
              onProgress: handleProgress,
              onComplete: handleTestComplete,
              onError: handleError,
            })}
          </div>
        )}

        {(testStatus === 'completed' || testStatus === 'failed') && testResult && (
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Test Result</h4>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        {testStatus === 'completed' && (
          <Button 
            onClick={() => {
              setTestStatus('idle');
              setProgress(0);
              setTestResult(null);
            }} 
            variant="outline" 
            className="w-full"
          >
            Run Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}