-- Migration: 005_listening_history.sql
-- Description: Track listening history to calculate song completion percentage for DNA Evolution

DROP TABLE IF EXISTS public.listening_history;

CREATE TABLE public.listening_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    duration_played INT NOT NULL DEFAULT 0, -- in seconds
    total_duration INT NOT NULL, -- in seconds
    percentage_played FLOAT GENERATED ALWAYS AS (
        CASE WHEN total_duration > 0 THEN (duration_played::FLOAT / total_duration::FLOAT) ELSE 0 END
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast queries by user
CREATE INDEX IF NOT EXISTS listening_history_user_id_idx ON public.listening_history(user_id);
CREATE INDEX IF NOT EXISTS listening_history_created_at_idx ON public.listening_history(created_at DESC);

-- RLS Policies
ALTER TABLE public.listening_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own history"
    ON public.listening_history
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history"
    ON public.listening_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
