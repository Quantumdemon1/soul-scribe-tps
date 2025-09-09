-- Harden validate_username with SECURITY DEFINER and fixed search_path
CREATE OR REPLACE FUNCTION public.validate_username(username_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Check length (3-30 characters)
  IF LENGTH(username_input) < 3 OR LENGTH(username_input) > 30 THEN
    RETURN FALSE;
  END IF;
  
  -- Check format (alphanumeric and underscores only)
  IF username_input !~ '^[a-zA-Z0-9_]+$' THEN
    RETURN FALSE;
  END IF;
  
  -- Check availability (bypass RLS via SECURITY DEFINER)
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = username_input) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Ensure execute is allowed to authenticated users
GRANT EXECUTE ON FUNCTION public.validate_username(TEXT) TO authenticated;