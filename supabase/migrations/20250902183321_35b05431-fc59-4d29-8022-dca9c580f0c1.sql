-- Clean up duplicate LLM configurations and ensure only one active config
-- Delete older configurations, keeping only the most recent one
DELETE FROM public.llm_config 
WHERE id NOT IN (
  SELECT id 
  FROM public.llm_config 
  ORDER BY updated_at DESC 
  LIMIT 1
);

-- Add a unique constraint to prevent duplicate configurations in the future
-- We'll use a fixed id approach to ensure only one config exists
-- First, update the remaining config to use a fixed UUID
UPDATE public.llm_config 
SET id = '00000000-0000-0000-0000-000000000000'
WHERE id = (
  SELECT id 
  FROM public.llm_config 
  ORDER BY updated_at DESC 
  LIMIT 1
);

-- Now we can safely add a check constraint that ensures only one config
-- by requiring all configs to have the fixed UUID
ALTER TABLE public.llm_config 
ADD CONSTRAINT single_config_check 
CHECK (id = '00000000-0000-0000-0000-000000000000');