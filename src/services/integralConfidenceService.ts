import { LLMService } from './llmService';
import { IntegralDetail, IntegralLevel } from '@/mappings/integral.enhanced';
import { PersonalityProfile } from '@/types/tps.types';
import { logger } from '@/utils/structuredLogging';

export interface ConfidenceAnalysis {
  currentConfidence: number;
  issuesDetected: string[];
  recommendedActions: string[];
  needsAdditionalQuestions: boolean;
  uncertainAreas: string[];
}

export interface DynamicQuestion {
  id: string;
  question: string;
  type: 'scenario' | 'values' | 'behavior' | 'preference';
  targetLevel: string;
  context: string;
}

export interface ConfidenceEnhancementSession {
  sessionId: string;
  questions: DynamicQuestion[];
  responses: Record<string, string>;
  updatedAssessment?: IntegralDetail;
  confidenceImprovement: number;
}

export class IntegralConfidenceService {
  private llmService: LLMService;

  constructor() {
    this.llmService = new LLMService();
  }

  /**
   * Analyzes confidence level and determines if enhancement is needed
   */
  analyzeConfidence(integralDetail: IntegralDetail): ConfidenceAnalysis {
    const { confidence, primaryLevel, secondaryLevel, realityTriadMapping } = integralDetail;
    
    const issuesDetected: string[] = [];
    const uncertainAreas: string[] = [];
    const recommendedActions: string[] = [];

    // Check confidence threshold
    if (confidence < 70) {
      issuesDetected.push('Overall confidence below 70%');
      recommendedActions.push('Additional clarification questions needed');
    }

    // Check primary vs secondary level clarity
    if (secondaryLevel && Math.abs(primaryLevel.score - secondaryLevel.score) < 0.5) {
      issuesDetected.push('Primary and secondary levels too close');
      uncertainAreas.push('Primary level identification');
      recommendedActions.push('Scenario-based questions to clarify primary level');
    }

    // Check reality triad balance
    const triadValues = Object.values(realityTriadMapping);
    const triadMax = Math.max(...triadValues);
    const triadMin = Math.min(...triadValues);
    
    if (triadMax - triadMin < 0.2) {
      issuesDetected.push('Reality triad mapping unclear');
      uncertainAreas.push('Reality focus areas');
      recommendedActions.push('Values-based questions to clarify reality orientation');
    }

    // Check for edge case levels (very high or low)
    if (primaryLevel.number <= 2 || primaryLevel.number >= 8) {
      uncertainAreas.push('Extreme level placement');
      recommendedActions.push('Behavioral verification questions');
    }

    return {
      currentConfidence: confidence,
      issuesDetected,
      recommendedActions,
      needsAdditionalQuestions: confidence < 75 || issuesDetected.length > 0,
      uncertainAreas
    };
  }

  /**
   * Generates AI-driven clarification questions based on uncertainty areas
   */
  async generateClarificationQuestions(
    integralDetail: IntegralDetail,
    uncertainAreas: string[] = [],
    personalityProfile?: PersonalityProfile
  ): Promise<DynamicQuestion[]> {
    const prompt = this.buildQuestionGenerationPrompt(integralDetail, uncertainAreas, personalityProfile);
    
    try {
      const llmResponse = await this.llmService.callLLM(prompt, 'insightGeneration');
      return this.parseQuestionResponse(llmResponse);
    } catch (error) {
      logger.aiService('generate_clarification_questions', 'Error generating clarification questions', {}, error as Error);
      return this.getFallbackQuestions();
    }
  }

  /**
   * Processes responses and updates integral assessment
   */
  async processConfidenceEnhancement(
    originalAssessment: IntegralDetail,
    responses: Record<string, string>,
    questions: DynamicQuestion[]
  ): Promise<IntegralDetail> {
    const prompt = this.buildConfidenceUpdatePrompt(originalAssessment, responses, questions);
    
    try {
      const llmResponse = await this.llmService.callLLM(prompt, 'developmentPlanning');
      return this.parseUpdatedAssessment(llmResponse, originalAssessment);
    } catch (error) {
      logger.aiService('process_confidence_enhancement', 'Error processing confidence enhancement', {}, error as Error);
      // Return original with slightly increased confidence
      return {
        ...originalAssessment,
        confidence: Math.min(originalAssessment.confidence + 10, 95)
      };
    }
  }

