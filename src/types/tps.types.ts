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
  };
  timestamp: string;
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