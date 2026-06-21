-- Phase 5: Resonance Database Schema Migration

-- 1. Create Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  age_range TEXT,
  avatar_url TEXT,
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Taste DNA Table
CREATE TABLE public.taste_dna (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  top_genres JSONB DEFAULT '[]'::jsonb,
  top_artists JSONB DEFAULT '[]'::jsonb,
  core_vibe TEXT,
  energy_level INTEGER DEFAULT 50,
  era_preference TEXT,
  discovery_rate INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id) -- One DNA profile per user
);

-- 3. Create Playlists Table
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Playlist Tracks Table
CREATE TABLE public.playlist_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE,
  youtube_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT,
  thumbnail_url TEXT,
  duration TEXT,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(playlist_id, youtube_id) -- Prevent duplicate tracks in the same playlist
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.taste_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles: Anyone can view public profiles, but users can only update their own.
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Taste DNA: Users can only view and update their own DNA.
CREATE POLICY "Users can view own Taste DNA" ON public.taste_dna FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own Taste DNA" ON public.taste_dna FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own Taste DNA" ON public.taste_dna FOR UPDATE USING (auth.uid() = user_id);

-- Playlists: Anyone can view public playlists. Users manage their own.
CREATE POLICY "Public playlists are viewable by everyone" ON public.playlists FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert own playlists" ON public.playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own playlists" ON public.playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own playlists" ON public.playlists FOR DELETE USING (auth.uid() = user_id);

-- Playlist Tracks: Anyone can view tracks in public playlists. Only playlist owners can manage tracks.
CREATE POLICY "Tracks in public playlists are viewable by everyone" ON public.playlist_tracks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_tracks.playlist_id AND (is_public = true OR user_id = auth.uid()))
);
CREATE POLICY "Users can manage tracks in own playlists" ON public.playlist_tracks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.playlists WHERE id = playlist_tracks.playlist_id AND user_id = auth.uid())
);

-- Trigger: Automatically create a Profile when a new Auth User signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
