import { PersonalityProfile } from '@/types/tps.types';
import { AIInsights } from '@/types/llm.types';
import { LLMService } from './llmService';
import { supabase } from '@/integrations/supabase/client';

export class AIInsightsService {
  private llmService = new LLMService();

  async generateInsights(profile: PersonalityProfile, userId?: string): Promise<AIInsights> {
    try {
      console.log('Starting AI insights generation for profile:', profile);
      
      // Generate insights in parallel for better performance
      const [general, career, development] = await Promise.all([
        this.llmService.generateInsight(profile, 'insightGeneration'),
        this.llmService.generateInsight(profile, 'careerGuidance'),
        this.llmService.generateInsight(profile, 'developmentPlanning')
      ]);

      const insights: AIInsights = {
        general,
        career,
        development,
        relationship: await this.generateRelationshipInsight(profile)
      };

      console.log('Successfully generated AI insights');

      // Save insights to database if user is provided
      if (userId) {
        await this.saveInsights(insights, userId, profile);
      }

      return insights;
    } catch (error) {
      console.error('Error generating AI insights:', error);
      // Provide more specific error message
      if (error instanceof Error) {
        throw new Error(`Failed to generate AI insights: ${error.message}`);
      }
      throw new Error('Failed to generate AI insights: Unknown error occurred');
    }
  }

  private async generateRelationshipInsight(profile: PersonalityProfile): Promise<string> {
    const prompt = this.buildRelationshipPrompt(profile);
    return this.llmService.callLLM(prompt, 'insightGeneration');
  }

  private buildRelationshipPrompt(profile: PersonalityProfile): string {
    const { dominantTraits, traitScores, domainScores, mappings } = profile;
    
    return `
Personality Profile Analysis for Relationship Insights:

Dominant Traits by Triad:
${Object.entries(dominantTraits).map(([triad, trait]) => `- ${triad}: ${trait}`).join('\n')}

Domain Scores:
- External: ${domainScores.External}/10
- Internal: ${domainScores.Internal}/10  
- Interpersonal: ${domainScores.Interpersonal}/10
- Processing: ${domainScores.Processing}/10

Key Interpersonal Traits:
- Communication Style: ${traitScores['Direct'] > 6 ? 'Direct' : traitScores['Mixed Communication'] > 6 ? 'Adaptive' : 'Passive'}
- Social Navigation: ${traitScores['Communal Navigate'] > 6 ? 'Group-oriented' : traitScores['Independent Navigate'] > 6 ? 'Self-reliant' : 'Flexible'}
- Emotional Regulation: ${traitScores['Stoic'] > 6 ? 'Stable' : traitScores['Turbulent'] > 6 ? 'Expressive' : 'Responsive'}

Provide relationship insights covering:
1. Communication preferences and style
2. Conflict resolution approach
3. Emotional support needs and offerings
4. Compatibility patterns with different personality types
5. Growth areas for relationship skills
6. Strengths in relationships and partnerships

Keep it practical, empathetic, and actionable for building better relationships.
`;
  }

  private async saveInsights(
    insights: AIInsights, 
    userId: string, 
    profile: PersonalityProfile
  ): Promise<void> {
    try {
      // Find associated assessment
      const { data: assessment } = await supabase
        .from('assessments')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      await supabase
        .from('ai_insights')
        .insert({
          user_id: userId,
          assessment_id: assessment?.id,
          insight_type: 'comprehensive',
          content: insights as any,
          model_used: 'gpt-5-2025-08-07' // This should come from config
        });
    } catch (error) {
      console.error('Error saving insights:', error);
      // Don't throw here - insights generation succeeded even if saving failed
    }
  }

  async getInsights(userId: string, assessmentId?: string): Promise<AIInsights | null> {
    try {
      let query = supabase
        .from('ai_insights')
        .select('content')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (assessmentId) {
        query = query.eq('assessment_id', assessmentId);
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error || !data) {
        return null;
      }

      return data.content as unknown as AIInsights;
    } catch (error) {
      console.error('Error retrieving insights:', error);
      return null;
    }
  }
}