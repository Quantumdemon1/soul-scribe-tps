import { LLMService } from './llmService';
import { IntegralDetail, INTEGRAL_LEVELS } from '@/mappings/integral.enhanced';
import { PersonalityProfile } from '@/types/tps.types';
import { logger } from '@/utils/structuredLogging';

export interface PersonalityIntegration {
  integralLevel: IntegralDetail;
  personalityProfile: PersonalityProfile;
  integrationInsights: IntegrationInsight[];
  developmentRecommendations: DevelopmentRecommendation[];
  levelSpecificManifestations: LevelManifestation[];
}

export interface IntegrationInsight {
  id: string;
  title: string;
  description: string;
  category: 'cognitive' | 'behavioral' | 'values' | 'relationships' | 'growth';
  personalityAspect: string;
  integralAspect: string;
  practicalImplication: string;
}

export interface DevelopmentRecommendation {
  id: string;
  title: string;
  description: string;
  timeframe: 'immediate' | 'short-term' | 'long-term';
  difficulty: 'easy' | 'moderate' | 'challenging';
  personalityRelevance: string;
  integralRelevance: string;
  specificActions: string[];
}

export interface LevelManifestation {
  framework: 'mbti' | 'enneagram' | 'bigfive';
  type: string;
  atCurrentLevel: string;
  atNextLevel: string;
  tensionsAndChallenges: string[];
  strengthsToLeverage: string[];
}

export class IntegralPersonalityService {
  private llmService: LLMService;

  constructor() {
    this.llmService = new LLMService();
  }

  /**
   * Creates comprehensive personality-integral integration analysis
   */
  async generatePersonalityIntegration(
    integralDetail: IntegralDetail,
    personalityProfile: PersonalityProfile
  ): Promise<PersonalityIntegration> {
    try {
      const [insights, recommendations, manifestations] = await Promise.all([
        this.generateIntegrationInsights(integralDetail, personalityProfile),
        this.generateDevelopmentRecommendations(integralDetail, personalityProfile),
        this.generateLevelManifestations(integralDetail, personalityProfile)
      ]);

      return {
        integralLevel: integralDetail,
        personalityProfile,
        integrationInsights: insights,
        developmentRecommendations: recommendations,
        levelSpecificManifestations: manifestations
      };
    } catch (error) {
      logger.aiService('generate_personality_integration', 'Error generating personality integration', {}, error as Error);
      return this.getFallbackIntegration(integralDetail, personalityProfile);
    }
  }

  /**
   * Generates insights about how personality type manifests at the integral level
   */
  private async generateIntegrationInsights(
    integralDetail: IntegralDetail,
    personalityProfile: PersonalityProfile
  ): Promise<IntegrationInsight[]> {
    const prompt = this.buildInsightsPrompt(integralDetail, personalityProfile);
    const llmResponse = await this.llmService.callLLM(prompt, 'insightGeneration');
    return this.parseInsightsResponse(llmResponse);
  }

  /**
   * Generates personalized development recommendations
   */
  private async generateDevelopmentRecommendations(
    integralDetail: IntegralDetail,
    personalityProfile: PersonalityProfile
  ): Promise<DevelopmentRecommendation[]> {
    const prompt = this.buildRecommendationsPrompt(integralDetail, personalityProfile);
    const llmResponse = await this.llmService.callLLM(prompt, 'developmentPlanning');
    return this.parseRecommendationsResponse(llmResponse);
  }

  /**
   * Shows how personality types manifest differently at different integral levels
   */
  private async generateLevelManifestations(
    integralDetail: IntegralDetail,
    personalityProfile: PersonalityProfile
  ): Promise<LevelManifestation[]> {
    const manifestations: LevelManifestation[] = [];
    
    // Generate for primary frameworks if available
    if (personalityProfile.mappings?.mbti) {
      const mbtiManifestation = await this.generateFrameworkManifestation(
        'mbti',
        personalityProfile.mappings.mbti,
        integralDetail
      );
      if (mbtiManifestation) manifestations.push(mbtiManifestation);
    }

    if (personalityProfile.mappings?.enneagram) {
      const enneagramManifestation = await this.generateFrameworkManifestation(
        'enneagram',
        personalityProfile.mappings.enneagram,
        integralDetail
      );
      if (enneagramManifestation) manifestations.push(enneagramManifestation);
    }

    return manifestations;
  }

