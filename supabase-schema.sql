-- High Dive Playlist Database Schema
-- Run this in the Supabase SQL Editor

-- Playlists table
CREATE TABLE playlists (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  credit_name TEXT,              -- display name (defaults to contact_name if blank)
  description TEXT DEFAULT '',
  mood_vibe TEXT DEFAULT '',     -- "when/where would you play it, what should people feel?"
  spotify_link TEXT DEFAULT '',
  apple_music_link TEXT DEFAULT '',
  tidal_link TEXT DEFAULT '',
  tracks INTEGER,
  runtime TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT
);

-- Invite tokens table
CREATE TABLE invite_tokens (
  id SERIAL PRIMARY KEY,
  token TEXT UNIQUE NOT NULL,
  label TEXT DEFAULT '',        -- e.g. "Bart's circle", "Spring 2026 batch"
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the first invite token
INSERT INTO invite_tokens (token, label)
VALUES ('hd-2026-invite', 'Default invite link');

-- Index for fast lookups
CREATE INDEX idx_playlists_status ON playlists(status);
CREATE INDEX idx_invite_tokens_token ON invite_tokens(token);

-- Enable Row Level Security
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_tokens ENABLE ROW LEVEL SECURITY;

-- Allow the service_role key full access (used by Netlify functions)
-- The anon key gets no direct access — all access goes through serverless functions
CREATE POLICY "Service role full access on playlists" ON playlists
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on invite_tokens" ON invite_tokens
  FOR ALL USING (auth.role() = 'service_role');
