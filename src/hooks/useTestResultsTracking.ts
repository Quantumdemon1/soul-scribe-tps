import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface TestResult {
  id: string;
  user_id: string;
  session_id: string;
  test_type: string;
  test_name: string;
  status: 'started' | 'completed' | 'abandoned' | 'failed';
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  completion_percentage: number;
  score?: number;
  metadata: Record<string, any>;
  errors: any[];
  performance_metrics: Record<string, any>;
  browser_info: Record<string, any>;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name?: string;
    username?: string;
  };
}

export interface TestSession {
  sessionId: string;
  startTime: Date;
  testType: string;
  testName: string;
}

export function useTestResultsTracking() {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<TestSession | null>(null);

  const startTest = useCallback(async (testType: string, testName: string) => {
    if (!user) return null;

    const sessionId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = new Date();

    const browserInfo = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };

    try {
      const { data, error } = await supabase
        .from('test_results')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          test_type: testType,
          test_name: testName,
          status: 'started',
          browser_info: browserInfo,
          metadata: {},
          errors: [],
          performance_metrics: {},
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to start test tracking:', error);
        return null;
      }

      const session = {
        sessionId,
        startTime,
        testType,
        testName,
      };

      setCurrentSession(session);
      // Store session ID for reference
      sessionStorage.setItem('currentTestSession', sessionId);
      return session;
    } catch (error) {
      console.error('Error starting test tracking:', error);
      return null;
    }
  }, [user]);

  const updateTest = useCallback(async (
    sessionId: string,
    updates: {
      completion_percentage?: number;
      score?: number;
      metadata?: Record<string, any>;
      performance_metrics?: Record<string, any>;
    }
  ) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('test_results')
        .update(updates)
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to update test:', error);
      }
    } catch (error) {
      console.error('Error updating test:', error);
    }
  }, [user]);

  const endTest = useCallback(async (
    sessionId: string,
    status: 'completed' | 'abandoned' | 'failed',
    finalData?: {
      score?: number;
      completion_percentage?: number;
      metadata?: Record<string, any>;
    }
  ) => {
    if (!user || !currentSession) return;

    const endTime = new Date();
    const duration = endTime.getTime() - currentSession.startTime.getTime();

    try {
      const { error } = await supabase
        .from('test_results')
        .update({
          status,
          end_time: endTime.toISOString(),
          duration_ms: duration,
          ...finalData,
        })
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to end test:', error);
      } else {
        setCurrentSession(null);
        sessionStorage.removeItem('currentTestSession');
      }
    } catch (error) {
      console.error('Error ending test:', error);
    }
  }, [user, currentSession]);

  const logError = useCallback(async (sessionId: string, error: any) => {
    if (!user) return;

    try {
      const { data: currentData } = await supabase
        .from('test_results')
        .select('errors')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .single();

      const currentErrors = Array.isArray(currentData?.errors) ? currentData.errors : [];
      const newError = {
        timestamp: new Date().toISOString(),
        message: error.message || String(error),
        stack: error.stack,
        type: error.constructor.name,
      };

      await supabase
        .from('test_results')
        .update({
          errors: [...currentErrors, newError],
        })
        .eq('session_id', sessionId)
        .eq('user_id', user.id);
    } catch (updateError) {
      console.error('Error logging test error:', updateError);
    }
  }, [user]);

  return {
    currentSession,
    startTest,
    updateTest,
    endTest,
    logError,
  };
}