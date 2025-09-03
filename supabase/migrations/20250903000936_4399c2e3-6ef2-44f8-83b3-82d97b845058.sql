-- Phase 5: Database Integration & Caching for AI Insights

-- 1) Add versioning and cache key support
ALTER TABLE public.ai_insights
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS cache_key text;

-- 2) Helpful indexes for fast lookups and caching
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_type_created
  ON public.ai_insights (user_id, insight_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_insights_assessment_type_created
  ON public.ai_insights (assessment_id, insight_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_insights_cache_key
  ON public.ai_insights (cache_key);
