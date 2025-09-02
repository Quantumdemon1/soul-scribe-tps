import { TPSScores } from '@/types/tps.types';
import { CuspAnalysis, ConversationTurn } from '@/types/llm.types';
import { LLMService } from './llmService';
import { TPSScoring } from '@/utils/tpsScoring';

export class SocraticClarificationService {
  private readonly CUSP_THRESHOLD = 2.5; // Traits within 2.5 points are cusps
  private readonly llmService = new LLMService();
  
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
          cusps.push({
            triad: `${domain} - ${triadName}`,
            traits,
            scores,
            requiresClarification: true
          });
        }
      });
    });
    
    // Generate clarification questions for each cusp
    for (const cusp of cusps) {
      cusp.clarificationQuestions = await this.generateClarificationQuestions(cusp);
    }
    
    return cusps;
  }
  
  async generateClarificationQuestions(cusp: CuspAnalysis): Promise<string[]> {
    const traitDescriptions = this.getTraitDescriptions();
    
    const prompt = `
Generate 3 Socratic clarification questions to distinguish between these personality traits:

Triad: ${cusp.triad}
Traits and current scores:
${cusp.traits.map((t, i) => `- ${t}: ${cusp.scores[i].toFixed(1)} - ${traitDescriptions[t] || 'No description available'}`).join('\n')}

Create questions that:
1. Present realistic scenarios where these traits would manifest differently
2. Ask about preferences in specific situations  
3. Explore underlying motivations and values
4. Are conversational and easy to understand
5. Help clarify which trait is most dominant for this person

Format: Return only the questions, one per line, without numbering.
`;
    
    const response = await this.llmService.callLLM(prompt, 'tieBreaking');
    return response.split('\n').filter(q => q.trim()).slice(0, 3);
  }
  
  async processClarificationResponse(
    question: string,
    response: string,
    cusp: CuspAnalysis
  ): Promise<Record<string, number>> {
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

Return only a valid JSON object with trait names as keys and adjustment values as numbers:
{"${cusp.traits[0]}": 0.0, "${cusp.traits[1]}": 0.0, "${cusp.traits[2]}": 0.0}
`;
    
    const llmResponse = await this.llmService.callLLM(prompt, 'tieBreaking');
    
    try {
      // Extract JSON from response
      const jsonMatch = llmResponse.match(/\{[^}]+\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: return neutral adjustments
      const neutralAdjustments: Record<string, number> = {};
      cusp.traits.forEach(trait => {
        neutralAdjustments[trait] = 0;
      });
      return neutralAdjustments;
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      // Return neutral adjustments as fallback
      const neutralAdjustments: Record<string, number> = {};
      cusp.traits.forEach(trait => {
        neutralAdjustments[trait] = 0;
      });
      return neutralAdjustments;
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
}