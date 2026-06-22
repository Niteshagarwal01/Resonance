-- Migration: 004_liked_artists.sql
-- Description: Create liked_artists table for users to follow additional artists

CREATE TABLE IF NOT EXISTS public.liked_artists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    artist_id TEXT NOT NULL,
    artist_name TEXT NOT NULL,
    artist_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, artist_id)
);

-- RLS Policies
ALTER TABLE public.liked_artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own liked artists"
    ON public.liked_artists
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own liked artists"
    ON public.liked_artists
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own liked artists"
    ON public.liked_artists
    FOR DELETE
    USING (auth.uid() = user_id);
