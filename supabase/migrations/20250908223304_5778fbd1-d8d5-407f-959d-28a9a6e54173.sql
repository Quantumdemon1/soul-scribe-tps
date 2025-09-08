-- Enable leaked password protection
UPDATE auth.config 
SET password_settings = jsonb_set(
  COALESCE(password_settings, '{}'::jsonb),
  '{enable_leaked_password_protection}',
  'true'::jsonb
);

-- Set minimum password length (if not already set)
UPDATE auth.config 
SET password_settings = jsonb_set(
  COALESCE(password_settings, '{}'::jsonb),
  '{min_length}',
  '8'::jsonb
) 
WHERE password_settings->>'min_length' IS NULL;