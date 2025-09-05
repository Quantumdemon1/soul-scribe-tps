import { LLMService } from './llmService';
import { PersonalityProfile } from '@/types/tps.types';
import { supabase } from '@/integrations/supabase/client';

export interface FrameworkExplanation {
  mbti?: string;
  enneagram?: string;
  bigFive?: string;
  attachment?: string;
  alignment?: string;
  holland?: string;
}

export class EnhancedInsightService {
  private llmService = new LLMService();
  private cache = new Map<string, FrameworkExplanation>();
  private readonly CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  async generateFrameworkExplanations(
    profile: PersonalityProfile,
    frameworks: string[],
    userId?: string
  ): Promise<FrameworkExplanation> {
    const cacheKey = this.generateCacheKey(profile, frameworks);
    
    // Check memory cache first
    const cached = this.getFromMemoryCache(cacheKey);
    if (cached) return cached;

    // Check database cache if user ID available
    if (userId) {
      const dbCached = await this.getFromDatabaseCache(userId, cacheKey);
      if (dbCached) {
        this.setMemoryCache(cacheKey, dbCached);
        return dbCached;
      }
    }

    // Generate explanations for requested frameworks
    const explanations: FrameworkExplanation = {};
    const promises: Promise<void>[] = [];

    for (const framework of frameworks) {
      const promise = this.generateSingleExplanation(profile, framework)
        .then(explanation => {
          (explanations as any)[framework] = explanation;
        })
        .catch(error => {
          console.error(`Error generating ${framework} explanation:`, error);
          (explanations as any)[framework] = `Unable to generate ${framework} explanation at this time.`;
        });
      promises.push(promise);
    }

    await Promise.all(promises);

    // Cache the results
    this.setMemoryCache(cacheKey, explanations);
    if (userId) {
      await this.saveToDatabaseCache(userId, cacheKey, explanations);
    }

    return explanations;
  }

  private async generateSingleExplanation(
    profile: PersonalityProfile,
    framework: string
  ): Promise<string> {
    const promptType = `${framework}Explanation` as keyof any;
    
    switch (framework) {
      case 'mbti':
        return this.generateMBTIExplanation(profile);
      case 'enneagram':
        return this.generateEnneagramExplanation(profile);
      case 'bigFive':
        return this.generateBigFiveExplanation(profile);
      case 'attachment':
        return this.generateAttachmentExplanation(profile);
      case 'alignment':
        return this.generateAlignmentExplanation(profile);
      case 'holland':
        return this.generateHollandExplanation(profile);
      default:
        throw new Error(`Unknown framework: ${framework}`);
    }
  }

  private async generateMBTIExplanation(profile: PersonalityProfile): Promise<string> {
    const { dominantTraits, mappings, traitScores } = profile;
    
    const prompt = `
Based on this personality profile, explain their MBTI type and cognitive functions:

MBTI Type: ${mappings.mbti}
TPS Dominant Traits: ${Object.entries(dominantTraits).map(([triad, trait]) => `${triad}: ${trait}`).join(', ')}

Key TPS Traits for MBTI Analysis:
- External Focus: ${traitScores.Structured}/10, Assertive: ${traitScores.Assertive}/10
- Interpersonal: Social: ${traitScores.Social}/10, Direct: ${traitScores.Direct}/10  
- Processing: Analytical: ${traitScores.Analytical}/10, Intuitive: ${traitScores.Intuitive}/10
- Internal: ${traitScores.Responsive}/10 Responsive, ${traitScores.Regulated}/10 Regulated

Please explain why they got this MBTI type, how their cognitive functions work, and practical applications.`;

    return this.llmService.callLLM(prompt, 'mbtiExplanation');
  }

  private async generateEnneagramExplanation(profile: PersonalityProfile): Promise<string> {
    const { dominantTraits, mappings, traitScores } = profile;
    
    const prompt = `
Based on this personality profile, explain their Enneagram type deeply:

Enneagram Type: ${mappings.enneagram}
TPS Dominant Traits: ${Object.entries(dominantTraits).map(([triad, trait]) => `${triad}: ${trait}`).join(', ')}

Key motivation-related traits:
- Self-Focus: ${traitScores.SelfIndulgent}/10 Self-Indulgent vs Self-Mastery
- Behavior: ${traitScores.Optimistic}/10 Optimistic vs Pessimistic  
- Motivation: ${traitScores.Intrinsic}/10 Intrinsic vs Extrinsic
- Will: ${traitScores.Assertive}/10 Assertive vs Passive

Please explain their core type, wing influence, instinctual variant, and growth patterns.`;

    return this.llmService.callLLM(prompt, 'enneagramExplanation');
  }

