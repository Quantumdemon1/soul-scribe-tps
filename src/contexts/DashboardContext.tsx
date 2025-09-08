import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PersonalityProfile } from '@/types/tps.types';
import { AIInsights, CoreInsight, FrameworkInsights } from '@/types/llm.types';
import { FrameworkInsightsService } from '@/services/frameworkInsightsService';
import { AIInsightsService } from '@/services/aiInsightsService';
import { useAuth } from '@/hooks/useAuth';
import { stableHash } from '@/utils/hash';
import { logger } from '@/utils/structuredLogging';

interface DashboardData {
  coreInsights: CoreInsight | null;
  aiInsights: AIInsights | null;
  frameworkInsights: FrameworkInsights | null;
  personalDevelopment: {
    growthAreas: any;
    activities: any;
    tracking: any;
  } | null;
  careerLifestyle: {
    pathways: any;
    workEnvironment: any;
    lifestyle: any;
  } | null;
}

export type { DashboardData };

interface DashboardContextType {
  data: DashboardData;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
  generateSection: (section: keyof DashboardData, profile: PersonalityProfile) => Promise<void>;
  refreshSection: (section: keyof DashboardData, profile: PersonalityProfile) => Promise<void>;
  clearCache: () => void;
  isDataStale: (section: keyof DashboardData) => boolean;
  getLastGenerated: (section: keyof DashboardData) => string | null;
  preloadSection: (section: keyof DashboardData, profile: PersonalityProfile) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
  profile: PersonalityProfile;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const STORAGE_KEY_PREFIX = 'dashboard_cache_';

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children, profile }) => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    coreInsights: null,
    aiInsights: null,
    frameworkInsights: null,
    personalDevelopment: null,
    careerLifestyle: null,
  });

  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [timestamps, setTimestamps] = useState<Record<string, number>>({});

  const frameworkService = new FrameworkInsightsService();
  const aiInsightsService = new AIInsightsService();

  const getCacheKey = (section: string) => `${STORAGE_KEY_PREFIX}${section}_${user?.id || 'anonymous'}`;

  const loadFromCache = (section: keyof DashboardData) => {
    try {
      const cacheKey = getCacheKey(section);
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        
        // Check if cache is still valid
        if (Date.now() - timestamp < CACHE_DURATION) {
          setData(prev => ({ ...prev, [section]: cachedData }));
          setTimestamps(prev => ({ ...prev, [section]: timestamp }));
          return true;
        }
      }
    } catch (error) {
      logger.error(`Failed to load cache for ${section}`, {
        component: 'DashboardContext',
        action: 'loadCache',
        metadata: { section }
      }, error as Error);
    }
    return false;
  };

  const saveToCache = (section: keyof DashboardData, sectionData: any) => {
    try {
      const cacheKey = getCacheKey(section);
      const timestamp = Date.now();
      const cacheEntry = {
        data: sectionData,
        timestamp,
        profileVersion: new Date(profile.timestamp).getTime() || 0,
        userId: user?.id
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      setTimestamps(prev => ({ ...prev, [section]: timestamp }));
      
      // Also save to database for persistent cross-device access
      if (user?.id) {
        saveToDatabaseCache(section, sectionData, cacheKey);
      }
    } catch (error) {
      logger.error(`Failed to save cache for ${section}`, {
        component: 'DashboardContext',
        action: 'saveCache',
        metadata: { section }
      }, error as Error);
    }
  };

  const saveToDatabaseCache = async (section: string, sectionData: any, cacheKey: string) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      await supabase
        .from('ai_insights')
        .upsert({
          user_id: user?.id,
          insight_type: 'dashboard_cache',
          section_name: section,
          content: sectionData,
          cache_key: cacheKey,
          model_used: 'dashboard-cache',
          version: 1
        }, {
          onConflict: 'user_id,insight_type'
        });
    } catch (error) {
      console.warn(`Failed to save database cache for ${section}:`, error);
    }
  };

  const isDataStale = (section: keyof DashboardData) => {
    const timestamp = timestamps[section];
    if (!timestamp) return true;
    return Date.now() - timestamp > CACHE_DURATION;
  };

  const setLoadingState = (section: string, isLoading: boolean) => {
    setLoading(prev => ({ ...prev, [section]: isLoading }));
  };

  const setErrorState = (section: string, error: string | null) => {
    setErrors(prev => ({ ...prev, [section]: error }));
  };

  const generateSection = async (section: keyof DashboardData, currentProfile: PersonalityProfile) => {
    // Check if data already exists and is fresh
    if (data[section] && !isDataStale(section)) {
      return;
    }

    if (loading[section]) return;

    setLoadingState(section, true);
    setErrorState(section, null);

    try {
      await _doGenerateSection(section, currentProfile);
    } catch (error) {
      console.error(`Error generating ${section}:`, error);
      setErrorState(section, `Failed to generate ${section.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    } finally {
      setLoadingState(section, false);
    }
  };

  const refreshSection = async (section: keyof DashboardData, currentProfile: PersonalityProfile) => {
    if (loading[section]) return;

    setLoadingState(section, true);
    setErrorState(section, null);

    try {
      // Force regeneration by clearing cache first
      const cacheKey = getCacheKey(section);
      localStorage.removeItem(cacheKey);
      
      await _doGenerateSection(section, currentProfile);
    } catch (error) {
      console.error(`Error refreshing ${section}:`, error);
      setErrorState(section, `Failed to refresh ${section.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    } finally {
      setLoadingState(section, false);
    }
  };

  const preloadSection = async (section: keyof DashboardData, currentProfile: PersonalityProfile) => {
    // Only preload if data doesn't exist and not currently loading
    if (data[section] || loading[section]) return;

    try {
      await _doGenerateSection(section, currentProfile);
    } catch (error) {
      console.warn(`Error preloading ${section}:`, error);
      // Don't set error state for preloading failures
    }
  };

  const _doGenerateSection = async (section: keyof DashboardData, currentProfile: PersonalityProfile) => {
    switch (section) {
      case 'coreInsights':
        const coreInsights = await frameworkService.generateCoreInsights(currentProfile);
        setData(prev => ({ ...prev, coreInsights }));
        saveToCache(section, coreInsights);
        break;

      case 'aiInsights':
        const aiInsights = await aiInsightsService.generateInsights(currentProfile, user?.id);
        setData(prev => ({ ...prev, aiInsights }));
        saveToCache(section, aiInsights);
        break;

      case 'frameworkInsights':
        // Framework insights will be loaded from existing components for now
        // This section can be implemented later when needed
        break;

      case 'personalDevelopment':
        const [growthAreas, activities, tracking] = await Promise.all([
          frameworkService.generatePersonalizedGrowthAreas(currentProfile),
          frameworkService.generateDevelopmentActivities(currentProfile),
          frameworkService.generateProgressTracking(currentProfile)
        ]);
        const personalDevelopment = { growthAreas, activities, tracking };
        setData(prev => ({ ...prev, personalDevelopment }));
        saveToCache(section, personalDevelopment);
        break;

      case 'careerLifestyle':
        const [pathways, workEnvironment, lifestyle] = await Promise.all([
          frameworkService.generateCareerPathways(currentProfile),
          frameworkService.generateWorkEnvironmentPreferences(currentProfile),
          frameworkService.generateLifestyleRecommendations(currentProfile)
        ]);
        const careerLifestyle = { pathways, workEnvironment, lifestyle };
        setData(prev => ({ ...prev, careerLifestyle }));
        saveToCache(section, careerLifestyle);
        break;

      default:
        throw new Error(`Unknown section: ${section}`);
    }
  };

  const getLastGenerated = (section: keyof DashboardData): string | null => {
    const timestamp = timestamps[section];
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleString();
  };

  const clearCache = () => {
    Object.keys(data).forEach(section => {
      const cacheKey = getCacheKey(section);
      localStorage.removeItem(cacheKey);
    });
    setData({
      coreInsights: null,
      aiInsights: null,
      frameworkInsights: null,
      personalDevelopment: null,
      careerLifestyle: null,
    });
    setTimestamps({});
  };

  // Load cached data on mount
  useEffect(() => {
    const sections: (keyof DashboardData)[] = [
      'coreInsights', 
      'aiInsights', 
      'frameworkInsights', 
      'personalDevelopment', 
      'careerLifestyle'
    ];
    
    sections.forEach(section => {
    loadFromCache(section);
  });
}, [user?.id]);

  // Clear cache only if profile structure changes significantly (not just timestamp)
  useEffect(() => {
    const currentProfileHash = stableHash({
      traitScores: profile.traitScores,
      dominantTraits: profile.dominantTraits,
      domainScores: profile.domainScores
    });
    
    const lastProfileHash = localStorage.getItem(`${STORAGE_KEY_PREFIX}profile_hash_${user?.id || 'anonymous'}`);
    
    if (lastProfileHash && lastProfileHash !== currentProfileHash) {
      console.log('Profile structure changed significantly, clearing cache');
      clearCache();
    }
    
    localStorage.setItem(`${STORAGE_KEY_PREFIX}profile_hash_${user?.id || 'anonymous'}`, currentProfileHash);
  }, [profile.traitScores, profile.dominantTraits, profile.domainScores, user?.id]);

  return (
    <DashboardContext.Provider
      value={{
        data,
        loading,
        errors,
        generateSection,
        refreshSection,
        clearCache,
        isDataStale,
        getLastGenerated,
        preloadSection,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};