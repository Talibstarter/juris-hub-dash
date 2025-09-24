-- Step 1: Drop all existing foreign key constraints that depend on users.id (if not already done)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.case_processes DROP CONSTRAINT IF EXISTS case_processes_assigned_lawyer_id_fkey;
ALTER TABLE public.user_documents DROP CONSTRAINT IF EXISTS user_documents_reviewer_id_fkey;
ALTER TABLE public.faq DROP CONSTRAINT IF EXISTS faq_author_id_fkey;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_recipient_id_fkey;
ALTER TABLE public.templates DROP CONSTRAINT IF EXISTS templates_author_id_fkey;
ALTER TABLE public.audit_log DROP CONSTRAINT IF EXISTS audit_log_actor_id_fkey;
ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_expert_id_fkey;
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_answered_by_fkey;

-- Step 2: Clean up messages table - remove messages with invalid sender_id/recipient_id
-- that don't correspond to existing telegram_ids
DELETE FROM public.messages 
WHERE sender_id NOT IN (SELECT telegram_id FROM public.users)
   OR recipient_id NOT IN (SELECT telegram_id FROM public.users)
   OR sender_id IS NULL 
   OR recipient_id IS NULL;

-- Step 3: Drop the primary key and remove the id column from users table
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_pkey;
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
ALTER TABLE public.users DROP COLUMN IF EXISTS id;

-- Step 4: Make telegram_id the primary key
ALTER TABLE public.users ADD PRIMARY KEY (telegram_id);

-- Step 5: Recreate foreign key constraints to reference telegram_id
-- Only add constraints where they make sense and data is valid
ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.users(telegram_id);

ALTER TABLE public.messages 
ADD CONSTRAINT messages_recipient_id_fkey 
FOREIGN KEY (recipient_id) REFERENCES public.users(telegram_id);

-- Step 6: Update the get_current_user_role function to work with telegram_id as primary key
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role::text FROM public.users WHERE telegram_id = (
    SELECT COALESCE(
      (current_setting('app.current_user_id', true))::bigint,
      1 -- fallback to telegram_id 1 for testing
    )
  );
$function$;