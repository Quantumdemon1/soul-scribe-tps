-- LLM Configuration Table
CREATE TABLE public.llm_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config JSONB NOT NULL DEFAULT '{}',
  mapping_weights JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Socratic Sessions Table  
CREATE TABLE public.socratic_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  initial_scores JSONB NOT NULL,
  cusps JSONB NOT NULL,
  conversations JSONB NOT NULL DEFAULT '[]',
  final_scores JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Generated Insights Table
CREATE TABLE public.ai_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  content JSONB NOT NULL,
  model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.llm_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.socratic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for llm_config (admin only for now)
CREATE POLICY "Admins can manage LLM config" ON public.llm_config FOR ALL USING (false);

-- RLS Policies for socratic_sessions
CREATE POLICY "Users can view their own socratic sessions" ON public.socratic_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own socratic sessions" ON public.socratic_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own socratic sessions" ON public.socratic_sessions
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for ai_insights
CREATE POLICY "Users can view their own insights" ON public.ai_insights
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insights" ON public.ai_insights
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_socratic_sessions_user_id ON public.socratic_sessions(user_id);
CREATE INDEX idx_ai_insights_user_id ON public.ai_insights(user_id);
CREATE INDEX idx_ai_insights_assessment_id ON public.ai_insights(assessment_id);

-- Insert default LLM config
INSERT INTO public.llm_config (config, mapping_weights) VALUES (
  '{
    "provider": "openai",
    "model": "gpt-4o-mini",
    "temperature": 0.7,
    "maxTokens": 2000,
    "systemPrompts": {
      "tieBreaking": "You are a skilled psychologist conducting a Socratic dialogue to clarify personality traits. Your role: Ask thoughtful, open-ended questions that reveal trait preferences. Focus on concrete scenarios and real-life examples. Avoid leading questions or bias. Interpret responses to identify trait indicators. Provide nuanced scoring adjustments based on responses.",
      "insightGeneration": "You are an expert personality psychologist providing insights based on TPS assessment results. Provide balanced, constructive feedback. Highlight both strengths and growth areas. Use accessible, non-technical language. Offer practical, actionable suggestions. Maintain an encouraging, supportive tone.",
      "careerGuidance": "You are a career counselor specializing in personality-based career matching. Consider natural strengths, work environment preferences, communication styles, motivation patterns. Provide specific career path recommendations, industry suggestions, work environment considerations, skills to develop.",
      "developmentPlanning": "You are a personal development coach creating customized growth plans. Identify key development opportunities, suggest specific goals, provide actionable strategies, consider personality-appropriate approaches, balance challenge with achievability."
    }
  }',
  '{
    "mbti": {
      "extraversion": {"communalNavigate": 0.35, "dynamic": 0.35, "assertive": 0.15, "direct": 0.15},
      "intuition": {"intuitive": 0.40, "universal": 0.30, "varied": 0.15, "selfAware": 0.15},
      "thinking": {"analytical": 0.35, "stoic": 0.25, "direct": 0.20, "pragmatic": 0.20},
      "judging": {"structured": 0.35, "lawful": 0.25, "selfMastery": 0.20, "assertive": 0.20}
    },
    "bigFive": {
      "openness": {"intuitive": 0.25, "universal": 0.20, "selfAware": 0.15, "varied": 0.15, "independent": 0.10, "selfPrincipled": 0.10, "dynamic": 0.05},
      "conscientiousness": {"structured": 0.25, "selfMastery": 0.25, "lawful": 0.20, "pragmatic": 0.10, "assertive": 0.10, "realistic": 0.10},
      "extraversion": {"assertive": 0.20, "dynamic": 0.20, "communalNavigate": 0.20, "direct": 0.15, "optimistic": 0.15, "extrinsic": 0.10},
      "agreeableness": {"diplomatic": 0.25, "passive": 0.20, "responsive": 0.15, "communalNavigate": 0.15, "mixedCommunication": 0.15, "social": 0.10},
      "neuroticism": {"turbulent": 0.30, "pessimistic": 0.25, "selfIndulgent": 0.15, "passive": 0.10, "ambivalent": 0.10, "stoicInverse": 0.10}
    }
  }'
);