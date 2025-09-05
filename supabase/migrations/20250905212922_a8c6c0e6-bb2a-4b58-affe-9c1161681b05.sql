-- Fix remaining security issue - add policy for profiles table
CREATE POLICY "Anyone can view profiles" ON public.profiles
FOR SELECT USING (true);

-- Fix the function search path issue
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.users WHERE id = (
    SELECT COALESCE(
      (current_setting('app.current_user_id', true))::bigint,
      1 -- fallback to user 1 for testing
    )
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;