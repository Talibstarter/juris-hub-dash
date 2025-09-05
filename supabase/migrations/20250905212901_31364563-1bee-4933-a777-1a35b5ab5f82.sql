-- Enable RLS on all tables and create proper policies
-- First, let's create a function to check user roles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.users WHERE id = (
    SELECT COALESCE(
      (current_setting('app.current_user_id', true))::bigint,
      1 -- fallback to user 1 for testing
    )
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Enable RLS on all tables that don't have it
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_lookup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all users" ON public.users
FOR SELECT USING (true);

-- Create policies for FAQ (public read access)
CREATE POLICY "Anyone can view FAQ" ON public.faq
FOR SELECT USING (true);

-- Create policies for processes (public read access)
CREATE POLICY "Anyone can view processes" ON public.processes
FOR SELECT USING (true);

-- Create policies for cases
CREATE POLICY "Lawyers can view all cases" ON public.cases
FOR SELECT USING (get_current_user_role() IN ('lawyer', 'admin'));

CREATE POLICY "Clients can view their own cases" ON public.cases
FOR SELECT USING (user_id = (current_setting('app.current_user_id', true))::bigint);

-- Create policies for questions
CREATE POLICY "Lawyers can view all questions" ON public.questions
FOR SELECT USING (get_current_user_role() IN ('lawyer', 'admin'));

CREATE POLICY "Clients can view their own questions" ON public.questions
FOR SELECT USING (user_id = (current_setting('app.current_user_id', true))::bigint);

-- Create policies for documents
CREATE POLICY "Lawyers can view all documents" ON public.documents
FOR SELECT USING (get_current_user_role() IN ('lawyer', 'admin'));

-- Create policies for messages
CREATE POLICY "Users can view their own messages" ON public.messages
FOR SELECT USING (
  sender_id = (current_setting('app.current_user_id', true))::bigint OR
  recipient_id = (current_setting('app.current_user_id', true))::bigint OR
  get_current_user_role() IN ('lawyer', 'admin')
);

-- Create policies for notes
CREATE POLICY "Lawyers can view all notes" ON public.notes
FOR SELECT USING (get_current_user_role() IN ('lawyer', 'admin'));

-- Create policies for user_documents
CREATE POLICY "Lawyers can view all user documents" ON public.user_documents
FOR SELECT USING (get_current_user_role() IN ('lawyer', 'admin'));

-- Create policies for other tables (allowing lawyers/admins to view all)
CREATE POLICY "Lawyers can view audit log" ON public.audit_log
FOR SELECT USING (get_current_user_role() IN ('lawyer', 'admin'));

CREATE POLICY "Lawyers can view case lookup" ON public.case_lookup
FOR SELECT USING (get_current_user_role() IN ('lawyer', 'admin'));

CREATE POLICY "Lawyers can view case processes" ON public.case_processes
FOR SELECT USING (get_current_user_role() IN ('lawyer', 'admin'));

CREATE POLICY "Lawyers can view templates" ON public.templates
FOR SELECT USING (get_current_user_role() IN ('lawyer', 'admin'));