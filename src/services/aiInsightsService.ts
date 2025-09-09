import { PersonalityProfile } from '@/types/tps.types';
import { AIInsights } from '@/types/llm.types';
import { LLMService } from './llmService';
import { FrameworkInsightsService } from './frameworkInsightsService';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/structuredLogging';
import { stableHash } from '@/utils/hash';

export class AIInsightsService {
  private llmService = new LLMService();
  private frameworkInsightsService = new FrameworkInsightsService();
  private memoryCache = new Map<string, { insights: AIInsights; timestamp: number }>();
  private readonly CACHE_TTL = 1000 * 60 * 30; // 30 minutes

  async generateInsights(profile: PersonalityProfile, userId?: string): Promise<AIInsights> {
    try {
      logger.info('Starting AI insights generation for profile', { 
        component: 'aiInsightsService',
        metadata: { hasProfile: !!profile }
      });
      
      // Create cache key based on profile traits and scores
      const cacheKey = stableHash({
        type: 'comprehensive_insights',
        traitScores: profile.traitScores,
        dominantTraits: profile.dominantTraits,
        domainScores: profile.domainScores
      });

      // Check memory cache first
      const cachedResult = this.getFromMemoryCache(cacheKey);
      if (cachedResult) {
        logger.aiService('generate_comprehensive_insights', 'Using cached comprehensive insights', { userId });
        return cachedResult;
      }

      // Check database cache if user is provided
      if (userId) {
        const dbCached = await this.getFromDatabaseCache(userId, 'comprehensive', cacheKey);
        if (dbCached) {
          logger.aiService('generate_comprehensive_insights', 'Using database cached comprehensive insights', { userId });
          this.setMemoryCache(cacheKey, dbCached);
          return dbCached;
        }
      }

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

      logger.aiService('generate_comprehensive_insights', 'Successfully generated AI insights', { userId });

      // Generate framework insights if not already present
      if (!profile.frameworkInsights) {
        try {
          const frameworkInsights = await this.frameworkInsightsService.generateFrameworkInsights(profile, profile.traitScores, userId);
          profile.frameworkInsights = frameworkInsights;
          logger.aiService('generate_framework_insights', 'Successfully generated framework insights', { userId });
        } catch (error) {
          logger.aiService('generate_framework_insights', 'Error generating framework insights', { userId }, error as Error);
          // Continue without framework insights rather than failing entirely
        }
      }

      // Cache and save insights
      this.setMemoryCache(cacheKey, insights);
      if (userId) {
        await this.saveInsights(insights, userId, profile, cacheKey);
      }

      return insights;
    } catch (error) {
      logger.aiService('generate_comprehensive_insights', 'Error generating AI insights', { userId }, error as Error);
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
    profile: PersonalityProfile,
    cacheKey?: string
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
          model_used: 'gpt-5-2025-08-07', // This should come from config
          cache_key: cacheKey,
          version: 1
        });
        logger.aiService('save_insights', 'Successfully saved AI insights to database', { userId });
      } catch (error) {
        logger.aiService('save_insights', 'Error saving insights to database', { userId }, error as Error);
      // Show visible error to user when database save fails
      throw new Error(`Failed to save insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getInsights(userId: string, assessmentId?: string): Promise<AIInsights | null> {
    try {
      let query = supabase
        .from('ai_insights')
        .select('content')
        .eq('user_id', userId)
        .eq('insight_type', 'comprehensive')
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
      logger.aiService('get_cached_insights', 'Error retrieving insights', { userId }, error as Error);
      return null;
    }
  }

  private getFromMemoryCache(cacheKey: string): AIInsights | null {
    const cached = this.memoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.insights;
    }
    if (cached) {
      this.memoryCache.delete(cacheKey); // Remove expired
    }
    return null;
  }

  private setMemoryCache(cacheKey: string, insights: AIInsights): void {
    this.memoryCache.set(cacheKey, {
      insights,
      timestamp: Date.now()
    });

    // Cleanup old entries
    if (this.memoryCache.size > 50) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }
  }

  private async getFromDatabaseCache(userId: string, insightType: string, cacheKey: string): Promise<AIInsights | null> {
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('content')
        .eq('user_id', userId)
        .eq('insight_type', insightType)
        .eq('cache_key', cacheKey)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return data.content as unknown as AIInsights;
    } catch (error) {
      logger.aiService('get_database_cached_insights', 'Error retrieving cached insights from database', { userId }, error as Error);
      return null;
    }
  }
}