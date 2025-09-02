-- Create error_logs table for frontend error tracking
CREATE TABLE IF NOT EXISTS public.error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  error_type text NOT NULL CHECK (error_type IN ('javascript','network','authentication','validation','llm','database')),
  error_message text NOT NULL,
  error_stack text NULL,
  user_agent text NULL,
  url text NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  severity text NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  context jsonb NULL DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (without IF NOT EXISTS as it's not supported)
CREATE POLICY "Users can insert own or anonymous error logs"
ON public.error_logs
FOR INSERT
TO authenticated, anon
WITH CHECK ((auth.role() = 'authenticated' AND auth.uid() = user_id) OR user_id IS NULL);

CREATE POLICY "Users can view their own error logs"
ON public.error_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON public.error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_type ON public.error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON public.error_logs(severity);