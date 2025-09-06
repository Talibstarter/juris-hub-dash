-- Fix RLS policies for document management

-- Allow users to insert their own documents
CREATE POLICY "Users can insert their own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (true); -- Allow any authenticated user to insert documents

-- Allow users to insert their own user_documents
CREATE POLICY "Users can insert user documents" 
ON public.user_documents 
FOR INSERT 
WITH CHECK (true); -- Allow any authenticated user to link documents to cases

-- Allow lawyers/admins to update document status
CREATE POLICY "Lawyers can update user documents" 
ON public.user_documents 
FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['lawyer'::text, 'admin'::text]))
WITH CHECK (get_current_user_role() = ANY (ARRAY['lawyer'::text, 'admin'::text]));

-- Allow users to view their own documents (clients can see their own docs)
CREATE POLICY "Users can view documents in their cases" 
ON public.user_documents 
FOR SELECT 
USING (
  -- Lawyers/admins can see all
  get_current_user_role() = ANY (ARRAY['lawyer'::text, 'admin'::text])
  OR
  -- Users can see documents in their own cases
  EXISTS (
    SELECT 1 FROM public.cases 
    WHERE cases.id = user_documents.case_id 
    AND cases.user_id = (current_setting('app.current_user_id', true))::bigint
  )
);