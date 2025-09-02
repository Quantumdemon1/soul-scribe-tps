import { PersonalityProfile, TPSScores } from '@/types/tps.types';
import { FrameworkInsights, MBTIInsight, EnneagramInsight, BigFiveInsight, AlignmentInsight } from '@/types/llm.types';
import { LLMService } from './llmService';
import { parseLLMJson } from '@/utils/jsonUtils';

export class FrameworkInsightsService {
  private llmService = new LLMService();

  async generateFrameworkInsights(
    profile: PersonalityProfile,
    traitScores: TPSScores
  ): Promise<FrameworkInsights> {
    try {
      console.log('Generating framework insights for profile:', profile.mappings);
      
      // Generate insights in parallel for better performance
      const [mbti, enneagram, bigFive, alignment, synthesis] = await Promise.all([
        this.generateMBTIInsight(profile.mappings.mbti, traitScores),
        this.generateEnneagramInsight(profile.mappings.enneagramDetails, traitScores),
        this.generateBigFiveInsight(profile.mappings.bigFive, traitScores),
        this.generateAlignmentInsight(profile.mappings.dndAlignment, traitScores),
        this.generateSynthesisInsight(profile)
      ]);

      const insights: FrameworkInsights = {
        mbti,
        enneagram,
        bigFive,
        alignment,
        hollandCode: {
          summary: `Your Holland Code of ${profile.mappings.hollandCode} reflects your interests and work environment preferences.`,
          primaryTypes: profile.mappings.hollandCode.split(''),
          reasoning: 'Based on your External and Processing domain traits that influence work preferences.',
          confidence: 0.7
        },
        socionics: {
          summary: `Your Socionics type correlates with your MBTI profile of ${profile.mappings.mbti}.`,
          reasoning: 'Socionics shares cognitive function theory with MBTI, adapted for information processing preferences.',
          confidence: 0.6
        },
        synthesis,
        overallConfidence: (mbti.confidence + enneagram.confidence + bigFive.confidence + alignment.confidence) / 4
      };

      console.log('Successfully generated framework insights');
      return insights;
    } catch (error) {
      console.error('Error generating framework insights:', error);
      throw new Error(`Failed to generate framework insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateMBTIInsight(mbti: string, scores: TPSScores): Promise<MBTIInsight> {
    const prompt = `
Analyze this MBTI result and explain it in context of the user's TPS traits:

MBTI Type: ${mbti}

Key Contributing Traits:
- E/I: Communal Navigate (${scores['Communal Navigate'] || 0}), Dynamic (${scores['Dynamic'] || 0}), Independent Navigate (${scores['Independent Navigate'] || 0})
- S/N: Intuitive (${scores['Intuitive'] || 0}), Universal (${scores['Universal'] || 0}), Physical (${scores['Physical'] || 0})
- T/F: Analytical (${scores['Analytical'] || 0}), Stoic (${scores['Stoic'] || 0}), Diplomatic (${scores['Diplomatic'] || 0})
- J/P: Structured (${scores['Structured'] || 0}), Lawful (${scores['Lawful'] || 0}), Ambivalent (${scores['Ambivalent'] || 0})

Provide a detailed analysis explaining:
1. Why they got this type (which traits drove each letter)
2. Confidence level for each dimension (0.0-1.0)
3. What this means for their personality
4. Unique aspects of their expression of this type
5. How their other traits modify typical ${mbti} behavior

Format as JSON: {
  "summary": "2-3 sentence overview",
  "breakdown": {
    "E_or_I": { "letter": "E or I", "reason": "explanation", "score": 0.0-1.0 },
    "S_or_N": { "letter": "S or N", "reason": "explanation", "score": 0.0-1.0 },
    "T_or_F": { "letter": "T or F", "reason": "explanation", "score": 0.0-1.0 },
    "J_or_P": { "letter": "J or P", "reason": "explanation", "score": 0.0-1.0 }
  },
  "uniqueExpression": "How they differ from typical ${mbti}",
  "keyStrengths": ["strength1", "strength2", "strength3"],
  "growthAreas": ["area1", "area2"],
  "confidence": 0.0-1.0
}`;
    
    const response = await this.llmService.callLLM(prompt, 'frameworkAnalysis');
    return parseLLMJson<MBTIInsight>(response);
  }

  private async generateEnneagramInsight(
    enneagramDetails: { type: number; wing: number; tritype: string },
    scores: TPSScores
  ): Promise<EnneagramInsight> {
    const prompt = `
Analyze this Enneagram result in context of TPS traits:

Enneagram: Type ${enneagramDetails.type}w${enneagramDetails.wing}
Tritype: ${enneagramDetails.tritype}

Key Contributing Traits:
- Self-Focused vs Self-Mastery: ${scores['Self-Focused'] || 0} vs ${scores['Self-Mastery'] || 0}
- Turbulent vs Stoic: ${scores['Turbulent'] || 0} vs ${scores['Stoic'] || 0}
- Intrinsic vs Extrinsic: ${scores['Intrinsic'] || 0} vs ${scores['Extrinsic'] || 0}
- Control vs Flexible: ${scores['Control'] || 0} vs ${scores['Flexible'] || 0}

Provide detailed analysis of:
1. Why they are Type ${enneagramDetails.type} (which traits indicate this)
2. How wing ${enneagramDetails.wing} modifies their type
3. Core motivations and fears based on their traits
4. How their TPS profile creates a unique version of ${enneagramDetails.type}w${enneagramDetails.wing}

Format as JSON: {
  "summary": "2-3 sentence overview",
  "coreType": {
    "description": "What Type ${enneagramDetails.type} means for them",
    "motivation": "Their core motivation",
    "fear": "Their core fear",
    "contributingTraits": ["trait1", "trait2"]
  },
  "wing": {
    "influence": "How wing ${enneagramDetails.wing} shows up",
    "balance": "How balanced the wing influence is"
  },
  "levels": {
    "healthy": "Healthy expression based on traits",
    "average": "Average expression",
    "unhealthy": "Potential unhealthy patterns"
  },
  "growthPath": "Personalized growth direction",
  "confidence": 0.0-1.0
}`;
    
    const response = await this.llmService.callLLM(prompt, 'frameworkAnalysis');
    return parseLLMJson<EnneagramInsight>(response);
  }

  private async generateBigFiveInsight(
    bigFive: Record<string, number>,
    scores: TPSScores
  ): Promise<BigFiveInsight> {
    const prompt = `
Analyze these Big Five results in context of TPS traits:

Big Five Scores:
- Openness: ${bigFive.Openness || 0}/10
- Conscientiousness: ${bigFive.Conscientiousness || 0}/10  
- Extraversion: ${bigFive.Extraversion || 0}/10
- Agreeableness: ${bigFive.Agreeableness || 0}/10
- Neuroticism: ${bigFive.Neuroticism || 0}/10

TPS Contributing Traits:
- Openness: Intuitive (${scores['Intuitive'] || 0}), Universal (${scores['Universal'] || 0})
- Conscientiousness: Structured (${scores['Structured'] || 0}), Self-Mastery (${scores['Self-Mastery'] || 0})
- Extraversion: Communal Navigate (${scores['Communal Navigate'] || 0}), Dynamic (${scores['Dynamic'] || 0})
- Agreeableness: Diplomatic (${scores['Diplomatic'] || 0}), Responsive (${scores['Responsive'] || 0})
- Neuroticism: Turbulent (${scores['Turbulent'] || 0}), Pessimistic (${scores['Pessimistic'] || 0})

Provide analysis showing:
1. Which specific TPS traits contributed to each Big Five dimension
2. What their scores mean in practical terms
3. How trait interactions create unique patterns

Format as JSON: {
  "summary": "Overview of their Big Five profile",
  "dimensions": {
    "Openness": {
      "score": ${bigFive.Openness || 0},
      "description": "What this means for them",
      "contributingTraits": ["trait1", "trait2"],
      "implications": ["implication1", "implication2"]
    },
    // ... same for other dimensions
  },
  "interactions": "How dimensions interact uniquely",
  "confidence": 0.0-1.0
}`;
    
    const response = await this.llmService.callLLM(prompt, 'frameworkAnalysis');
    return parseLLMJson<BigFiveInsight>(response);
  }

  private async generateAlignmentInsight(
    alignment: string,
    scores: TPSScores
  ): Promise<AlignmentInsight> {
    const prompt = `
Analyze this D&D Alignment result in context of TPS traits:

Alignment: ${alignment}

Key Contributing Traits:
- Ethical Axis (Law/Chaos): Lawful (${scores['Lawful'] || 0}), Self-Principled (${scores['Self-Principled'] || 0}), Ambivalent (${scores['Ambivalent'] || 0})
- Moral Axis (Good/Evil): Diplomatic (${scores['Diplomatic'] || 0}), Responsive (${scores['Responsive'] || 0}), Direct (${scores['Direct'] || 0})
- Control: Structured (${scores['Structured'] || 0}), Control (${scores['Control'] || 0}), Flexible (${scores['Flexible'] || 0})

Explain:
1. Why they got this alignment
2. How their ethical and moral reasoning works
3. How this shows up in decision-making

Format as JSON: {
  "summary": "2-3 sentence overview of their ${alignment} alignment",
  "ethicalAxis": {
    "position": "Lawful/Neutral/Chaotic",
    "reasoning": "Why they fall on this part of the spectrum",
    "manifestations": ["how this shows up 1", "how this shows up 2"]
  },
  "moralAxis": {
    "position": "Good/Neutral/Evil",
    "reasoning": "Why they fall on this part of the spectrum", 
    "manifestations": ["how this shows up 1", "how this shows up 2"]
  },
  "decisionMaking": "How their alignment influences choices",
  "confidence": 0.0-1.0
}`;
    
    const response = await this.llmService.callLLM(prompt, 'frameworkAnalysis');
    return parseLLMJson<AlignmentInsight>(response);
  }

  private async generateSynthesisInsight(profile: PersonalityProfile): Promise<string> {
    const prompt = `
Create a holistic synthesis showing how all personality frameworks connect for this person:

Frameworks:
- MBTI: ${profile.mappings.mbti}
- Enneagram: Type ${profile.mappings.enneagramDetails.type}w${profile.mappings.enneagramDetails.wing}
- Big Five: ${JSON.stringify(profile.mappings.bigFive)}
- D&D Alignment: ${profile.mappings.dndAlignment}
- Holland Code: ${profile.mappings.hollandCode}

Dominant TPS Traits: ${JSON.stringify(profile.dominantTraits)}

Domain Scores:
- External: ${profile.domainScores.External}/10
- Internal: ${profile.domainScores.Internal}/10  
- Interpersonal: ${profile.domainScores.Interpersonal}/10
- Processing: ${profile.domainScores.Processing}/10

Provide a 3-4 paragraph synthesis that:
1. Shows how these different typings reinforce each other
2. Identifies consistent themes across frameworks
3. Explains apparent contradictions
4. Creates a unified picture of their personality

Write in second person, be specific and insightful. Focus on the interconnections and what makes their particular combination unique.`;
    
    return await this.llmService.callLLM(prompt, 'frameworkAnalysis');
  }
}