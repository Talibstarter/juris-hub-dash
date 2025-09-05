-- Add insert and delete policies for users table to allow client management
CREATE POLICY "Anyone can insert users" ON public.users
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can delete users" ON public.users
FOR DELETE 
USING (true);

CREATE POLICY "Anyone can update users" ON public.users
FOR UPDATE 
USING (true);