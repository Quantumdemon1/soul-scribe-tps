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
    frameworkAnalysis: string;
    coreInsights: string;
    aiMentor: string;
    mbtiExplanation: string;
    enneagramExplanation: string;
    bigFiveExplanation: string;
    attachmentExplanation: string;
    alignmentExplanation: string;
    hollandExplanation: string;
  };
}

export interface CuspAnalysis {
  triad: string;
  traits: string[];
  scores: number[];
  requiresClarification: boolean;
  clarificationQuestions?: string[];
  importanceScore?: number;
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

// Framework-specific insight interfaces
export interface MBTIInsight {
  summary: string;
  breakdown: {
    E_or_I: { letter: string; reason: string; score: number; };
    S_or_N: { letter: string; reason: string; score: number; };
    T_or_F: { letter: string; reason: string; score: number; };
    J_or_P: { letter: string; reason: string; score: number; };
  };
  uniqueExpression: string;
  keyStrengths: string[];
  growthAreas: string[];
  confidence: number;
}

export interface EnneagramInsight {
  summary: string;
  coreType: {
    description: string;
    motivation: string;
    fear: string;
    contributingTraits: string[];
  };
  wing: {
    influence: string;
    balance: string;
  };
  levels: {
    healthy: string;
    average: string;
    unhealthy: string;
  };
  growthPath: string;
  confidence: number;
}

export interface BigFiveInsight {
  summary: string;
  dimensions: {
    [key: string]: {
      score: number;
      description: string;
      contributingTraits: string[];
      implications: string[];
    };
  };
  interactions: string;
  confidence: number;
}

export interface AlignmentInsight {
  summary: string;
  ethicalAxis: {
    position: string;
    reasoning: string;
    manifestations: string[];
  };
  moralAxis: {
    position: string;
    reasoning: string;
    manifestations: string[];
  };
  decisionMaking: string;
  confidence: number;
}

export interface CoreInsight {
  personalitySummary: {
    overview: string;
    uniqueExpression: string;
    traitIntegration: string;
    confidence: number;
  };
  domainAnalysis: {
    [domain: string]: {
      score: number;
      explanation: string;
      contributingTraits: string[];
      implications: string[];
      developmentSuggestions: string[];
    };
  };
  strengthsAnalysis: {
    primary: {
      trait: string;
      description: string;
      applications: string[];
    }[];
    secondary: {
      trait: string;
      description: string;
      applications: string[];
    }[];
    interactions: string;
  };
  confidence: number;
}

export interface FrameworkInsights {
  mbti: MBTIInsight;
  enneagram: EnneagramInsight;
  bigFive: BigFiveInsight;
  alignment: AlignmentInsight;
  hollandCode: {
    summary: string;
    primaryTypes: string[];
    reasoning: string;
    confidence: number;
  };
  socionics: {
    summary: string;
    reasoning: string;
    confidence: number;
  };
  synthesis: string;
  overallConfidence: number;
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