-- Run this if you already ran 001_initial_schema.sql
-- Adds columns that the application now requires

-- Events: add key_kols and related_tweets
ALTER TABLE events ADD COLUMN IF NOT EXISTS key_kols TEXT[] DEFAULT '{}';
ALTER TABLE events ADD COLUMN IF NOT EXISTS related_tweets JSONB DEFAULT '[]';

-- Mentions: add text_zh, author_handle, is_kol
ALTER TABLE mentions ADD COLUMN IF NOT EXISTS text_zh TEXT;
ALTER TABLE mentions ADD COLUMN IF NOT EXISTS author_handle TEXT NOT NULL DEFAULT '';
ALTER TABLE mentions ADD COLUMN IF NOT EXISTS is_kol BOOLEAN DEFAULT false;

-- Sentiment snapshots: add kol_mention_count, top_kols
ALTER TABLE sentiment_snapshots ADD COLUMN IF NOT EXISTS kol_mention_count INTEGER DEFAULT 0;
ALTER TABLE sentiment_snapshots ADD COLUMN IF NOT EXISTS top_kols JSONB DEFAULT '[]';
