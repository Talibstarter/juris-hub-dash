-- Add insert, update, and delete policies for processes table to allow document requirement management
CREATE POLICY "Anyone can insert processes" ON public.processes
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update processes" ON public.processes
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete processes" ON public.processes
FOR DELETE 
USING (true);