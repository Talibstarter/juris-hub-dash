-- Allow lawyers to update questions when answering them
CREATE POLICY "Lawyers can update questions" 
ON public.questions 
FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['lawyer'::text, 'admin'::text]))
WITH CHECK (get_current_user_role() = ANY (ARRAY['lawyer'::text, 'admin'::text]));