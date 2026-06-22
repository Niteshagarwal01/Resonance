-- Migration: Global Chat Persistence & Ephemeral Messages
-- Description: Creates the chat_messages table to store global and room chat messages.
-- It also sets up a cleanup function to automatically delete messages older than 24 hours, keeping the chat ephemeral.

-- 1. Create the table
DROP TABLE IF EXISTS chat_messages CASCADE;
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    avatar_url TEXT,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Setup Row Level Security (RLS)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read chat messages" ON chat_messages;
CREATE POLICY "Anyone can read chat messages" 
ON chat_messages FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert chat messages" ON chat_messages;
CREATE POLICY "Authenticated users can insert chat messages" 
ON chat_messages FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 3. Enable Realtime for the table so Supabase can broadcast inserts
alter publication supabase_realtime add table chat_messages;

-- 4. Setup a cron job (pg_cron) to delete old messages automatically 
-- Note: pg_cron must be enabled in your Supabase project settings for this to run automatically, 
-- but we will also filter them out via the frontend just in case!
-- (Optional, uncomment if you have pg_cron enabled)
-- select cron.schedule('cleanup_chat', '0 * * * *', $$
--   delete from chat_messages where created_at < now() - interval '24 hours';
-- $$);
