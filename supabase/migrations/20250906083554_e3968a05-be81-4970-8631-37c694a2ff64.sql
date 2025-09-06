-- Create rate limiting table for API calls
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Enable RLS on rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can only view their own rate limit entries
CREATE POLICY "Users can view their own rate limits"
ON public.rate_limits
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own rate limit entries
CREATE POLICY "Users can insert their own rate limits"
ON public.rate_limits
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own rate limit entries
CREATE POLICY "Users can update their own rate limits"
ON public.rate_limits
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own rate limit entries
CREATE POLICY "Users can delete their own rate limits"
ON public.rate_limits
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for efficient rate limit queries
CREATE INDEX idx_rate_limits_user_endpoint_window 
ON public.rate_limits(user_id, endpoint, window_start);

-- Function to clean up old rate limit entries
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE created_at < now() - INTERVAL '1 hour';
END;
$$;