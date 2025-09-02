import { questions } from '../data/questions';

export interface QuickAssessmentConfig {
  name: string;
  description: string;
  questionCount: number;
  estimatedTime: string;
  questions: number[]; // indices from the full question set
}

export class AssessmentVariations {
  static getQuickAssessmentConfig(): QuickAssessmentConfig {
    // Select 36 questions (3 per triad, covering all 12 triads)
    const quickQuestions = [
      // External-Control
      1, 4, 7,
      // External-Will  
      19, 22, 25,
      // External-Design
      37, 40, 43,
      // Internal-Self-Focus
      55, 58, 61,
      // Internal-Motivation
      73, 76, 79,
      // Internal-Behavior
      91, 94, 97,
      // Interpersonal-Navigate
      1, 7, 13,
      // Interpersonal-Communication
      4, 10, 16,
      // Interpersonal-Stimulation
      37, 43, 49,
      // Processing-Cognitive
      40, 46, 52,
      // Processing-Regulation
      73, 79, 85,
      // Processing-Reality
      76, 82, 88
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
    // Select 12 questions (1 per triad)
    const miniQuestions = [
      1,   // External-Control: Structured
      19,  // External-Will: Passive
      37,  // External-Design: Lawful
      55,  // Internal-Self-Focus: Self-Indulgent
      73,  // Internal-Motivation: Intrinsic
      91,  // Internal-Behavior: Pessimistic
      1,   // Interpersonal-Navigate: Independent Navigate
      4,   // Interpersonal-Communication: Direct
      37,  // Interpersonal-Stimulation: Dynamic
      40,  // Processing-Cognitive: Analytical
      73,  // Processing-Regulation: Turbulent
      76   // Processing-Reality: Physical
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
    return config.questions.map(index => questions[index - 1]);
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
}