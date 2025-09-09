-- Create test_sessions table for enhanced session management
CREATE TABLE public.test_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  test_type TEXT NOT NULL,
  test_name TEXT NOT NULL,
  current_page INTEGER NOT NULL DEFAULT 0,
  total_pages INTEGER NOT NULL,
  responses JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'abandoned')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completion_percentage NUMERIC NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own test sessions" 
  ON public.test_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test sessions" 
  ON public.test_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test sessions" 
  ON public.test_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test sessions" 
  ON public.test_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for admins
CREATE POLICY "Admins can view all test sessions" 
  ON public.test_sessions 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all test sessions" 
  ON public.test_sessions 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for performance
CREATE INDEX idx_test_sessions_user_id ON public.test_sessions(user_id);
CREATE INDEX idx_test_sessions_session_token ON public.test_sessions(session_token);
CREATE INDEX idx_test_sessions_status ON public.test_sessions(status);
CREATE INDEX idx_test_sessions_expires_at ON public.test_sessions(expires_at);

-- Create trigger for updated_at
CREATE TRIGGER update_test_sessions_updated_at
  BEFORE UPDATE ON public.test_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_test_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.test_sessions 
  SET status = 'expired' 
  WHERE expires_at < now() AND status = 'active';
END;
$$;