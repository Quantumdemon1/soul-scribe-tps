import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TPSScores, PersonalityProfile } from '@/types/tps.types';
import { SocraticSession, CuspAnalysis, ConversationTurn } from '@/types/llm.types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/structuredLogging';

interface SocraticSessionContextType {
  currentSession: SocraticSession | null;
  saveSession: (session: SocraticSession) => Promise<void>;
  loadSession: (sessionId: string) => Promise<SocraticSession | null>;
  createSession: (initialScores: TPSScores, cusps: CuspAnalysis[]) => SocraticSession;
  updateSession: (sessionId: string, updates: Partial<SocraticSession>) => Promise<void>;
}

const SocraticSessionContext = createContext<SocraticSessionContextType | undefined>(undefined);

export const useSocraticSession = () => {
  const context = useContext(SocraticSessionContext);
  if (!context) {
    throw new Error('useSocraticSession must be used within a SocraticSessionProvider');
  }
  return context;
};

interface SocraticSessionProviderProps {
  children: ReactNode;
}

export const SocraticSessionProvider: React.FC<SocraticSessionProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<SocraticSession | null>(null);
  const { user } = useAuth();

  const createSession = (initialScores: TPSScores, cusps: CuspAnalysis[]): SocraticSession => {
    const session: SocraticSession = {
      id: crypto.randomUUID(),
      userId: user?.id || 'anonymous',
      initialScores,
      cusps,
      conversations: [],
      finalScores: initialScores,
      timestamp: new Date()
    };

    setCurrentSession(session);
    return session;
  };

  const saveSession = async (session: SocraticSession): Promise<void> => {
    if (!user) {
      // Save to localStorage for anonymous users
      localStorage.setItem(`socratic-session-${session.id}`, JSON.stringify(session));
      return;
    }

    try {
      const { error } = await supabase
        .from('socratic_sessions')
        .upsert({
          id: session.id,
          user_id: session.userId,
          initial_scores: session.initialScores as any,
          cusps: session.cusps as any,
          conversations: session.conversations as any,
          final_scores: session.finalScores as any
        });

      if (error) {
        logger.error('Error saving session', { component: 'useSocraticSession' }, error as Error);
        // Fallback to localStorage
        localStorage.setItem(`socratic-session-${session.id}`, JSON.stringify(session));
      }
    } catch (error) {
      logger.error('Error saving session fallback', { component: 'useSocraticSession' }, error as Error);
    }
  };

  const loadSession = async (sessionId: string): Promise<SocraticSession | null> => {
    if (!user) {
      // Load from localStorage for anonymous users
      const stored = localStorage.getItem(`socratic-session-${sessionId}`);
      return stored ? JSON.parse(stored) : null;
    }

    try {
      const { data, error } = await supabase
        .from('socratic_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        return null;
      }

      const session: SocraticSession = {
        id: data.id,
        userId: data.user_id,
        initialScores: data.initial_scores as TPSScores,
        cusps: data.cusps as unknown as CuspAnalysis[],
        conversations: data.conversations as unknown as ConversationTurn[],
        finalScores: data.final_scores as TPSScores,
        timestamp: new Date(data.created_at)
      };

      setCurrentSession(session);
      return session;
    } catch (error) {
      logger.error('Error loading session', { component: 'useSocraticSession' }, error as Error);
      return null;
    }
  };

  const updateSession = async (sessionId: string, updates: Partial<SocraticSession>): Promise<void> => {
    if (!currentSession || currentSession.id !== sessionId) {
      return;
    }

    const updatedSession = { ...currentSession, ...updates };
    setCurrentSession(updatedSession);
    await saveSession(updatedSession);
  };

  return (
    <SocraticSessionContext.Provider
      value={{
        currentSession,
        saveSession,
        loadSession,
        createSession,
        updateSession
      }}
    >
      {children}
    </SocraticSessionContext.Provider>
  );
};