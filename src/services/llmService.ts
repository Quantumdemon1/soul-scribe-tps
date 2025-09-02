import { supabase } from '@/integrations/supabase/client';
import { LLMConfig } from '@/types/llm.types';

export class LLMService {
  private config: LLMConfig | null = null;

  async getConfig(): Promise<LLMConfig> {
    if (!this.config) {
      const { data, error } = await supabase
        .from('llm_config')
        .select('config')
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .maybeSingle();
      
      if (error) {
        console.error('Error loading LLM configuration:', error);
        throw new Error(`Failed to load LLM configuration: ${error.message}`);
      }
      
      if (!data) {
        // Return default configuration if none exists
        this.config = {
          provider: 'openai',
          model: 'gpt-4o-mini',
          temperature: 0.7,
          maxTokens: 2000,
            systemPrompts: {
              tieBreaking: 'You are a skilled personality psychologist conducting Socratic clarification for the TPS assessment.',
              insightGeneration: 'You are an expert personality psychologist providing comprehensive insights based on TPS assessment results.',
              careerGuidance: 'You are a career counselor specializing in personality-career alignment using TPS assessment data.',
              developmentPlanning: 'You are a personal development coach creating customized growth plans based on TPS personality profiles.',
              frameworkAnalysis: 'You are an expert personality psychologist specializing in framework correlation analysis for the Triadic Personality System (TPS).',
              coreInsights: 'You are an expert personality psychologist providing personalized core insights based on TPS assessment results.'
            }
        };
      } else {
        this.config = data.config as unknown as LLMConfig;
      }
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
    try {
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
        console.error('LLM Proxy Error:', response.error);
        throw new Error(`OpenAI API error: ${response.error.message || 'Unknown error'}`);
      }

      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response from OpenAI API');
      }

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      throw error;
    }
  }

  private async callClaude(prompt: string, systemPrompt: string, config: LLMConfig): Promise<string> {
    try {
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
        console.error('LLM Proxy Error:', response.error);
        throw new Error(`Claude API error: ${response.error.message || 'Unknown error'}`);
      }

      if (!response.data || !response.data.content || !response.data.content[0]) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response from Claude API');
      }

      return response.data.content[0].text;
    } catch (error) {
      console.error('Error calling Claude:', error);
      throw error;
    }
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