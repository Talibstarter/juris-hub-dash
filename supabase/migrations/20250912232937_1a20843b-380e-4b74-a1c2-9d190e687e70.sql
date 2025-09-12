-- Add multilingual columns to the FAQ table
ALTER TABLE public.faq 
ADD COLUMN IF NOT EXISTS question_pl TEXT,
ADD COLUMN IF NOT EXISTS answer_pl TEXT,
ADD COLUMN IF NOT EXISTS question_ru TEXT,
ADD COLUMN IF NOT EXISTS answer_ru TEXT;