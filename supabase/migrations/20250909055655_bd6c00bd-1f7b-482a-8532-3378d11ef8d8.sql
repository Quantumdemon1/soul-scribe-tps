-- Create test_results table for tracking user testing sessions
CREATE TABLE public.test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  test_type TEXT NOT NULL, -- 'assessment', 'system', 'ux', 'production'
  test_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'started', -- 'started', 'completed', 'abandoned', 'failed'
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  completion_percentage NUMERIC DEFAULT 0,
  score NUMERIC,
  metadata JSONB DEFAULT '{}',
  errors JSONB DEFAULT '[]',
  performance_metrics JSONB DEFAULT '{}',
  browser_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.test_results ENABLE ROW LEVEL SECURITY;

-- Create policies for test_results
CREATE POLICY "Admins can view all test results" 
ON public.test_results 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their own test results" 
ON public.test_results 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test results" 
ON public.test_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test results" 
ON public.test_results 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all test results" 
ON public.test_results 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_test_results_user_id ON public.test_results(user_id);
CREATE INDEX idx_test_results_test_type ON public.test_results(test_type);
CREATE INDEX idx_test_results_status ON public.test_results(status);
CREATE INDEX idx_test_results_created_at ON public.test_results(created_at);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_test_results_updated_at
BEFORE UPDATE ON public.test_results
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();