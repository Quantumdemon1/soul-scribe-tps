-- Update ai_insights table to support dashboard sections
ALTER TABLE ai_insights ADD COLUMN IF NOT EXISTS section_name TEXT;
ALTER TABLE ai_insights ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT now();
ALTER TABLE ai_insights ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 1;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_insights_section_user ON ai_insights(user_id, section_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_cache_key ON ai_insights(cache_key) WHERE cache_key IS NOT NULL;

-- Add trigger to update last_accessed_at on SELECT operations (via function)
CREATE OR REPLACE FUNCTION update_ai_insights_access()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_accessed_at = now();
  NEW.access_count = OLD.access_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add comment for clarity
COMMENT ON COLUMN ai_insights.section_name IS 'Dashboard section name (coreInsights, personalDevelopment, careerLifestyle, etc.)';
COMMENT ON COLUMN ai_insights.last_accessed_at IS 'Timestamp when this insight was last accessed';
COMMENT ON COLUMN ai_insights.access_count IS 'Number of times this insight has been accessed';