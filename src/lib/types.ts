export type Severity = "critical" | "high" | "medium" | "low";
export type AlertLevel = "green" | "yellow" | "red";
export type Sentiment = "positive" | "neutral" | "negative";
export type EventStatus = "active" | "resolved" | "monitoring";
export type SourceTier = 1 | 2;

export interface EventTweet {
  author_handle: string;
  author_name: string;
  author_followers: number;
  text: string;
  text_zh?: string;
  url: string | null;
  sentiment: Sentiment;
  impressions: number;
  posted_at: string;
  is_kol: boolean;
}

export interface SentimentEvent {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  is_new_event: boolean;
  official_response: boolean;
  source_tier: SourceTier;
  theme: string;
  first_detected_at: string;
  mention_count: number;
  impression_estimate: number;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  status: EventStatus;
  key_kols?: string[];
  related_tweets?: EventTweet[];
  created_at: string;
  updated_at: string;
}

export interface Mention {
  id: string;
  event_id: string | null;
  text: string;
  text_zh?: string;
  author: string;
  author_handle: string;
  author_followers: number;
  platform: string;
  url: string | null;
  country: string | null;
  sentiment: Sentiment;
  sentiment_score: number;
  impressions: number;
  source_tier: SourceTier;
  is_official_response: boolean;
  is_kol: boolean;
  created_at: string;
}

export interface KOLActivity {
  handle: string;
  name: string;
  followers: number;
  category: string;
  tweet_text: string;
  tweet_text_zh?: string;
  sentiment: Sentiment;
  impressions: number;
  posted_at: string;
  url: string | null;
}

export interface SentimentSnapshot {
  id: string;
  timestamp: string;
  total_mentions: number;
  total_impressions: number;
  total_reach: number;
  unique_authors: number;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  alert_level: AlertLevel;
  bnb_price: number | null;
  kol_mention_count: number;
  top_countries: Record<string, number>;
  top_urls: { url: string; count: number }[];
  top_kols: KOLActivity[];
}

export interface Report {
  id: string;
  title: string;
  time_range_start: string;
  time_range_end: string;
  keywords: string[];
  summary_text: string;
  executive_briefing: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface CompetitorSnapshot {
  id: string;
  timestamp: string;
  exchange_name: string;
  total_mentions: number;
  negative_pct: number;
  positive_pct: number;
  neutral_pct: number;
  alert_level: AlertLevel;
}

export interface MetricCardData {
  label: string;
  value: number;
  previousValue: number;
  format?: "number" | "percentage" | "compact";
}
