import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/structuredLogging';

export type MBTIDimensionKey = 'EI' | 'SN' | 'TF' | 'JP';
export type FrameworkType = 'mbti' | 'bigfive' | 'enneagram' | 'alignment' | 'holland' | 'socionics' | 'integral' | 'attachment';

export interface FrameworkWeights {
  [key: string]: {
    traits: Record<string, number>;
    threshold?: number;
    scaling?: number;
  };
}

export interface ScoringOverrides {
  traitMappings?: Record<string, number[]>; // trait -> question indices (1-based)
  mbti?: Record<MBTIDimensionKey, { traits: Record<string, number>; threshold?: number }>;
  bigfive?: FrameworkWeights;
  enneagram?: FrameworkWeights;
  alignment?: FrameworkWeights;
  holland?: FrameworkWeights;
  socionics?: FrameworkWeights;
  integral?: FrameworkWeights;
  attachment?: FrameworkWeights;
}

export interface UserOverride {
  userId: string;
  framework: FrameworkType;
  overrides: Partial<ScoringOverrides>;
  reason?: string;
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
      bigfive: config?.scoring_overrides?.bigfive || mappingWeights?.bigfive || undefined,
      enneagram: config?.scoring_overrides?.enneagram || mappingWeights?.enneagram || undefined,
      alignment: config?.scoring_overrides?.alignment || mappingWeights?.alignment || undefined,
      holland: config?.scoring_overrides?.holland || mappingWeights?.holland || undefined,
      socionics: config?.scoring_overrides?.socionics || mappingWeights?.socionics || undefined,
      integral: config?.scoring_overrides?.integral || mappingWeights?.integral || undefined,
      attachment: config?.scoring_overrides?.attachment || mappingWeights?.attachment || undefined,
    };

    return Object.values(overrides).some(v => v !== undefined) ? overrides : null;
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
        bigfive: partial.bigfive ?? currentConfig?.scoring_overrides?.bigfive,
        enneagram: partial.enneagram ?? currentConfig?.scoring_overrides?.enneagram,
        alignment: partial.alignment ?? currentConfig?.scoring_overrides?.alignment,
        holland: partial.holland ?? currentConfig?.scoring_overrides?.holland,
        socionics: partial.socionics ?? currentConfig?.scoring_overrides?.socionics,
        integral: partial.integral ?? currentConfig?.scoring_overrides?.integral,
        attachment: partial.attachment ?? currentConfig?.scoring_overrides?.attachment,
      }
    };

    const nextMappingWeights = {
      ...currentWeights,
      trait_mappings: partial.traitMappings ?? currentWeights?.trait_mappings,
      mbti: partial.mbti ?? currentWeights?.mbti,
      bigfive: partial.bigfive ?? currentWeights?.bigfive,
      enneagram: partial.enneagram ?? currentWeights?.enneagram,
      alignment: partial.alignment ?? currentWeights?.alignment,
      holland: partial.holland ?? currentWeights?.holland,
      socionics: partial.socionics ?? currentWeights?.socionics,
      integral: partial.integral ?? currentWeights?.integral,
      attachment: partial.attachment ?? currentWeights?.attachment,
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

export async function saveUserOverride(userId: string, framework: FrameworkType, overrides: Partial<ScoringOverrides>, reason?: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('personality_overrides')
      .upsert({
        user_id: userId,
        created_by: (await supabase.auth.getUser()).data.user?.id || '',
        [`${framework}_override`]: overrides[framework],
        metadata: { reason, framework, timestamp: new Date().toISOString() }
      }, { onConflict: 'user_id' });

    if (error) throw error;
  } catch (err) {
    logger.error('Failed to save user override', { component: 'scoringConfigService' }, err as Error);
    throw err;
  }
}

export async function loadUserOverride(userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('personality_overrides')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') throw error;
      return null;
    }
    return data;
  } catch (err) {
    logger.error('Failed to load user override', { component: 'scoringConfigService' }, err as Error);
    return null;
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