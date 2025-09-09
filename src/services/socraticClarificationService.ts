import { TPSScores } from '@/types/tps.types';
import { CuspAnalysis, ConversationTurn } from '@/types/llm.types';
import { LLMService } from './llmService';
import { TPSScoring } from '@/utils/tpsScoring';
import { supabase } from '@/integrations/supabase/client';
import { stableHash } from '@/utils/hash';
import { calculateIntegralDevelopment, getIntegralClarificationQuestions, validateIntegralAssessment } from '@/mappings/integral.enhanced';
import { logger } from '@/utils/structuredLogging';

export class SocraticClarificationService {
  private readonly CUSP_THRESHOLD = 2.5; // Traits within 2.5 points are cusps
  private readonly MAX_CUSPS = 5; // Limit to most important cusps
  private readonly llmService = new LLMService();
  private memoryCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 1000 * 60 * 60; // 1 hour for clarification questions
  
  async analyzeCusps(traitScores: TPSScores): Promise<CuspAnalysis[]> {
    const cusps: CuspAnalysis[] = [];
    
    Object.entries(TPSScoring.DOMAINS).forEach(([domain, triads]) => {
      Object.entries(triads).forEach(([triadName, traits]) => {
        const scores = traits.map(trait => traitScores[trait]);
        const sortedScores = [...scores].sort((a, b) => b - a);
        
        // Check for cusps (close scores)
        const requiresClarification = 
          (sortedScores[0] - sortedScores[1] < this.CUSP_THRESHOLD) ||
          (sortedScores[1] - sortedScores[2] < this.CUSP_THRESHOLD);
        
        if (requiresClarification) {
          // Calculate importance score based on how close the scores are
          const importanceScore = Math.max(
            this.CUSP_THRESHOLD - (sortedScores[0] - sortedScores[1]),
            this.CUSP_THRESHOLD - (sortedScores[1] - sortedScores[2])
          );
          
          cusps.push({
            triad: `${domain} - ${triadName}`,
            traits,
            scores,
            requiresClarification: true,
            importanceScore
          });
        }
      });
    });

    // Add Integral Theory developmental level analysis
    const integralAnalysis = await this.analyzeIntegralDevelopmentCusps(traitScores);
    cusps.push(...integralAnalysis);
    
    // Sort by importance and limit to top cusps
    const sortedCusps = cusps
      .sort((a, b) => (b.importanceScore || 0) - (a.importanceScore || 0))
      .slice(0, this.MAX_CUSPS);
    
    // Generate only one clarification question per cusp (instead of 3)
    for (const cusp of sortedCusps) {
      cusp.clarificationQuestions = await this.generateClarificationQuestions(cusp);
    }
    
    return sortedCusps;
  }

  private async analyzeIntegralDevelopmentCusps(traitScores: TPSScores): Promise<CuspAnalysis[]> {
    const integralCusps: CuspAnalysis[] = [];
    
    try {
      const integralDetail = calculateIntegralDevelopment(traitScores);
      
      // Check if there's ambiguity between primary and secondary levels
      if (integralDetail.secondaryLevel && 
          Math.abs(integralDetail.primaryLevel.score - integralDetail.secondaryLevel.score) <= 1.0) {
        
        integralCusps.push({
          triad: `Integral Theory Development`,
          traits: [integralDetail.primaryLevel.color, integralDetail.secondaryLevel.color],
          scores: [integralDetail.primaryLevel.score, integralDetail.secondaryLevel.score],
          requiresClarification: true,
          importanceScore: 9.5, // High importance for cognitive development clarity
          integralLevel: integralDetail.primaryLevel
        });
      }

      // Check Reality Triad mapping for cognitive development consistency
      const { physical, social, universal } = integralDetail.realityTriadMapping;
      const realityScores = [
        { name: 'Physical', score: physical },
        { name: 'Social', score: social },
        { name: 'Universal', score: universal }
      ];
      
      realityScores.sort((a, b) => b.score - a.score);
      
      if (Math.abs(realityScores[0].score - realityScores[1].score) <= 0.7) {
        integralCusps.push({
          triad: 'Reality Triad Focus',
          traits: [realityScores[0].name, realityScores[1].name],
          scores: [realityScores[0].score, realityScores[1].score],
          requiresClarification: true,
          importanceScore: 8.8, // High importance for reality focus clarity
          isRealityTriad: true
        });
      }
      
    } catch (error) {
      logger.warn('Error analyzing integral development cusps', { component: 'SocraticClarificationService' });
    }
    
    return integralCusps;
  }
  
