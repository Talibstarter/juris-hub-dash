-- Add insert policies for FAQ table to allow adding new FAQs
CREATE POLICY "Anyone can insert FAQ" ON public.faq
FOR INSERT 
WITH CHECK (true);

-- Add update and delete policies for FAQ management
CREATE POLICY "Anyone can update FAQ" ON public.faq
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete FAQ" ON public.faq
FOR DELETE 
USING (true);