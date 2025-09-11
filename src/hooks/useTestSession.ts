import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/structuredLogging';

export interface TestSession {
  id: string;
  user_id: string;
  session_token: string;
  test_type: string;
  test_name: string;
  current_page: number;
  total_pages: number;
  responses: any; // JSON field from database
  metadata: any; // JSON field from database  
  status: string; // Database status field
  expires_at: string;
  last_activity: string;
  created_at: string;
  updated_at: string;
  completion_percentage: number;
  profiles?: {
    display_name?: string;
    username?: string;
  };
}

export function useTestSession() {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<TestSession | null>(null);
  const [loading, setLoading] = useState(false);

  const generateSessionToken = useCallback(() => {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const createSession = useCallback(async (
    testType: string,
    testName: string,
    totalPages: number
  ): Promise<TestSession | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      const sessionToken = generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiration

      const { data, error } = await supabase
        .from('test_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          test_type: testType,
          test_name: testName,
          current_page: 0,
          total_pages: totalPages,
          responses: [],
          metadata: {},
          status: 'active',
          expires_at: expiresAt.toISOString(),
          completion_percentage: 0
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSession(data as TestSession);
      return data as TestSession;
    } catch (error) {
      logger.error('Failed to create test session', {
        component: 'useTestSession',
        action: 'createSession',
        metadata: { testType, testName, totalPages }
      }, error as Error);
      toast({
        title: "Session Error",
        description: "Failed to create test session. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, generateSessionToken]);

  const updateSession = useCallback(async (
    sessionId: string,
    updates: Partial<TestSession>
  ): Promise<void> => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('test_sessions')
        .update({
          ...updates,
          last_activity: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;

      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      logger.error('Failed to update test session', {
        component: 'useTestSession',
        action: 'updateSession',
        metadata: { sessionId, updates: Object.keys(updates) }
      }, error as Error);
    }
  }, [user, currentSession]);

  const resumeSession = useCallback(async (sessionToken: string): Promise<TestSession | null> => {
    if (!user) return null;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('test_sessions')
        .select()
        .eq('session_token', sessionToken)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error) throw error;

      // Check if session is expired
      if (new Date(data.expires_at) < new Date()) {
        await updateSession(data.id, { status: 'expired' });
        toast({
          title: "Session Expired",
          description: "This test session has expired. Please start a new test.",
          variant: "destructive"
        });
        return null;
      }

      setCurrentSession(data as TestSession);
      return data as TestSession;
    } catch (error) {
      logger.error('Failed to resume test session', {
        component: 'useTestSession',
        action: 'resumeSession',
        metadata: { sessionToken }
      }, error as Error);
      toast({
        title: "Resume Error",
        description: "Failed to resume test session. Please start a new test.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, updateSession]);

  const completeSession = useCallback(async (
    sessionId: string,
    finalResponses: number[]
  ): Promise<void> => {
    if (!user) return;

    try {
      await updateSession(sessionId, {
        status: 'completed',
        responses: finalResponses,
        completion_percentage: 100,
        current_page: currentSession?.total_pages || 0
      });
    } catch (error) {
      logger.error('Failed to complete test session', {
        component: 'useTestSession',
        action: 'completeSession',
        metadata: { sessionId, responseCount: finalResponses.length }
      }, error as Error);
    }
  }, [user, updateSession, currentSession]);

  const abandonSession = useCallback(async (sessionId: string): Promise<void> => {
    if (!user) return;

    try {
      await updateSession(sessionId, { status: 'abandoned' });
    } catch (error) {
      logger.error('Failed to abandon test session', {
        component: 'useTestSession',
        action: 'abandonSession',
        metadata: { sessionId }
      }, error as Error);
    }
  }, [user, updateSession]);

  const getActiveSession = useCallback(async (testType: string): Promise<TestSession | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('test_sessions')
        .select()
        .eq('user_id', user.id)
        .eq('test_type', testType)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as TestSession;
    } catch (error) {
      logger.error('Failed to get active session', {
        component: 'useTestSession',
        action: 'getActiveSession',
        metadata: { testType }
      }, error as Error);
      return null;
    }
  }, [user]);

  const generateShareableLink = useCallback((sessionToken: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?resume=${sessionToken}`;
  }, []);

  return {
    currentSession,
    loading,
    createSession,
    updateSession,
    resumeSession,
    completeSession,
    abandonSession,
    getActiveSession,
    generateShareableLink
  };
}