  async generateClarificationQuestions(cusp: CuspAnalysis): Promise<string[]> {
    const cacheKey = stableHash({
      type: 'clarification_questions',
      triad: cusp.triad,
      traits: cusp.traits,
      scores: cusp.scores
    });

    // Check memory cache first
    const cached = this.getFromMemoryCache(cacheKey);
    if (cached) {
      logger.info('Using cached clarification questions', { component: 'SocraticClarificationService' });
      return cached;
    }

    // Handle Integral Theory level clarification
    if (cusp.integralLevel) {
      const integralQuestions = getIntegralClarificationQuestions(cusp.integralLevel);
      if (integralQuestions.length > 0) {
        this.setMemoryCache(cacheKey, integralQuestions);
        return integralQuestions;
      }
    }

    // Handle Reality Triad clarification
    if (cusp.isRealityTriad) {
      const realityTriadQuestions = this.generateRealityTriadQuestions(cusp);
      this.setMemoryCache(cacheKey, realityTriadQuestions);
      return realityTriadQuestions;
    }

    const traitDescriptions = this.getTraitDescriptions();
    
    const prompt = `
Generate 1 focused Socratic clarification question to distinguish between these personality traits:

Triad: ${cusp.triad}
Traits and current scores:
${cusp.traits.map((t, i) => `- ${t}: ${cusp.scores[i].toFixed(1)} - ${traitDescriptions[t] || 'No description available'}`).join('\n')}

Create one question that:
1. Presents a realistic scenario where these traits would manifest differently
2. Asks about preferences in a specific situation that clearly differentiates the traits
3. Is conversational and easy to understand
4. Helps clarify which trait is most dominant for this person

CRITICAL: Return ONLY the single question as plain text, no formatting, numbering, or extra content.
`;
    
    const response = await this.llmService.callLLM(prompt, 'tieBreaking');
    const question = response.split('\n')[0].trim();
    
    // Cache the result
    this.setMemoryCache(cacheKey, [question]);
    
    return [question];
  }

  private generateRealityTriadQuestions(cusp: CuspAnalysis): string[] {
    const realityTriadQuestions = {
      'Physical_vs_Social': [
        "When solving a problem, do you prefer to start with concrete, tangible aspects or with how it affects people and relationships?",
        "In your daily life, what captures your attention more - the physical world around you or the social dynamics between people?"
      ],
      'Social_vs_Universal': [
        "When considering important decisions, do you focus more on social harmony and relationships or on universal principles and abstract concepts?",
        "What motivates you more - improving relationships and community wellbeing or understanding deeper patterns and meanings?"
      ],
      'Physical_vs_Universal': [
        "Do you prefer dealing with concrete, observable things you can see and touch, or exploring abstract ideas and universal concepts?",
        "When learning something new, are you more drawn to practical applications or theoretical understanding?"
      ]
    };

    const questionKey = `${cusp.traits[0]}_vs_${cusp.traits[1]}`;
    return realityTriadQuestions[questionKey] || [
      `When approaching complex situations, do you tend to focus more on ${cusp.traits[0].toLowerCase()} or ${cusp.traits[1].toLowerCase()} aspects?`
    ];
  }
  
