export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'local';
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompts: {
    tieBreaking: string;
    insightGeneration: string;
    careerGuidance: string;
    developmentPlanning: string;
  };
}

export interface CuspAnalysis {
  triad: string;
  traits: string[];
  scores: number[];
  requiresClarification: boolean;
  clarificationQuestions?: string[];
}

export interface SocraticSession {
  id: string;
  userId: string;
  initialScores: import('./tps.types').TPSScores;
  cusps: CuspAnalysis[];
  conversations: ConversationTurn[];
  finalScores: import('./tps.types').TPSScores;
  timestamp: Date;
}

export interface ConversationTurn {
  question: string;
  response: string;
  traitAdjustments: Record<string, number>;
}

export interface ProcessedResults {
  userId: string;
  responses: number[];
  initialScores: import('./tps.types').TPSScores;
  finalScores: import('./tps.types').TPSScores;
  cusps: CuspAnalysis[];
  socraticSession: SocraticSession | null;
  mappings: import('./tps.types').PersonalityProfile['mappings'];
  insights?: AIInsights;
  timestamp: Date;
}

export interface AIInsights {
  general: string;
  career: string;
  development: string;
  relationship: string;
}

export interface MappingWeights {
  mbti: {
    extraversion: Record<string, number>;
    intuition: Record<string, number>;
    thinking: Record<string, number>;
    judging: Record<string, number>;
  };
  bigFive: {
    openness: Record<string, number>;
    conscientiousness: Record<string, number>;
    extraversion: Record<string, number>;
    agreeableness: Record<string, number>;
    neuroticism: Record<string, number>;
  };
}