import { useCallback, useEffect } from 'react';
import { logger } from '@/utils/structuredLogging';
import { PersonalityProfile } from '@/types/tps.types';
import { IntegralDetail } from '@/mappings/integral.enhanced';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

interface AssessmentAnalytics {
  assessmentStarted: (type: string) => void;
  assessmentCompleted: (type: string, duration: number, confidence?: number) => void;
  assessmentAbandoned: (type: string, stage: string, duration: number) => void;
  integralLevelAssigned: (level: number, confidence: number) => void;
  pdfGenerated: (type: 'standard' | 'mobile' | 'enhanced') => void;
  mentorInteraction: (action: 'start_conversation' | 'send_message' | 'view_insights') => void;
  errorOccurred: (component: string, error: string, context?: Record<string, any>) => void;
}

export const useAnalytics = (): AssessmentAnalytics => {
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    // Log to structured logger
    logger.userInteraction(event.event, `Analytics: ${event.event}`, {
      properties: event.properties,
      userId: event.userId,
      timestamp: event.timestamp || Date.now()
    });

    // In production, this would send to analytics service
    if (import.meta.env.PROD) {
      // Example: gtag('event', event.event, event.properties);
      // Example: amplitude.track(event.event, event.properties);
    }
  }, []);

  const assessmentStarted = useCallback((type: string) => {
    trackEvent({
      event: 'assessment_started',
      properties: { 
        assessment_type: type,
        user_agent: navigator.userAgent,
        viewport_width: window.innerWidth,
        viewport_height: window.innerHeight
      }
    });
  }, [trackEvent]);

  const assessmentCompleted = useCallback((type: string, duration: number, confidence?: number) => {
    trackEvent({
      event: 'assessment_completed',
      properties: { 
        assessment_type: type,
        duration_ms: duration,
        confidence_score: confidence,
        completion_rate: 100
      }
    });
  }, [trackEvent]);

  const assessmentAbandoned = useCallback((type: string, stage: string, duration: number) => {
    trackEvent({
      event: 'assessment_abandoned',
      properties: { 
        assessment_type: type,
        abandonment_stage: stage,
        duration_ms: duration,
        completion_rate: getCompletionRate(stage)
      }
    });
  }, [trackEvent]);

  const integralLevelAssigned = useCallback((level: number, confidence: number) => {
    trackEvent({
      event: 'integral_level_assigned',
      properties: { 
        level,
        confidence_score: confidence,
        level_color: getLevelColor(level)
      }
    });
  }, [trackEvent]);

  const pdfGenerated = useCallback((type: 'standard' | 'mobile' | 'enhanced') => {
    trackEvent({
      event: 'pdf_generated',
      properties: { 
        pdf_type: type,
        device_type: window.innerWidth <= 768 ? 'mobile' : 'desktop'
      }
    });
  }, [trackEvent]);

  const mentorInteraction = useCallback((action: 'start_conversation' | 'send_message' | 'view_insights') => {
    trackEvent({
      event: 'mentor_interaction',
      properties: { 
        action,
        session_id: getSessionId()
      }
    });
  }, [trackEvent]);

  const errorOccurred = useCallback((component: string, error: string, context?: Record<string, any>) => {
    trackEvent({
      event: 'error_occurred',
      properties: { 
        component,
        error_message: error,
        context,
        user_agent: navigator.userAgent
      }
    });
  }, [trackEvent]);

  // Page view tracking
  useEffect(() => {
    const handlePageView = () => {
      trackEvent({
        event: 'page_view',
        properties: {
          page: window.location.pathname,
          referrer: document.referrer
        }
      });
    };

    handlePageView();
    
    // Track route changes
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      setTimeout(handlePageView, 0);
    };

    return () => {
      history.pushState = originalPushState;
    };
  }, [trackEvent]);

  return {
    assessmentStarted,
    assessmentCompleted,
    assessmentAbandoned,
    integralLevelAssigned,
    pdfGenerated,
    mentorInteraction,
    errorOccurred
  };
};

// Helper functions
const getCompletionRate = (stage: string): number => {
  const stageMap: Record<string, number> = {
    'initial': 25,
    'clarification': 50,
    'confidence': 75,
    'results': 100
  };
  return stageMap[stage] || 0;
};

const getLevelColor = (level: number): string => {
  const colorMap: Record<number, string> = {
    1: 'Red', 2: 'Amber', 3: 'Orange', 4: 'Green', 5: 'Teal', 6: 'Turquoise'
  };
  return colorMap[level] || 'Unknown';
};

const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Profile analytics utilities
export const getProfileAnalytics = (profile: PersonalityProfile) => ({
  mbti_type: profile.mappings.mbti,
  enneagram_type: profile.mappings.enneagramDetails.type,
  enneagram_wing: profile.mappings.enneagramDetails.wing,
  dominant_traits: Object.keys(profile.dominantTraits),
  top_domain: Object.entries(profile.domainScores)
    .sort(([,a], [,b]) => b - a)[0]?.[0],
  alignment: profile.mappings.dndAlignment,
  holland_code: profile.mappings.hollandCode
});

export const getIntegralAnalytics = (integralDetail: IntegralDetail) => ({
  primary_level: integralDetail.primaryLevel.number,
  primary_color: integralDetail.primaryLevel.color,
  confidence: integralDetail.confidence,
  developmental_edge: !!integralDetail.developmentalEdge,
  has_secondary_level: !!integralDetail.secondaryLevel
});