  private buildInsightsPrompt(integralDetail: IntegralDetail, personalityProfile: PersonalityProfile): string {
    return `Analyze how this personality type manifests at this specific Integral Level:

INTEGRAL LEVEL:
- Level ${integralDetail.primaryLevel.number}: ${integralDetail.primaryLevel.color} (${integralDetail.primaryLevel.name})
- Worldview: ${integralDetail.primaryLevel.worldview}
- Thinking Pattern: ${integralDetail.primaryLevel.thinkingPattern}
- Cognitive Complexity: ${integralDetail.cognitiveComplexity}/10

PERSONALITY PROFILE:
- MBTI: ${personalityProfile.mappings?.mbti || 'Unknown'}
- Enneagram: ${personalityProfile.mappings?.enneagram || 'Unknown'}
- Big Five Openness: ${personalityProfile.mappings?.bigFive?.Openness || 'Unknown'}
- Big Five Conscientiousness: ${personalityProfile.mappings?.bigFive?.Conscientiousness || 'Unknown'}
- Dominant Traits: ${Object.entries(personalityProfile.dominantTraits || {}).map(([key, value]) => `${key}: ${value}`).join(', ')}

Generate 4-5 integration insights showing how their personality type specifically expresses at this integral level. Focus on:

1. Cognitive patterns unique to this personality-level combination
2. Behavioral tendencies influenced by both personality and developmental level
3. Values and decision-making approaches
4. Relationship and social patterns
5. Growth opportunities specific to this combination

Format as JSON array with objects containing:
- id: unique identifier
- title: concise insight title
- description: detailed explanation (2-3 sentences)
- category: "cognitive", "behavioral", "values", "relationships", or "growth"
- personalityAspect: which personality trait is involved
- integralAspect: which integral level characteristic is involved
- practicalImplication: how this shows up in daily life

Be specific about how the personality type changes or is expressed differently at this particular integral level versus other levels.`;
  }

  private buildRecommendationsPrompt(integralDetail: IntegralDetail, personalityProfile: PersonalityProfile): string {
    const nextLevel = this.getNextIntegralLevel(integralDetail.primaryLevel.number);
    
    return `Create personalized development recommendations for this personality type at this integral level:

CURRENT STATE:
- Integral Level: ${integralDetail.primaryLevel.number} (${integralDetail.primaryLevel.color})
- Personality: ${personalityProfile.mappings?.mbti || 'Unknown MBTI'}, ${personalityProfile.mappings?.enneagram || 'Unknown Enneagram'}
- Growth Edge: ${integralDetail.developmentalEdge}

NEXT LEVEL PREVIEW:
${nextLevel ? `- Next Level: ${nextLevel.number} (${nextLevel.color} - ${nextLevel.name})` : 'At highest assessed level'}

Generate 3-4 development recommendations that:
1. Honor their personality type's natural strengths and preferences
2. Address their current integral level's growth edges
3. Prepare them for the next developmental stage
4. Provide specific, actionable steps

Format as JSON array with objects containing:
- id: unique identifier
- title: clear recommendation title
- description: detailed explanation (2-3 sentences)
- timeframe: "immediate", "short-term", or "long-term"
- difficulty: "easy", "moderate", or "challenging"
- personalityRelevance: why this fits their personality type
- integralRelevance: how this supports integral development
- specificActions: array of 2-3 concrete action steps

Make recommendations practical and achievable while pushing growth.`;
  }