  private async generateBigFiveExplanation(profile: PersonalityProfile): Promise<string> {
    const { mappings, traitScores } = profile;
    
    const prompt = `
Based on this personality profile, explain their Big Five trait scores:

Big Five Scores:
- Openness: ${mappings.bigFive.Openness}/10
- Conscientiousness: ${mappings.bigFive.Conscientiousness}/10  
- Extraversion: ${mappings.bigFive.Extraversion}/10
- Agreeableness: ${mappings.bigFive.Agreeableness}/10
- Neuroticism: ${mappings.bigFive.Neuroticism}/10

Contributing TPS Traits:
- Openness: Intuitive ${traitScores.Intuitive}/10, Universal ${traitScores.Universal}/10
- Conscientiousness: Structured ${traitScores.Structured}/10, Self-Mastery ${traitScores.SelfMastery}/10
- Extraversion: Social ${traitScores.Social}/10, Dynamic ${traitScores.Dynamic}/10
- Agreeableness: Diplomatic ${traitScores.Diplomatic}/10, Communal ${traitScores.Communal}/10  
- Neuroticism: Turbulent ${traitScores.Turbulent}/10

Please explain what each score means and how the facets combine to influence behavior.`;

    return this.llmService.callLLM(prompt, 'bigFiveExplanation');
  }

  private async generateAttachmentExplanation(profile: PersonalityProfile): Promise<string> {
    const { mappings, traitScores, dominantTraits } = profile;
    
    const prompt = `
Based on this personality profile, explain their attachment style:

Attachment Style: ${mappings.attachmentStyle || 'Not determined'}
TPS Relationship Traits:
- Interpersonal Domain: ${Object.entries(dominantTraits).filter(([k]) => ['Navigate', 'Communication', 'Stimulation'].includes(k)).map(([triad, trait]) => `${triad}: ${trait}`).join(', ')}
- Social: ${traitScores.Social}/10
- Diplomatic: ${traitScores.Diplomatic}/10  
- Communal: ${traitScores.Communal}/10
- Turbulent: ${traitScores.Turbulent}/10 (emotional regulation)

Please explain their attachment style, relationship patterns, and development strategies.`;

    return this.llmService.callLLM(prompt, 'attachmentExplanation');
  }

  private async generateAlignmentExplanation(profile: PersonalityProfile): Promise<string> {
    const { mappings, traitScores } = profile;
    
    const prompt = `
Based on this personality profile, explain their moral and ethical alignment:

D&D Alignment: ${mappings.dndAlignment}
Ethical Traits:
- Structured: ${traitScores.Structured}/10 (rule adherence)
- SelfPrincipled: ${traitScores.SelfPrincipled}/10 (personal ethics)
- Diplomatic: ${traitScores.Diplomatic}/10 (consideration for others)
- Assertive: ${traitScores.Assertive}/10 (direct action)

Please explain their ethical decision-making patterns, moral positioning, and leadership implications.`;

    return this.llmService.callLLM(prompt, 'alignmentExplanation');
  }

  private async generateHollandExplanation(profile: PersonalityProfile): Promise<string> {
    const { mappings, traitScores, dominantTraits } = profile;
    
    const prompt = `
Based on this personality profile, explain their career preferences and Holland Code:

Holland Code: ${mappings.hollandCode || 'Not determined'}
Career-relevant TPS Traits:
- External Domain: ${Object.entries(dominantTraits).filter(([k]) => ['Control', 'Will', 'Design'].includes(k)).map(([triad, trait]) => `${triad}: ${trait}`).join(', ')}
- Analytical: ${traitScores.Analytical}/10
- Intuitive: ${traitScores.Intuitive}/10
- Social: ${traitScores.Social}/10
- Structured: ${traitScores.Structured}/10

Please explain why they got this Holland Code, specific career recommendations, and development strategies.`;

    return this.llmService.callLLM(prompt, 'hollandExplanation');
  }

  private generateCacheKey(profile: PersonalityProfile, frameworks: string[]): string {
    const profileKey = JSON.stringify({
      traits: profile.dominantTraits,
      mappings: profile.mappings
    });
    return `${btoa(profileKey)}_${frameworks.sort().join('_')}`;
  }

  private getFromMemoryCache(cacheKey: string): FrameworkExplanation | null {
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    return null;
  }

  private setMemoryCache(cacheKey: string, explanations: FrameworkExplanation): void {
    // Simple cache size management
    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(cacheKey, explanations);
  }

  private async getFromDatabaseCache(userId: string, cacheKey: string): Promise<FrameworkExplanation | null> {
    try {
      // Use ai_insights table for now, can create dedicated table later
      const { data, error } = await supabase
        .from('ai_insights')
        .select('content, created_at')
        .eq('user_id', userId)
        .eq('cache_key', cacheKey)
        .eq('insight_type', 'enhanced_explanations')
        .maybeSingle();

      if (error || !data) return null;

      // Check if cache is still valid (24 hours)
      const cacheAge = Date.now() - new Date(data.created_at).getTime();
      if (cacheAge > this.CACHE_EXPIRY) {
        // Delete expired cache
        await supabase
          .from('ai_insights')
          .delete()
          .eq('user_id', userId)
          .eq('cache_key', cacheKey)
          .eq('insight_type', 'enhanced_explanations');
        return null;
      }

      return data.content as FrameworkExplanation;
    } catch (error) {
      console.error('Error reading from database cache:', error);
      return null;
    }
  }

  private async saveToDatabaseCache(userId: string, cacheKey: string, explanations: FrameworkExplanation): Promise<void> {
    try {
      await supabase
        .from('ai_insights')
        .upsert({
          user_id: userId,
          cache_key: cacheKey,
          insight_type: 'enhanced_explanations',
          content: explanations as any,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving to database cache:', error);
      // Don't throw - caching failure shouldn't break the main flow
    }
  }
}