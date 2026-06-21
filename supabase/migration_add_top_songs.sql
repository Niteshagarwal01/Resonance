-- Run this in Supabase SQL Editor to add the top_songs column to the existing table.
ALTER TABLE public.taste_dna ADD COLUMN IF NOT EXISTS top_songs JSONB DEFAULT '[]'::jsonb;
