-- Add missing fields to cases table for client management
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS application_type TEXT;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS type_of_stay TEXT;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS office TEXT;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS inspector TEXT;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS biometrics_date DATE;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS decision TEXT DEFAULT 'pending';
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'no';
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2);
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS review_date DATE;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS appeal BOOLEAN DEFAULT false;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS expedite_request BOOLEAN DEFAULT false;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE public.cases ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add indexes for better performance on commonly filtered fields
CREATE INDEX IF NOT EXISTS idx_cases_decision ON public.cases(decision);
CREATE INDEX IF NOT EXISTS idx_cases_office ON public.cases(office);
CREATE INDEX IF NOT EXISTS idx_cases_inspector ON public.cases(inspector);
CREATE INDEX IF NOT EXISTS idx_cases_client_name ON public.cases(client_name);
CREATE INDEX IF NOT EXISTS idx_cases_public_case_id ON public.cases(public_case_id);