  async processClarificationResponse(
    question: string, 
    response: string, 
    cusp: CuspAnalysis
  ): Promise<Record<string, number>> {
    // Enhanced analysis for Integral Theory levels
    if (cusp.integralLevel) {
      return await this.processIntegralClarificationResponse(question, response, cusp);
    }

    // Enhanced analysis for Reality Triad
    if (cusp.isRealityTriad) {
      return await this.processRealityTriadResponse(question, response, cusp);
    }

    const traitDescriptions = this.getTraitDescriptions();
    
    const prompt = `
Analyze this response to determine trait preferences and provide score adjustments:

Question: ${question}
Response: ${response}

Traits being evaluated:
${cusp.traits.map((t, i) => `- ${t}: ${cusp.scores[i].toFixed(1)} - ${traitDescriptions[t] || 'No description available'}`).join('\n')}

Based on the response, provide adjustment scores (-1.5 to +1.5) for each trait.
Consider:
- Clear preference statements
- Implied values and motivations  
- Behavioral indicators
- Decision-making patterns
- Emotional responses described

CRITICAL: Return ONLY valid JSON without any markdown formatting or extra text. 
Do not use any + symbols, special characters, or markdown code blocks.
Use this exact format: {"${cusp.traits[0]}": 0.0, "${cusp.traits[1]}": 0.0, "${cusp.traits[2]}": 0.0}
`;
    
    const llmResponse = await this.llmService.callLLM(prompt, 'tieBreaking');
    
    try {
      // Clean the response to handle various formats
      let cleanedResponse = llmResponse.trim();
      
      // Remove markdown code blocks if present
      cleanedResponse = cleanedResponse.replace(/```json\s*|\s*```/g, '');
      cleanedResponse = cleanedResponse.replace(/```\s*|\s*```/g, '');
      
      // Remove any plus signs that might cause parsing issues
      cleanedResponse = cleanedResponse.replace(/\+/g, '');
      
      // Extract JSON from response - look for the first complete JSON object
      const jsonMatch = cleanedResponse.match(/\{[^{}]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Validate that all traits are present
        const validatedAdjustments: Record<string, number> = {};
        cusp.traits.forEach(trait => {
          validatedAdjustments[trait] = typeof parsed[trait] === 'number' ? parsed[trait] : 0;
        });
        
        return validatedAdjustments;
      }
      
      throw new Error('No valid JSON found in LLM response');
      
    } catch (error) {
      logger.error('Error parsing LLM response', { component: 'SocraticClarificationService', metadata: { responseLength: llmResponse.length } }, error as Error);
      
      // Return neutral adjustments as fallback
      const neutralAdjustments: Record<string, number> = {};
      cusp.traits.forEach(trait => {
        neutralAdjustments[trait] = 0;
      });
      return neutralAdjustments;
    }
  }

  private async processIntegralClarificationResponse(
    question: string,
    response: string,
    cusp: CuspAnalysis
  ): Promise<Record<string, number>> {
    try {
      // Validate the response aligns with the assessed integral level
      const isValid = validateIntegralAssessment([response], cusp.integralLevel!);
      
      const prompt = `You are analyzing a user's response to determine their cognitive development level according to Integral Theory. 

Question: "${question}"
User Response: "${response}"

Integral Levels being compared:
- ${cusp.traits[0]} (current score: ${cusp.scores[0].toFixed(1)})
- ${cusp.traits[1]} (current score: ${cusp.scores[1].toFixed(1)})

Based on the cognitive complexity, thinking patterns, and worldview expressed in their response, determine which integral level this represents. Consider:

- Cognitive complexity and abstraction level
- How they handle multiple perspectives
- Their approach to problem-solving
- Values and concerns expressed
- Language patterns and conceptual frameworks used

Return ONLY a JSON object with adjustments between -1.5 and +1.5 (wider range for developmental clarity):

{"${cusp.traits[0]}": adjustment_value, "${cusp.traits[1]}": adjustment_value}

Note: This response ${isValid ? 'aligns' : 'may not align'} with the assessed level based on keyword analysis.

Return only the JSON object, no explanation.`;

      const llmResponse = await this.llmService.callLLM(prompt, 'tieBreaking');

      const jsonMatch = llmResponse.match(/\{[^}]+\}/);
      if (jsonMatch) {
        const adjustments = JSON.parse(jsonMatch[0]);
        
        // Apply validation penalty if response doesn't align
        if (!isValid) {
          Object.keys(adjustments).forEach(key => {
            adjustments[key] *= 0.7; // Reduce confidence in adjustments
          });
        }
        
        return adjustments;
      }
      
      return {};
    } catch (error) {
      logger.error('Error processing integral clarification response', { component: 'SocraticClarificationService' }, error as Error);
      return {};
    }
  }

