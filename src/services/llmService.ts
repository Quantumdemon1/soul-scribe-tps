import { supabase } from '@/integrations/supabase/client';
import { LLMConfig } from '@/types/llm.types';
import { InputValidator } from '@/utils/inputValidation';
import { DEFAULT_SYSTEM_PROMPTS } from '@/config/systemPrompts';
import { logger } from '@/utils/structuredLogging';
import { RobustJSONParser, LLMValidators } from '@/utils/robustJSONParser';
import type { PersonalityProfile } from '@/types/tps.types';

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
        logger.error('Error loading LLM configuration', { component: 'LLMService' }, error);
        throw new Error(`Failed to load LLM configuration: ${error.message}`);
      }
      
      if (!data) {
        // Return default configuration if none exists
        this.config = {
          provider: 'openai',
          model: 'gpt-4o-mini',
          temperature: 0.7,
          maxTokens: 2000,
          systemPrompts: DEFAULT_SYSTEM_PROMPTS
        };
      } else {
        // Merge stored config with default system prompts to ensure all prompts are available
        this.config = {
          ...(data.config as unknown as LLMConfig),
          systemPrompts: {
            ...DEFAULT_SYSTEM_PROMPTS,
            ...(data.config as any)?.systemPrompts || {}
          }
        };
      }
    }
    
    return this.config;
  }

  async callLLM(prompt: string, promptType: keyof LLMConfig['systemPrompts'], retries = 3): Promise<string> {
    // Input validation and sanitization
    const sanitizedPrompt = InputValidator.validatePromptInput(prompt);
    
    const config = await this.getConfig();
    const systemPrompt = config.systemPrompts[promptType];
    
    if (!systemPrompt) {
      throw new Error(`System prompt not found for type: ${promptType}`);
    }
    
    let lastError: Error;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        if (config.provider === 'openai') {
          return await this.callOpenAI(sanitizedPrompt, systemPrompt, config);
        } else if (config.provider === 'anthropic') {
          return await this.callClaude(sanitizedPrompt, systemPrompt, config);
        }
        throw new Error('Invalid LLM provider');
      } catch (error) {
        lastError = error as Error;
        logger.warn(`LLM call attempt ${attempt}/${retries} failed`, { component: 'LLMService', metadata: { attempt, retries } });
        
        if (attempt === retries) {
          throw lastError;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    throw lastError!;
  }

  private async callOpenAI(prompt: string, systemPrompt: string, config: LLMConfig): Promise<string> {
    try {
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      );

      const request = supabase.functions.invoke('llm-proxy', {
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

      const response = await Promise.race([request, timeout]) as { data?: any; error?: any };

      if (response.error) {
        logger.error('LLM Proxy Error', { component: 'LLMService', metadata: { provider: 'openai', error: response.error } });
        throw new Error(`OpenAI API error: ${response.error.message || 'Unknown error'}`);
      }

      if (!response.data || !response.data.choices || !response.data.choices[0]) {
        logger.error('Invalid response structure', { component: 'LLMService', metadata: { provider: 'openai', data: response.data } });
        throw new Error('Invalid response from OpenAI API');
      }

      const content = response.data.choices[0].message.content;
      if (!content || content.trim().length === 0) {
        throw new Error('Empty response from OpenAI API');
      }

      // Parse response with robust JSON parser for structured responses
      if (content.includes('{') && content.includes('}')) {
        const parseResult = RobustJSONParser.parseWithFallback(
          content,
          content, // Use raw content as fallback
          (data): data is Record<string, unknown> => 
            typeof data === 'object' && data !== null
        );

        return parseResult.success ? JSON.stringify(parseResult.data) : content;
      }

      return content;
    } catch (error) {
      logger.error('Error calling OpenAI', { component: 'LLMService', metadata: { provider: 'openai' } }, error as Error);
      throw error;
    }
  }

  private async callClaude(prompt: string, systemPrompt: string, config: LLMConfig): Promise<string> {
    try {
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      );

      const request = supabase.functions.invoke('llm-proxy', {
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

      const response = await Promise.race([request, timeout]) as { data?: any; error?: any };

      if (response.error) {
        logger.error('LLM Proxy Error', { component: 'LLMService', metadata: { provider: 'anthropic', error: response.error } });
        throw new Error(`Claude API error: ${response.error.message || 'Unknown error'}`);
      }

      if (!response.data || !response.data.content || !response.data.content[0]) {
        logger.error('Invalid response structure', { component: 'LLMService', metadata: { provider: 'anthropic', data: response.data } });
        throw new Error('Invalid response from Claude API');
      }

      const content = response.data.content[0].text;
      if (!content || content.trim().length === 0) {
        throw new Error('Empty response from Claude API');
      }

      return content;
    } catch (error) {
      logger.error('Error calling Claude', { component: 'LLMService', metadata: { provider: 'anthropic' } }, error as Error);
      throw error;
    }
  }

  async generateInsight(
    profile: PersonalityProfile,
    promptType: keyof LLMConfig['systemPrompts']
  ): Promise<string> {
    const prompt = this.buildInsightPrompt(profile, promptType);
    return this.callLLM(prompt, promptType);
  }

  async generateMentorResponse(
    userMessage: string,
    profile: PersonalityProfile,
    conversationHistory: Array<{role: string, content: string}> = []
  ): Promise<string> {
    const contextPrompt = this.buildMentorPrompt(profile, userMessage, conversationHistory);
    return this.callLLM(contextPrompt, 'aiMentor');
  }

  private buildMentorPrompt(
    profile: PersonalityProfile,
    userMessage: string, 
    conversationHistory: Array<{role: string, content: string}>
  ): string {
    const { dominantTraits, traitScores, domainScores, mappings } = profile;
    
    const personalityContext = `
USER'S PERSONALITY PROFILE:

Dominant Traits by Triad:
${Object.entries(dominantTraits).map(([triad, trait]) => `- ${triad}: ${trait}`).join('\n')}

Domain Scores:
- External Focus: ${domainScores.External}/10 (How they engage with the outer world)
- Internal Focus: ${domainScores.Internal}/10 (Their inner mental processes)
- Interpersonal Style: ${domainScores.Interpersonal}/10 (How they relate to others)
- Processing Style: ${domainScores.Processing}/10 (How they handle information)

Framework Mappings:
- MBTI Type: ${mappings.mbti}
- Enneagram: ${mappings.enneagram}
- D&D Alignment: ${mappings.dndAlignment}
- Big Five: O=${mappings.bigFive.Openness} C=${mappings.bigFive.Conscientiousness} E=${mappings.bigFive.Extraversion} A=${mappings.bigFive.Agreeableness} N=${mappings.bigFive.Neuroticism}

CONVERSATION CONTEXT:
${conversationHistory.length > 0 ? 
  conversationHistory.slice(-6).map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n') : 
  'This is the beginning of your conversation with this user.'
}

CURRENT USER MESSAGE: "${userMessage}"

Please respond as their AI Personality Mentor, taking into account their unique personality profile. Adapt your communication style to their preferences, provide insights relevant to their traits, and offer practical guidance that resonates with their personality type.`;

    return personalityContext;
  }

  private buildInsightPrompt(profile: PersonalityProfile, type: keyof LLMConfig['systemPrompts']): string {
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