  private async generateFrameworkManifestation(
    framework: 'mbti' | 'enneagram' | 'bigfive',
    type: string,
    integralDetail: IntegralDetail
  ): Promise<LevelManifestation | null> {
    const nextLevel = this.getNextIntegralLevel(integralDetail.primaryLevel.number);
    
    const prompt = `Analyze how ${framework.toUpperCase()} type "${type}" manifests at Integral Level ${integralDetail.primaryLevel.number} (${integralDetail.primaryLevel.color}):

Current Level Characteristics:
- Worldview: ${integralDetail.primaryLevel.worldview}
- Thinking: ${integralDetail.primaryLevel.thinkingPattern}

${nextLevel ? `Next Level Preview (${nextLevel.color}):
- Worldview: ${nextLevel.worldview}
- Thinking: ${nextLevel.thinkingPattern}` : ''}

Provide a detailed analysis in JSON format:
{
  "framework": "${framework}",
  "type": "${type}",
  "atCurrentLevel": "How this type specifically expresses at the current integral level",
  "atNextLevel": "${nextLevel ? 'How this type would express at the next level' : 'Already at advanced level'}",
  "tensionsAndChallenges": ["Challenge 1", "Challenge 2", "Challenge 3"],
  "strengthsToLeverage": ["Strength 1", "Strength 2", "Strength 3"]
}

Be specific about how the ${framework} type's core patterns interact with the integral level's worldview and thinking patterns.`;

    try {
      const response = await this.llmService.callLLM(prompt, 'insightGeneration');
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as LevelManifestation;
      }
    } catch (error) {
      logger.aiService('generate_manifestation', `Error generating ${framework} manifestation`, { framework }, error as Error);
    }
    
    return null;
  }

  private parseInsightsResponse(llmResponse: string): IntegrationInsight[] {
    try {
      const jsonMatch = llmResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const insights = JSON.parse(jsonMatch[0]) as IntegrationInsight[];
        return insights.filter(insight => insight.title && insight.description);
      }
    } catch (error) {
      logger.aiService('parse_insights_response', 'Error parsing insights response', {}, error as Error);
    }
    
    return this.getFallbackInsights();
  }

  private parseRecommendationsResponse(llmResponse: string): DevelopmentRecommendation[] {
    try {
      const jsonMatch = llmResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const recommendations = JSON.parse(jsonMatch[0]) as DevelopmentRecommendation[];
        return recommendations.filter(rec => rec.title && rec.description);
      }
    } catch (error) {
      logger.aiService('parse_recommendations_response', 'Error parsing recommendations response', {}, error as Error);
    }
    
    return this.getFallbackRecommendations();
  }

  private getNextIntegralLevel(currentNumber: number) {
    const levels = Object.values(INTEGRAL_LEVELS);
    return levels.find(level => level.number === currentNumber + 1) || null;
  }

  private getFallbackIntegration(
    integralDetail: IntegralDetail,
    personalityProfile: PersonalityProfile
  ): PersonalityIntegration {
    return {
      integralLevel: integralDetail,
      personalityProfile,
      integrationInsights: this.getFallbackInsights(),
      developmentRecommendations: this.getFallbackRecommendations(),
      levelSpecificManifestations: []
    };
  }

  private getFallbackInsights(): IntegrationInsight[] {
    return [
      {
        id: 'fb-insight-1',
        title: 'Cognitive Pattern Integration',
        description: 'Your personality type influences how you process information at this developmental level, creating unique cognitive patterns.',
        category: 'cognitive',
        personalityAspect: 'Information processing style',
        integralAspect: 'Developmental thinking patterns',
        practicalImplication: 'You may approach problems differently than others at the same integral level.'
      }
    ];
  }

  private getFallbackRecommendations(): DevelopmentRecommendation[] {
    return [
      {
        id: 'fb-rec-1',
        title: 'Integrated Growth Practice',
        description: 'Develop practices that honor both your personality preferences and integral growth edges.',
        timeframe: 'short-term',
        difficulty: 'moderate',
        personalityRelevance: 'Works with your natural tendencies',
        integralRelevance: 'Supports developmental progression',
        specificActions: ['Identify your natural strengths', 'Practice expanding beyond comfort zone', 'Seek feedback from diverse perspectives']
      }
    ];
  }
}