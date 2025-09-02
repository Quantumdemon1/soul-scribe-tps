-- Performance optimization indexes for better query performance

-- Index for assessments by user and creation date (for history views)
CREATE INDEX IF NOT EXISTS idx_assessments_user_created ON public.assessments(user_id, created_at DESC);

-- Index for assessments by variant (for filtering)
CREATE INDEX IF NOT EXISTS idx_assessments_variant ON public.assessments(variant);

-- Composite index for AI insights by user and type
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_type ON public.ai_insights(user_id, insight_type);

-- Index for AI insights by assessment
CREATE INDEX IF NOT EXISTS idx_ai_insights_assessment ON public.ai_insights(assessment_id);

-- Index for socratic sessions by user and creation date
CREATE INDEX IF NOT EXISTS idx_socratic_sessions_user_created ON public.socratic_sessions(user_id, created_at DESC);

-- Add triggers for automatic updated_at timestamps
CREATE TRIGGER update_assessments_updated_at
BEFORE UPDATE ON public.assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_insights_updated_at
BEFORE UPDATE ON public.ai_insights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add constraints for data integrity
ALTER TABLE public.assessments 
ADD CONSTRAINT assessments_variant_check 
CHECK (variant IN ('full', 'quick', 'mini'));

ALTER TABLE public.ai_insights 
ADD CONSTRAINT ai_insights_type_check 
CHECK (insight_type IN ('personality_analysis', 'career_recommendation', 'development_plan', 'comparative_analysis'));