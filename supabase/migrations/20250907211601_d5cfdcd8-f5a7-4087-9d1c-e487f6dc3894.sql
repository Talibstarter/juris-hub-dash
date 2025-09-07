-- Add RLS policy to allow lawyers/admins to update cases
CREATE POLICY "Lawyers can update cases" 
ON public.cases 
FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['lawyer'::text, 'admin'::text]))
WITH CHECK (get_current_user_role() = ANY (ARRAY['lawyer'::text, 'admin'::text]));