import { Header } from "@/components/shared/Header";
import { EventsPageClient } from "@/components/events/EventsPageClient";
import { isSupabaseConfigured, dataStore } from "@/lib/store";
import type { SentimentEvent, EventTweet, Sentiment } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Normalize related_tweets from Grok format to the app's EventTweet format.
 * Grok returns: { author, content, postedAt, likes, retweets, tier, url }
 * App expects: { author_handle, author_name, author_followers, text, text_zh, url, sentiment, impressions, posted_at, is_kol }
 */
function normalizeTweet(raw: Record<string, unknown>): EventTweet {
  // Already in correct format
  if ("author_handle" in raw && "text" in raw) {
    return raw as unknown as EventTweet;
  }

  // Grok format → normalize
  const author = String(raw.author || raw.author_handle || "unknown");
  const handle = author.startsWith("@") ? author.slice(1) : author;

  return {
    author_handle: handle,
    author_name: handle,
    author_followers: Number(raw.author_followers || 0),
    text: String(raw.content || raw.text || ""),
    text_zh: raw.text_zh ? String(raw.text_zh) : undefined,
    url: raw.url ? String(raw.url) : null,
    sentiment: (raw.sentiment as Sentiment) || "neutral",
    impressions: Number(raw.impressions || raw.likes || 0),
    posted_at: String(raw.postedAt || raw.posted_at || new Date().toISOString()),
    is_kol: raw.is_kol === true || Number(raw.tier) === 1,
  };
}

function normalizeEvents(events: Record<string, unknown>[]): SentimentEvent[] {
  return events.map((e) => ({
    ...e,
    related_tweets: Array.isArray(e.related_tweets)
      ? (e.related_tweets as Record<string, unknown>[]).map(normalizeTweet)
      : [],
  })) as unknown as SentimentEvent[];
}

async function getEvents() {
  if (isSupabaseConfigured()) {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = createServiceClient();

    const { data } = await supabase
      .from("events")
      .select("*")
      .in("status", ["active", "monitoring"])
      .order("created_at", { ascending: false });

    return normalizeEvents((data || []) as Record<string, unknown>[]);
  }

  return dataStore.getActiveEvents();
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <Header
        title="事件与推文"
        subtitle="Grok AI 检测到的舆情推文 · 按事件归类"
      />
      <EventsPageClient events={events} />
    </>
  );
}
