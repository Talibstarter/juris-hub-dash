-- Make legal-bot bucket public for easier access
UPDATE storage.buckets 
SET public = true 
WHERE id = 'legal-bot';

-- Drop the previous restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view files" ON storage.objects;
DROP POLICY IF EXISTS "Lawyers can view all files" ON storage.objects;

-- Create a simple policy that allows anyone to view files in legal-bot bucket
CREATE POLICY "Anyone can view legal-bot files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'legal-bot');