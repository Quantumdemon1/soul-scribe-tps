-- Create audit trail tables for scoring configuration changes

-- Audit log entries table
CREATE TABLE public.scoring_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'rollback')),
  target TEXT NOT NULL CHECK (target IN ('global_config', 'user_override', 'trait_mapping')),
  target_id TEXT,
  framework TEXT,
  change_description TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  impacted_users INTEGER,
  rollback_data JSONB,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Configuration snapshots table
CREATE TABLE public.config_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  config_data JSONB NOT NULL,
  changes_summary TEXT[] DEFAULT '{}'::text[]
);

-- Bulk operations table for tracking recalculation jobs
CREATE TABLE public.bulk_operations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operation_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  total_items INTEGER NOT NULL DEFAULT 0,
  processed_items INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  results JSONB DEFAULT '{}'::jsonb,
  error_details JSONB DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE public.scoring_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_operations ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit log
CREATE POLICY "Admins can manage audit logs" 
ON public.scoring_audit_log 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for config snapshots
CREATE POLICY "Admins can manage config snapshots" 
ON public.config_snapshots 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for bulk operations
CREATE POLICY "Admins can manage bulk operations" 
ON public.bulk_operations 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Indexes for performance
CREATE INDEX idx_scoring_audit_log_timestamp ON public.scoring_audit_log(timestamp DESC);
CREATE INDEX idx_scoring_audit_log_user_id ON public.scoring_audit_log(user_id);
CREATE INDEX idx_scoring_audit_log_framework ON public.scoring_audit_log(framework);
CREATE INDEX idx_config_snapshots_timestamp ON public.config_snapshots(timestamp DESC);
CREATE INDEX idx_bulk_operations_status ON public.bulk_operations(status);
CREATE INDEX idx_bulk_operations_created_by ON public.bulk_operations(created_by);