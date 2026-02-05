import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, dataStore } from "@/lib/store";
import type { EventTweet, Sentiment } from "@/lib/types";

/**
 * Normalize related_tweets from Grok format to the app's EventTweet format.
 */
function normalizeTweet(raw: Record<string, unknown>): EventTweet {
  if ("author_handle" in raw && "text" in raw) {
    return raw as unknown as EventTweet;
  }
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

function normalizeEvents(events: Record<string, unknown>[]): Record<string, unknown>[] {
  return events.map((e) => ({
    ...e,
    related_tweets: Array.isArray(e.related_tweets)
      ? (e.related_tweets as Record<string, unknown>[]).map(normalizeTweet)
      : [],
  }));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "active";

  if (isSupabaseConfigured()) {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = createServiceClient();

    const severity = searchParams.get("severity");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status !== "all") {
      query = query.eq("status", status);
    }
    if (severity) {
      query = query.eq("severity", severity);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(normalizeEvents((data || []) as Record<string, unknown>[]));
  }

  // Fallback: in-memory store
  let events = dataStore.events;
  if (status !== "all") {
    events = events.filter((e) => e.status === status);
  }
  events = events.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json(events);
}
