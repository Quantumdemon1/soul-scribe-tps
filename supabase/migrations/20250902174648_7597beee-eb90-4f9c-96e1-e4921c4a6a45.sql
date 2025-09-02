-- Fix llm_config table and initialize with default configuration
CREATE TABLE IF NOT EXISTS public.llm_config (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    config jsonb NOT NULL DEFAULT '{}'::jsonb,
    mapping_weights jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.llm_config ENABLE ROW LEVEL SECURITY;

-- Create admin access policy (for now, allow authenticated users - can be restricted later)
DROP POLICY IF EXISTS "Admins can manage LLM config" ON public.llm_config;
CREATE POLICY "Authenticated users can manage LLM config" 
ON public.llm_config 
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert default configuration if none exists
INSERT INTO public.llm_config (config, mapping_weights)
SELECT 
    jsonb_build_object(
        'provider', 'openai',
        'model', 'gpt-4o-mini',
        'temperature', 0.7,
        'maxTokens', 2000,
        'systemPrompts', jsonb_build_object(
            'tieBreaking', 'You are a skilled personality psychologist conducting Socratic clarification for the Triadic Personality System (TPS) assessment. Ask thoughtful questions to help clarify trait preferences when scores are close.',
            'insightGeneration', 'You are an expert personality psychologist providing comprehensive insights based on TPS assessment results. Provide balanced, practical insights that highlight both strengths and growth opportunities.',
            'careerGuidance', 'You are a career counselor specializing in personality-career alignment using TPS assessment data. Provide specific career recommendations based on the personality profile.',
            'developmentPlanning', 'You are a personal development coach creating customized growth plans based on TPS personality profiles. Focus on actionable strategies that honor natural traits while expanding capabilities.'
        )
    ),
    jsonb_build_object(
        'mbti', jsonb_build_object(),
        'bigFive', jsonb_build_object()
    )
WHERE NOT EXISTS (SELECT 1 FROM public.llm_config);

-- Create or replace trigger for updated_at
CREATE TRIGGER update_llm_config_updated_at
    BEFORE UPDATE ON public.llm_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();