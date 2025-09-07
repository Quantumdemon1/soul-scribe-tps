export interface TPSScores {
  [trait: string]: number;
}

export interface DominantTraits {
  [triad: string]: string;
}

export interface EnneagramDetails {
  type: number;
  wing: number;
  tritype: string;
}

export interface PersonalityArchetype {
  name: string;
  type: 'real' | 'fictional';
  similarity: number;
  description: string;
  confidence?: number;
}

// Enhanced detailed mapping interfaces
export interface MBTIDetail {
  type: string;
  preferences: {
    E_I: { letter: string; strength: number; confidence: number; };
    S_N: { letter: string; strength: number; confidence: number; };
    T_F: { letter: string; strength: number; confidence: number; };
    J_P: { letter: string; strength: number; confidence: number; };
  };
  cognitiveFunctions: {
    dominant: { function: string; strength: number; };
    auxiliary: { function: string; strength: number; };
    tertiary: { function: string; strength: number; };
    inferior: { function: string; strength: number; };
  };
  confidence: number;
}

export interface EnneagramDetail {
  type: number;
  wing: number;
  tritype: string;
  instinctualVariant: {
    primary: 'self-preservation' | 'social' | 'sexual';
    secondary: 'self-preservation' | 'social' | 'sexual';
  };
  healthLevel: 'healthy' | 'average' | 'unhealthy';
  wingInfluence: number;
  confidence: number;
}

export interface BigFiveDetail {
  dimensions: {
    Openness: {
      score: number;
      facets: {
        imagination: number;
        artisticInterests: number;
        emotionality: number;
        adventurousness: number;
        intellect: number;
        liberalism: number;
      };
    };
    Conscientiousness: {
      score: number;
      facets: {
        selfEfficacy: number;
        orderliness: number;
        dutifulness: number;
        achievementStriving: number;
        selfDiscipline: number;
        cautiousness: number;
      };
    };
    Extraversion: {
      score: number;
      facets: {
        friendliness: number;
        gregariousness: number;
        assertiveness: number;
        activityLevel: number;
        excitementSeeking: number;
        cheerfulness: number;
      };
    };
    Agreeableness: {
      score: number;
      facets: {
        trust: number;
        morality: number;
        altruism: number;
        cooperation: number;
        modesty: number;
        sympathy: number;
      };
    };
    Neuroticism: {
      score: number;
      facets: {
        anxiety: number;
        anger: number;
        depression: number;
        selfConsciousness: number;
        immoderation: number;
        vulnerability: number;
      };
    };
  };
  confidence: number;
}

export interface AlignmentDetail {
  alignment: string;
  ethicalAxis: {
    position: 'Lawful' | 'Neutral' | 'Chaotic';
    score: number;
    reasoning: string;
  };
  moralAxis: {
    position: 'Good' | 'Neutral' | 'Evil';
    score: number;
    reasoning: string;
  };
  confidence: number;
}

export interface HollandDetail {
  code: string;
  types: {
    [key: string]: {
      score: number;
      description: string;
      careerAreas: string[];
      workEnvironment: string;
    };
  };
  primaryType: string;
  secondaryType: string;
  confidence: number;
}

export interface AttachmentStyle {
  style: 'secure' | 'anxious-preoccupied' | 'dismissive-avoidant' | 'fearful-avoidant';
  score: number;
  description: string;
  characteristics: string[];
  confidence: number;
}

export interface SocionicsDetail {
  type: string;
  informationElements: {
    dominant: { element: string; strength: number; };
    auxiliary: { element: string; strength: number; };
    tertiary: { element: string; strength: number; };
    inferior: { element: string; strength: number; };
  };
  intertype: string;
  confidence: number;
}

export interface IntegralDetail {
  primaryLevel: {
    color: string;
    name: string;
    cognitiveStage: string;
    worldview: string;
    thinkingPattern: string;
    score: number;
    confidence: number;
    characteristics: string[];
    growthEdge: string[];
    typicalConcerns: string[];
  };
  secondaryLevel?: {
    color: string;
    name: string;
    cognitiveStage: string;
    worldview: string;
    thinkingPattern: string;
    score: number;
    confidence: number;
    characteristics: string[];
    growthEdge: string[];
    typicalConcerns: string[];
  };
  realityTriadMapping: {
    physical: number;
    social: number;
    universal: number;
  };
  cognitiveComplexity: number;
  developmentalEdge: string;
  confidence: number;
}

export interface PersonalityProfile {
  dominantTraits: DominantTraits;
  traitScores: TPSScores;
  domainScores: {
    External: number;
    Internal: number;
    Interpersonal: number;
    Processing: number;
  };
  mappings: {
    mbti: string;
    enneagram: string;
    enneagramDetails: EnneagramDetails;
    bigFive: Record<string, number>;
    dndAlignment: string;
    socionics: string;
    hollandCode: string;
    personalityMatches: PersonalityArchetype[];
    // Enhanced detailed mappings (optional for backward compatibility)
    mbtiDetail?: MBTIDetail;
    enneagramDetail?: EnneagramDetail;
    bigFiveDetail?: BigFiveDetail;
    alignmentDetail?: AlignmentDetail;
    hollandDetail?: HollandDetail;
    attachmentStyle?: AttachmentStyle;
    socionicsDetail?: SocionicsDetail;
    integralDetail?: IntegralDetail;
  };
  frameworkInsights?: import('./llm.types').FrameworkInsights;
  timestamp: string;
  version?: string; // Optional version for tracking calculation updates
}

export interface QuestionResponse {
  questionIndex: number;
  response: number;
}

export interface AssessmentState {
  currentPage: number;
  responses: number[];
  isComplete: boolean;
  profile: PersonalityProfile | null;
}