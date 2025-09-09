import { useEffect } from 'react';
import { loadScoringOverrides, writeLocalOverrides } from '@/services/scoringConfigService';
import { logger } from '@/utils/structuredLogging';

// Fetches global scoring overrides from Supabase once on app start and caches them in localStorage for synchronous access
export function useScoringOverrides() {
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const overrides = await loadScoringOverrides();
        if (!mounted) return;
        writeLocalOverrides(overrides);
      } catch (err) {
        logger.warn('useScoringOverrides: falling back to defaults', { component: 'useScoringOverrides' }, err as Error);
      }
    })();
    return () => { mounted = false; };
  }, []);
}
