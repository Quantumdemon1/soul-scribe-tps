import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/structuredLogging';

export type MBTIDimensionKey = 'EI' | 'SN' | 'TF' | 'JP';

export interface ScoringOverrides {
  traitMappings?: Record<string, number[]>; // trait -> question indices (1-based)
  mbti?: Record<MBTIDimensionKey, { traits: Record<string, number>; threshold?: number }>;
}

const LOCAL_STORAGE_KEY = 'tps_scoring_overrides';

export async function loadScoringOverrides(): Promise<ScoringOverrides | null> {
  try {
    const { data, error } = await supabase
      .from('llm_config')
      .select('config, mapping_weights')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    const mappingWeights = (data?.mapping_weights || {}) as any;
    const config = (data?.config || {}) as any;

    const overrides: ScoringOverrides = {
      traitMappings: config?.scoring_overrides?.trait_mappings || mappingWeights?.trait_mappings || undefined,
      mbti: mappingWeights?.mbti || config?.scoring_overrides?.mbti || undefined,
    };

    return (overrides.traitMappings || overrides.mbti) ? overrides : null;
  } catch (err) {
    logger.error('Failed to load scoring overrides', { component: 'scoringConfigService' }, err as Error);
    return null;
  }
}

export async function saveScoringOverrides(partial: ScoringOverrides): Promise<void> {
  try {
    // Read latest existing to preserve other fields
    const { data: existing } = await supabase
      .from('llm_config')
      .select('config, mapping_weights')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const currentConfig = (existing?.config || {}) as any;
    const currentWeights = (existing?.mapping_weights || {}) as any;

    const nextConfig = {
      ...currentConfig,
      scoring_overrides: {
        ...(currentConfig?.scoring_overrides || {}),
        trait_mappings: partial.traitMappings ?? currentConfig?.scoring_overrides?.trait_mappings,
        mbti: partial.mbti ?? currentConfig?.scoring_overrides?.mbti,
      }
    };

    const nextMappingWeights = {
      ...currentWeights,
      trait_mappings: partial.traitMappings ?? currentWeights?.trait_mappings,
      mbti: partial.mbti ?? currentWeights?.mbti,
    };

    const { error } = await supabase.from('llm_config').insert({
      config: nextConfig,
      mapping_weights: nextMappingWeights,
    });

    if (error) throw error;
  } catch (err) {
    logger.error('Failed to save scoring overrides', { component: 'scoringConfigService' }, err as Error);
    throw err;
  }
}

export function writeLocalOverrides(overrides: ScoringOverrides | null) {
  if (!overrides) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    return;
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(overrides));
}

export function readLocalOverrides(): ScoringOverrides | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
