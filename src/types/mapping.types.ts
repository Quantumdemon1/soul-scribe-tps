// Enhanced type definitions for mapping configurations - Updated to match actual structures

export interface AlignmentAxisConfig {
  lawful?: {
    strong_indicators: string[];
    moderate_indicators: string[];
    description: string;
  };
  good?: {
    strong_indicators: string[];
    moderate_indicators: string[];
    description: string;
  };
  neutral_ethical?: {
    indicators: string[];
    description: string;
  };
  neutral_moral?: {
    indicators: string[];
    description: string;
  };
  chaotic?: {
    strong_indicators: string[];
    moderate_indicators: string[];
    description: string;
  };
  evil?: {
    strong_indicators: string[];
    moderate_indicators: string[];
    description: string;
  };
}

export interface DimensionConfig {
  facets: Record<string, FacetConfig>;
}

export interface FacetConfig {
  high: string[];
  low: string[];
  weight?: number;
}

export interface EnneagramTypeConfig {
  core_traits: {
    primary: string[];
    secondary: string[];
    tertiary: string[];
  };
  instinctual_variants?: Record<string, string[]>;
  health_levels?: Record<string, string[]>;
}

export interface TypeConfig {
  core_traits: string[];
  primary_traits: string[];
  secondary_traits: string[];
  instinctual_variants?: Record<string, string[]>;
  health_levels?: Record<string, string[]>;
  weight?: number;
}

export interface ElementConfig {
  primary: string[];
  secondary: string[];
  tertiary?: string[];
  weight?: number;
}

export interface LevelScore {
  level: string;
  score: number;
  confidence: number;
  description: string;
}

export interface AttachmentStyle {
  style: string;
  score: number;
  confidence: number;
  description: string;
  characteristics: string[];
}

// Use TPS PersonalityProfile instead of redefining
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data?: unknown;
}

export interface LLMResponse {
  insights?: string[];
  recommendations?: string[];
  analysis?: string;
  metadata?: Record<string, unknown>;
}