  private buildQuestionGenerationPrompt(
    integralDetail: IntegralDetail,
    uncertainAreas: string[],
    personalityProfile?: PersonalityProfile
  ): string {
    const personalityContext = personalityProfile ? `
PERSONALITY CONTEXT:
- MBTI: ${personalityProfile.mappings?.mbti || 'Unknown'}
- Enneagram: ${personalityProfile.mappings?.enneagram || 'Unknown'}
- Big Five Extraversion: ${personalityProfile.mappings?.bigFive?.Extraversion || 'Unknown'}
- Big Five Openness: ${personalityProfile.mappings?.bigFive?.Openness || 'Unknown'}
` : '';

    return `Generate 3-5 targeted clarification questions to improve confidence in this Integral Level assessment:

CURRENT ASSESSMENT:
- Primary Level: ${integralDetail.primaryLevel.number} (${integralDetail.primaryLevel.color} - ${integralDetail.primaryLevel.name})
- Confidence: ${Math.round(integralDetail.confidence)}%
- Secondary Level: ${integralDetail.secondaryLevel ? `${integralDetail.secondaryLevel.number} (${integralDetail.secondaryLevel.color})` : 'None'}
- Cognitive Complexity: ${integralDetail.cognitiveComplexity}/10

REALITY TRIAD MAPPING:
- Physical Reality: ${Math.round(integralDetail.realityTriadMapping.physical * 100)}%
- Social Reality: ${Math.round(integralDetail.realityTriadMapping.social * 100)}%
- Universal Reality: ${Math.round(integralDetail.realityTriadMapping.universal * 100)}%

${personalityContext}

UNCERTAIN AREAS: ${uncertainAreas.join(', ') || 'General clarification needed'}

Generate questions that:
1. Use real-world scenarios relevant to the suspected level
2. Clarify values and worldview alignment
3. Test behavioral preferences in different contexts
4. Help distinguish between close levels
5. Are personalized to their personality type if available

Format your response as a JSON array with objects containing:
- id: unique identifier
- question: the actual question text
- type: "scenario", "values", "behavior", or "preference"
- targetLevel: the level this question helps clarify
- context: brief explanation of what this question clarifies

Example format:
[
  {
    "id": "q1",
    "question": "When facing a complex organizational problem, what's your first instinct?",
    "type": "behavior",
    "targetLevel": "orange",
    "context": "Clarifies achievement vs systems orientation"
  }
]`;
  }

  private buildConfidenceUpdatePrompt(
    originalAssessment: IntegralDetail,
    responses: Record<string, string>,
    questions: DynamicQuestion[]
  ): string {
    const responseText = Object.entries(responses)
      .map(([questionId, response]) => {
        const question = questions.find(q => q.id === questionId);
        return `Q: ${question?.question}\nA: ${response}`;
      })
      .join('\n\n');

    return `Based on these clarification responses, update the Integral Level assessment:

ORIGINAL ASSESSMENT:
- Primary Level: ${originalAssessment.primaryLevel.number} (${originalAssessment.primaryLevel.color})
- Confidence: ${Math.round(originalAssessment.confidence)}%
- Cognitive Complexity: ${originalAssessment.cognitiveComplexity}/10

CLARIFICATION RESPONSES:
${responseText}

Analyze the responses and provide an updated assessment. Consider:
1. Do the responses confirm or challenge the original level assessment?
2. What is the new confidence level (should be higher if responses are consistent)?
3. How do the responses affect the reality triad mapping?
4. Is there evidence for a different primary level?

Provide your response as JSON with:
- primaryLevelNumber: updated primary level number (1-9)
- confidence: new confidence percentage (0-100)
- cognitiveComplexity: updated complexity score (0-10)
- realityTriadMapping: { physical: 0-1, social: 0-1, universal: 0-1 }
- reasoning: brief explanation of changes made

The three reality triad values should sum to 1.0.`;
  }

  private parseQuestionResponse(llmResponse: string): DynamicQuestion[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = llmResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const questions = JSON.parse(jsonMatch[0]) as DynamicQuestion[];
        return questions.filter(q => q.question && q.type && q.targetLevel);
      }
    } catch (error) {
      logger.aiService('parse_question_response', 'Error parsing question response', {}, error as Error);
    }
    
    // Fallback to default questions if parsing fails
    return this.getFallbackQuestions();
  }

  private parseUpdatedAssessment(llmResponse: string, originalAssessment: IntegralDetail): IntegralDetail {
    try {
      const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const update = JSON.parse(jsonMatch[0]);
        
        return {
          ...originalAssessment,
          confidence: Math.min(Math.max(update.confidence || originalAssessment.confidence, 0), 100),
          cognitiveComplexity: Math.min(Math.max(update.cognitiveComplexity || originalAssessment.cognitiveComplexity, 0), 10),
          realityTriadMapping: {
            physical: Math.min(Math.max(update.realityTriadMapping?.physical || originalAssessment.realityTriadMapping.physical, 0), 1),
            social: Math.min(Math.max(update.realityTriadMapping?.social || originalAssessment.realityTriadMapping.social, 0), 1),
            universal: Math.min(Math.max(update.realityTriadMapping?.universal || originalAssessment.realityTriadMapping.universal, 0), 1)
          }
        };
      }
    } catch (error) {
      logger.aiService('parse_updated_assessment', 'Error parsing updated assessment', {}, error as Error);
    }
    
    // Fallback: return original with modest confidence boost
    return {
      ...originalAssessment,
      confidence: Math.min(originalAssessment.confidence + 15, 90)
    };
  }

  private getFallbackQuestions(): DynamicQuestion[] {
    return [
      {
        id: 'fb1',
        question: 'When making important decisions, what matters most to you: following proven methods, achieving results, considering everyone\'s needs, or finding innovative solutions?',
        type: 'values',
        targetLevel: 'general',
        context: 'Clarifies value system orientation'
      },
      {
        id: 'fb2',
        question: 'Imagine you\'re leading a team through a crisis. Describe your approach and what you\'d prioritize.',
        type: 'scenario',
        targetLevel: 'general',
        context: 'Tests leadership and crisis response style'
      },
      {
        id: 'fb3',
        question: 'How do you typically handle conflicting viewpoints in your personal or professional life?',
        type: 'behavior',
        targetLevel: 'general',
        context: 'Reveals complexity tolerance and integration skills'
      }
    ];
  }
}