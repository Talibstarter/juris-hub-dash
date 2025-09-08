-- Add DELETE policy for lawyers to delete cases
CREATE POLICY "Lawyers can delete cases" 
ON public.cases 
FOR DELETE 
USING (get_current_user_role() = ANY (ARRAY['lawyer'::text, 'admin'::text]));