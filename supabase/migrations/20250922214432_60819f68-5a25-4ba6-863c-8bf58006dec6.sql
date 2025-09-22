-- Enable realtime for questions table
ALTER TABLE public.questions REPLICA IDENTITY FULL;

-- Add questions table to realtime publication
ALTER publication supabase_realtime ADD TABLE public.questions;