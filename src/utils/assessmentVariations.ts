import { TPS_QUESTIONS } from '../data/questions';

export interface QuickAssessmentConfig {
  name: string;
  description: string;
  questionCount: number;
  estimatedTime: string;
  questions: number[]; // indices from the full question set
}

interface AssessmentConfig {
  name: string;
  description: string;
  questionCount: number;
  estimatedTime: string;
  questions: number[];
  requiredTraitCoverage: number;
}

const ASSESSMENT_CONFIGS = {
  full: {
    questions: 108,
    questionsPerTrait: 3,
    requiredTraitCoverage: 1.0
  },
  quick: {
    questions: 36,
    questionsPerTrait: 1,
    requiredTraitCoverage: 1.0
  },
  mini: {
    questions: 12,
    questionsPerTrait: 0.33,
    requiredTraitCoverage: 0.33
  }
};

export class AssessmentVariations {
  static getQuickAssessmentConfig(): QuickAssessmentConfig {
    // Select 36 unique questions (3 per triad, covering all 12 triads)
    const quickQuestions = [
      // External-Control triad
      1, 2, 3,
      // External-Will triad  
      19, 20, 21,
      // External-Design triad
      37, 38, 39,
      // Internal-Self-Focus triad
      55, 56, 57,
      // Internal-Motivation triad
      73, 74, 75,
      // Internal-Behavior triad
      91, 92, 93,
      // Interpersonal-Navigate triad
      4, 5, 6,
      // Interpersonal-Communication triad
      22, 23, 24,
      // Interpersonal-Stimulation triad
      40, 41, 42,
      // Processing-Cognitive triad
      58, 59, 60,
      // Processing-Regulation triad
      76, 77, 78,
      // Processing-Reality triad
      94, 95, 96
    ];

    return {
      name: 'Quick Assessment',
      description: 'A focused 36-question assessment that covers all personality domains in about 8-10 minutes.',
      questionCount: 36,
      estimatedTime: '8-10 minutes',
      questions: quickQuestions
    };
  }

  static getMiniAssessmentConfig(): QuickAssessmentConfig {
    // Select 12 unique questions (1 per triad)
    const miniQuestions = [
      1,   // External-Control: Structured
      19,  // External-Will: Passive
      37,  // External-Design: Lawful
      55,  // Internal-Self-Focus: Self-Indulgent
      73,  // Internal-Motivation: Intrinsic
      91,  // Internal-Behavior: Pessimistic
      7,   // Interpersonal-Navigate: Independent Navigate
      25,  // Interpersonal-Communication: Direct
      43,  // Interpersonal-Stimulation: Dynamic
      61,  // Processing-Cognitive: Analytical
      79,  // Processing-Regulation: Turbulent
      97   // Processing-Reality: Physical
    ];

    return {
      name: 'Mini Assessment',
      description: 'A brief 12-question assessment for a quick personality snapshot in 3-4 minutes.',
      questionCount: 12,
      estimatedTime: '3-4 minutes',
      questions: miniQuestions
    };
  }

  static getQuestions(config: QuickAssessmentConfig): string[] {
    return config.questions.map(index => TPS_QUESTIONS[index - 1]);
  }

  static adjustScoring(responses: number[], config: QuickAssessmentConfig): number[] {
    // Create a full 108-response array with neutral values (5)
    const fullResponses = Array(108).fill(5);
    
    // Fill in the actual responses at their correct positions
    config.questions.forEach((questionIndex, responseIndex) => {
      fullResponses[questionIndex - 1] = responses[responseIndex];
    });
    
    return fullResponses;
  }

  static getAssessmentOptions() {
    return [
      {
        id: 'full',
        name: 'Complete Assessment',
        description: 'Comprehensive 108-question assessment for maximum accuracy',
        questionCount: 108,
        estimatedTime: '20-25 minutes',
        accuracy: 'Highest'
      },
      {
        id: 'quick',
        name: 'Quick Assessment',
        description: 'Focused assessment covering all domains',
        questionCount: 36,
        estimatedTime: '8-10 minutes',
        accuracy: 'High'
      },
      {
        id: 'mini',
        name: 'Mini Assessment',
        description: 'Brief snapshot assessment',
        questionCount: 12,
        estimatedTime: '3-4 minutes',
        accuracy: 'Moderate'
      }
    ];
  }

  static validateAssessmentQuestions(questions: number[], config: AssessmentConfig): boolean {
    // Import trait mappings to validate coverage
    const { TPSScoring } = require('./tpsScoring');
    const traitCoverage = new Set();
    
    questions.forEach(q => {
      Object.entries(TPSScoring.TRAIT_MAPPINGS || {}).forEach(([trait, indices]) => {
        if (Array.isArray(indices) && indices.includes(q)) {
          traitCoverage.add(trait);
        }
      });
    });
    
    const coverageRatio = traitCoverage.size / 36;
    return coverageRatio >= config.requiredTraitCoverage;
  }
}