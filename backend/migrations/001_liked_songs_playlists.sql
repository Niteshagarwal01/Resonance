-- Run this in Supabase SQL Editor
-- Creates liked_songs, playlists, and playlist_tracks tables

-- ── Liked Songs ─────────────────────────────────────────────────────────────
create table if not exists liked_songs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  track_id      text not null,
  track_title   text,
  track_artist  text,
  track_thumbnail text,
  track_duration  text,
  created_at    timestamptz default now(),
  unique (user_id, track_id)
);

alter table liked_songs enable row level security;

create policy "Users can view own liked songs"
  on liked_songs for select using (auth.uid() = user_id);

create policy "Users can insert own liked songs"
  on liked_songs for insert with check (auth.uid() = user_id);

create policy "Users can delete own liked songs"
  on liked_songs for delete using (auth.uid() = user_id);


-- ── Playlists ────────────────────────────────────────────────────────────────
create table if not exists playlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  cover_url   text,
  created_at  timestamptz default now()
);

alter table playlists enable row level security;

create policy "Users can view own playlists"
  on playlists for select using (auth.uid() = user_id);

create policy "Users can insert own playlists"
  on playlists for insert with check (auth.uid() = user_id);

create policy "Users can update own playlists"
  on playlists for update using (auth.uid() = user_id);

create policy "Users can delete own playlists"
  on playlists for delete using (auth.uid() = user_id);


-- ── Playlist Tracks ──────────────────────────────────────────────────────────
create table if not exists playlist_tracks (
  id              uuid primary key default gen_random_uuid(),
  playlist_id     uuid not null references playlists(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  track_id        text not null,
  track_title     text,
  track_artist    text,
  track_thumbnail text,
  track_duration  text,
  position        integer default 0,
  added_at        timestamptz default now(),
  unique (playlist_id, track_id)
);

alter table playlist_tracks enable row level security;

create policy "Users can view own playlist tracks"
  on playlist_tracks for select using (auth.uid() = user_id);

create policy "Users can insert own playlist tracks"
  on playlist_tracks for insert with check (auth.uid() = user_id);

create policy "Users can delete own playlist tracks"
  on playlist_tracks for delete using (auth.uid() = user_id);
