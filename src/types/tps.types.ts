export interface TPSScores {
  [trait: string]: number;
}

export interface DominantTraits {
  [triad: string]: string;
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
    bigFive: Record<string, number>;
    dndAlignment: string;
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