  private async processRealityTriadResponse(
    question: string,
    response: string,
    cusp: CuspAnalysis
  ): Promise<Record<string, number>> {
    try {
      const prompt = `You are analyzing a user's response to determine their Reality Triad preference (Physical, Social, Universal focus).

Question: "${question}"
User Response: "${response}"

Reality Triad aspects being compared:
- ${cusp.traits[0]} (current score: ${cusp.scores[0].toFixed(1)})
- ${cusp.traits[1]} (current score: ${cusp.scores[1].toFixed(1)})

Analyze which reality focus their response demonstrates:

PHYSICAL: Concrete, tangible, observable phenomena. Focus on what can be seen, touched, measured.
SOCIAL: Interpersonal dynamics, relationships, social systems, how things affect people.
UNIVERSAL: Abstract concepts, universal principles, patterns, theoretical frameworks.

This directly maps to Integral Theory cognitive development levels:
- Physical focus → Red/Amber levels (concrete operational thinking)
- Social focus → Orange/Green levels (formal operational thinking)  
- Universal focus → Teal/Turquoise levels (post-formal thinking)

Return ONLY a JSON object with adjustments between -1.2 and +1.2:

{"${cusp.traits[0]}": adjustment_value, "${cusp.traits[1]}": adjustment_value}

Base adjustments on clear indicators of which reality triad their thinking demonstrates.

Return only the JSON object, no explanation.`;

      const llmResponse = await this.llmService.callLLM(prompt, 'tieBreaking');

      const jsonMatch = llmResponse.match(/\{[^}]+\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {};
    } catch (error) {
      logger.error('Error processing reality triad response', { component: 'SocraticClarificationService' }, error as Error);
      return {};
    }
  }

  private getTraitDescriptions(): Record<string, string> {
    return {
      'Structured': 'Prefers organization, plans, and systematic approaches',
      'Ambivalent': 'Experiences mixed feelings and uncertainty in decisions',
      'Self-Mastery': 'Focuses on self-discipline and personal control',
      'Lawful': 'Follows rules, traditions, and established procedures',
      'Self-Principled': 'Guided by internal moral compass and personal values',
      'Independent': 'Prefers autonomy and self-reliance',
      'Analytical': 'Thinks logically and examines details systematically',
      'Intuitive': 'Relies on instincts and holistic understanding',
      'Pragmatic': 'Focuses on practical solutions and realistic outcomes',
      'Assertive': 'Direct in communication and confident in actions',
      'Passive': 'Avoids confrontation and prefers harmony',
      'Diplomatic': 'Skilled at managing relationships and finding compromises',
      'Dynamic': 'High energy, seeks stimulation and change',
      'Optimistic': 'Maintains positive outlook and expects good outcomes',
      'Pessimistic': 'Anticipates problems and focuses on potential negatives',
      'Stoic': 'Emotionally stable and unaffected by external pressures',
      'Self-Indulgent': 'Seeks pleasure and immediate gratification',
      'Turbulent': 'Experiences emotional volatility and stress',
      'Communal Navigate': 'Skilled at building and maintaining social connections',
      'Independent Navigate': 'Prefers to handle challenges alone',
      'Mixed Navigate': 'Uses both social and independent approaches situationally',
      'Direct': 'Communicates clearly and straightforwardly',
      'Mixed Communication': 'Adapts communication style to the situation',
      'Responsive': 'Reacts to others emotions and needs sensitively',
      'Responsive Regulation': 'Adjusts behavior based on social feedback',
      'Self-Aware': 'Has deep understanding of own thoughts and feelings',
      'Physical': 'Focused on tangible, concrete experiences',
      'Social': 'Attuned to social dynamics and group processes',
      'Universal': 'Thinks in broad, abstract, and philosophical terms',
      'Intrinsic': 'Motivated by internal satisfaction and personal meaning',
      'Extrinsic': 'Motivated by external rewards and recognition',
      'Varied': 'Enjoys diversity and change in experiences',
      'Realistic': 'Practical and grounded in concrete reality'
    };
  }

  private getFromMemoryCache(cacheKey: string): any | null {
    const cached = this.memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    if (cached) {
      this.memoryCache.delete(cacheKey); // Remove expired
    }
    return null;
  }

  private setMemoryCache(cacheKey: string, data: any): void {
    this.memoryCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    // Cleanup old entries
    if (this.memoryCache.size > 30) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }
  }

  async saveClarificationSession(
    userId: string,
    cuspAnalysis: CuspAnalysis[],
    conversations: ConversationTurn[]
  ): Promise<void> {
    try {
      await supabase
        .from('socratic_sessions')
        .insert({
          user_id: userId,
          cusps: cuspAnalysis as any,
          conversations: conversations as any,
          initial_scores: {},
          final_scores: {}
        });
    } catch (error) {
      logger.error('Error saving clarification session', { component: 'SocraticClarificationService', userId }, error as Error);
    }
  }
}