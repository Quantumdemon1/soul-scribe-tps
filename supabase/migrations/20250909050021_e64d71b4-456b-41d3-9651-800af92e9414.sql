-- Create personality_overrides table
CREATE TABLE public.personality_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  mbti_type TEXT,
  enneagram_type TEXT,
  big_five_scores JSONB,
  integral_level TEXT,
  holland_code TEXT,
  alignment TEXT,
  socionics_type TEXT,
  attachment_style TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.personality_overrides ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage personality overrides" 
ON public.personality_overrides 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own overrides" 
ON public.personality_overrides 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_personality_overrides_updated_at
BEFORE UPDATE ON public.personality_overrides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();