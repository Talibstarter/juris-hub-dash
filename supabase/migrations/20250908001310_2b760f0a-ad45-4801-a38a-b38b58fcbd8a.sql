-- Add RLS policy to allow lawyers/admins to insert new cases
CREATE POLICY "Lawyers can insert cases" 
ON public.cases 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['lawyer'::text, 'admin'::text]));