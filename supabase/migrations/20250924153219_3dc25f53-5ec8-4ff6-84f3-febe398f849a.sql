-- Enable Row Level Security on notification_templates table
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for notification_templates (lawyers and admins can manage templates)
CREATE POLICY "Lawyers can view notification templates" 
ON public.notification_templates 
FOR SELECT 
USING (get_current_user_role() = ANY (ARRAY['lawyer'::text, 'admin'::text]));

CREATE POLICY "Lawyers can insert notification templates" 
ON public.notification_templates 
FOR INSERT 
WITH CHECK (get_current_user_role() = ANY (ARRAY['lawyer'::text, 'admin'::text]));

CREATE POLICY "Lawyers can update notification templates" 
ON public.notification_templates 
FOR UPDATE 
USING (get_current_user_role() = ANY (ARRAY['lawyer'::text, 'admin'::text]));

CREATE POLICY "Lawyers can delete notification templates" 
ON public.notification_templates 
FOR DELETE 
USING (get_current_user_role() = ANY (ARRAY['lawyer'::text, 'admin'::text]));