-- Migration: 006_liked_songs.sql
-- Description: Track explicit song likes

CREATE TABLE IF NOT EXISTS public.liked_songs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    thumbnail TEXT,
    duration TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- RLS Policies
ALTER TABLE public.liked_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own liked songs"
    ON public.liked_songs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own liked songs"
    ON public.liked_songs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own liked songs"
    ON public.liked_songs
    FOR DELETE
    USING (auth.uid() = user_id);
