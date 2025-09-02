import { supabase } from '@/integrations/supabase/client';
import { LLMConfig } from '@/types/llm.types';

export class LLMService {
  private config: LLMConfig | null = null;

  async getConfig(): Promise<LLMConfig> {
    if (!this.config) {
      const { data, error } = await supabase
        .from('llm_config')
        .select('config')
        .single();
      
      if (error || !data) {
        throw new Error('Failed to load LLM configuration');
      }
      
      this.config = data.config as unknown as LLMConfig;
    }
    
    return this.config;
  }

  async callLLM(prompt: string, promptType: keyof LLMConfig['systemPrompts']): Promise<string> {
    const config = await this.getConfig();
    const systemPrompt = config.systemPrompts[promptType];
    
    if (config.provider === 'openai') {
      return this.callOpenAI(prompt, systemPrompt, config);
    } else if (config.provider === 'anthropic') {
      return this.callClaude(prompt, systemPrompt, config);
    }
    
    throw new Error('Invalid LLM provider');
  }

  private async callOpenAI(prompt: string, systemPrompt: string, config: LLMConfig): Promise<string> {
    const response = await supabase.functions.invoke('llm-proxy', {
      body: {
        provider: 'openai',
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: config.maxTokens
      }
    });

    if (response.error) {
      throw new Error(`OpenAI API error: ${response.error.message}`);
    }

    return response.data.choices[0].message.content;
  }

  private async callClaude(prompt: string, systemPrompt: string, config: LLMConfig): Promise<string> {
    const response = await supabase.functions.invoke('llm-proxy', {
      body: {
        provider: 'anthropic',
        model: config.model,
        system: systemPrompt,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature
      }
    });

    if (response.error) {
      throw new Error(`Claude API error: ${response.error.message}`);
    }

    return response.data.content[0].text;
  }

  async generateInsight(
    profile: any,
    promptType: keyof LLMConfig['systemPrompts']
  ): Promise<string> {
    const prompt = this.buildInsightPrompt(profile, promptType);
    return this.callLLM(prompt, promptType);
  }

  private buildInsightPrompt(profile: any, type: keyof LLMConfig['systemPrompts']): string {
    const { dominantTraits, traitScores, domainScores, mappings } = profile;
    
    const baseInfo = `
Personality Profile Analysis:

Dominant Traits by Triad:
${Object.entries(dominantTraits).map(([triad, trait]) => `- ${triad}: ${trait}`).join('\n')}

Domain Scores:
- External: ${domainScores.External}/10
- Internal: ${domainScores.Internal}/10  
- Interpersonal: ${domainScores.Interpersonal}/10
- Processing: ${domainScores.Processing}/10

Personality Framework Mappings:
- MBTI: ${mappings.mbti}
- Enneagram: ${mappings.enneagram}
- Big Five: Openness ${mappings.bigFive.Openness}, Conscientiousness ${mappings.bigFive.Conscientiousness}, Extraversion ${mappings.bigFive.Extraversion}, Agreeableness ${mappings.bigFive.Agreeableness}, Neuroticism ${mappings.bigFive.Neuroticism}
- Alignment: ${mappings.dndAlignment}
`;

    switch (type) {
      case 'insightGeneration':
        return `${baseInfo}

Provide a comprehensive personality insight covering:
1. Core patterns and strengths
2. Potential challenges and blind spots
3. Key characteristics and tendencies
4. General recommendations for growth

Keep it engaging, balanced, and actionable.`;

      case 'careerGuidance':
        return `${baseInfo}

Provide career guidance covering:
1. Ideal work environments and cultures
2. Suitable career paths and industries
3. Natural strengths to leverage
4. Skills worth developing
5. Potential workplace challenges

Focus on practical, specific recommendations.`;

      case 'developmentPlanning':
        return `${baseInfo}

Create a personal development plan covering:
1. Key growth areas based on personality profile
2. Specific, actionable goals (short and long-term)
3. Recommended practices and exercises
4. Learning approaches that fit this personality
5. Progress tracking suggestions

Be specific and practical.`;

      default:
        return baseInfo;
    }
  }
}