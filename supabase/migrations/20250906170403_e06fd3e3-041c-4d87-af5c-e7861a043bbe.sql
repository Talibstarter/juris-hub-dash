-- Update user role to admin so dashboard can see documents
UPDATE public.users 
SET role = 'admin' 
WHERE id = 1;