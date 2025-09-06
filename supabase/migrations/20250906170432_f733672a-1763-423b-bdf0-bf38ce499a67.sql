-- Update user role to lawyer so dashboard can see documents
UPDATE public.users 
SET role = 'lawyer' 
WHERE id = 1;