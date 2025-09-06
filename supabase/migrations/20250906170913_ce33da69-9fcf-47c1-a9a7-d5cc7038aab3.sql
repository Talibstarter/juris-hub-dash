-- Allow authenticated users to view files in legal-bot bucket
CREATE POLICY "Authenticated users can view files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'legal-bot' 
  AND auth.role() = 'authenticated'
);

-- Allow lawyers/admins to view all files
CREATE POLICY "Lawyers can view all files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'legal-bot' 
  AND (
    get_current_user_role() = ANY (ARRAY['lawyer'::text, 'admin'::text])
    OR auth.role() = 'authenticated'
  )
);