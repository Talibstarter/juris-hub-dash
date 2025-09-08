-- Add telegram_number column to cases table
ALTER TABLE public.cases 
ADD COLUMN telegram_number text;