-- Insert default LLM configuration
INSERT INTO public.llm_config (id, config, mapping_weights)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '{
    "provider": "openai",
    "model": "gpt-5-2025-08-07",
    "temperature": 0.7,
    "maxTokens": 2000,
    "systemPrompts": {
      "tieBreaking": "You are an expert personality assessment assistant. Help clarify personality trait preferences through thoughtful questions and analysis. Focus on identifying subtle differences between similar traits through scenario-based questions.",
      "insightGeneration": "You are a personality psychologist with deep expertise in the Triadic Personality System. Generate comprehensive, actionable insights about personality patterns, strengths, and characteristics. Be specific, balanced, and focus on practical applications.",
      "careerGuidance": "You are a career counselor with expertise in personality psychology and the modern job market. Provide specific, practical career guidance based on personality traits. Consider work environments, suitable roles, and growth opportunities.",
      "developmentPlanning": "You are a personal development coach specializing in personality-based growth. Create specific, actionable development plans with concrete goals, practices, and exercises. Focus on leveraging strengths while addressing growth areas."
    }
  }'::jsonb,
  '{}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  config = EXCLUDED.config,
  mapping_weights = EXCLUDED.mapping_weights,
  updated_at = now();