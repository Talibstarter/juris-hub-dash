-- Fix the search path issue for the existing set_updated_at function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin 
  new.updated_at = now(); 
  return new; 
end $$;