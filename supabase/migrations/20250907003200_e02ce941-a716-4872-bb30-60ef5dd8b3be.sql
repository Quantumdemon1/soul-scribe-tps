-- Create bulk_imports table to track import jobs
CREATE TABLE public.bulk_imports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  import_type TEXT NOT NULL CHECK (import_type IN ('users', 'assessments')),
  batch_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  total_records INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  errors JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.bulk_imports ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Admins can manage bulk imports" 
ON public.bulk_imports 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add index for better performance
CREATE INDEX idx_bulk_imports_admin_user_id ON public.bulk_imports(admin_user_id);
CREATE INDEX idx_bulk_imports_batch_id ON public.bulk_imports(batch_id);
CREATE INDEX idx_bulk_imports_status ON public.bulk_imports(status);