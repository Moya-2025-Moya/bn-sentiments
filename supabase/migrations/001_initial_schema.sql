-- Binance Social Sentiment Monitor - Database Schema
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Events table - FUD events detected
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  is_new_event BOOLEAN DEFAULT true,
  official_response BOOLEAN DEFAULT false,
  source_tier INTEGER NOT NULL CHECK (source_tier IN (1, 2)),
  theme TEXT NOT NULL,
  first_detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mention_count INTEGER DEFAULT 0,
  impression_estimate BIGINT DEFAULT 0,
  positive_pct REAL DEFAULT 0,
  neutral_pct REAL DEFAULT 0,
  negative_pct REAL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'monitoring')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mentions table - Individual tweets
CREATE TABLE mentions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  author_followers INTEGER DEFAULT 0,
  platform TEXT NOT NULL DEFAULT 'twitter',
  url TEXT,
  country TEXT,
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score REAL NOT NULL CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  impressions BIGINT DEFAULT 0,
  source_tier INTEGER NOT NULL CHECK (source_tier IN (1, 2)),
  is_official_response BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sentiment snapshots - 30-min aggregated data
CREATE TABLE sentiment_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_mentions INTEGER DEFAULT 0,
  total_impressions BIGINT DEFAULT 0,
  total_reach BIGINT DEFAULT 0,
  unique_authors INTEGER DEFAULT 0,
  positive_pct REAL DEFAULT 0,
  neutral_pct REAL DEFAULT 0,
  negative_pct REAL DEFAULT 0,
  alert_level TEXT NOT NULL DEFAULT 'green' CHECK (alert_level IN ('green', 'yellow', 'red')),
  bnb_price REAL,
  top_countries JSONB DEFAULT '{}',
  top_urls JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  time_range_start TIMESTAMPTZ NOT NULL,
  time_range_end TIMESTAMPTZ NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  summary_text TEXT,
  executive_briefing TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Competitor snapshots
CREATE TABLE competitor_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exchange_name TEXT NOT NULL,
  total_mentions INTEGER DEFAULT 0,
  negative_pct REAL DEFAULT 0,
  positive_pct REAL DEFAULT 0,
  neutral_pct REAL DEFAULT 0,
  alert_level TEXT NOT NULL DEFAULT 'green' CHECK (alert_level IN ('green', 'yellow', 'red')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mentions_event_id ON mentions(event_id);
CREATE INDEX idx_mentions_created_at ON mentions(created_at DESC);
CREATE INDEX idx_mentions_sentiment ON mentions(sentiment);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_severity ON events(severity);
CREATE INDEX idx_events_created_at ON events(created_at DESC);
CREATE INDEX idx_snapshots_timestamp ON sentiment_snapshots(timestamp DESC);
CREATE INDEX idx_competitor_timestamp ON competitor_snapshots(timestamp DESC);
CREATE INDEX idx_competitor_exchange ON competitor_snapshots(exchange_name);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE mentions;
ALTER PUBLICATION supabase_realtime ADD TABLE sentiment_snapshots;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
