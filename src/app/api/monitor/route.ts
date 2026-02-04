import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, dataStore } from "@/lib/store";
import {
  searchBinanceMentions,
  searchCompetitorMentions,
  detectEvents,
} from "@/lib/grok";
import { calculateAlertLevel, determineSourceTier } from "@/lib/utils";
import { BNB_PRICE_URL, KOL_FOLLOWER_THRESHOLD } from "@/lib/constants";
import { subMinutes, formatISO } from "date-fns";
import type { KOLActivity } from "@/lib/types";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isManual = searchParams.get("manual") === "true";

  // Verify auth for cron calls (skip for manual frontend trigger)
  if (!isManual) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Check if Grok API key is configured
  if (!process.env.XAI_API_KEY || process.env.XAI_API_KEY === "your-xai-api-key") {
    return NextResponse.json(
      { error: "XAI_API_KEY 未配置", mentions: 0, events: 0 },
      { status: 400 }
    );
  }

  const selectedModel = searchParams.get("model") || undefined;

  const now = new Date();
  const thirtyMinAgo = subMinutes(now, 30);
  const fromDate = formatISO(thirtyMinAgo, { representation: "date" });
  const toDate = formatISO(now, { representation: "date" });

  try {
    // 1. Search Binance mentions via Grok (prioritizing KOL/大V tweets)
    const { structured, rawSummary } = await searchBinanceMentions(fromDate, toDate, selectedModel);

    // 2. Process mentions — mark KOLs
    const mentionRows = structured.mentions.map((m) => ({
      id: crypto.randomUUID(),
      event_id: null,
      text: m.text,
      author: m.author,
      author_handle: m.author_handle,
      author_followers: m.author_followers,
      platform: "twitter" as const,
      url: m.url || null,
      country: m.country,
      sentiment: m.sentiment,
      sentiment_score: m.sentiment_score,
      impressions: m.impressions,
      source_tier: determineSourceTier(m.author_followers, m.url),
      is_official_response: m.is_official_response,
      is_kol: m.is_kol || m.author_followers >= KOL_FOLLOWER_THRESHOLD,
      created_at: m.posted_at || now.toISOString(),
    }));

    // 3. Extract KOL activities for the snapshot
    const kolMentions = mentionRows.filter((m) => m.is_kol);
    const kolActivities: KOLActivity[] = kolMentions.map((m) => ({
      handle: m.author_handle,
      name: m.author,
      followers: m.author_followers,
      category: "加密KOL",
      tweet_text: m.text,
      sentiment: m.sentiment,
      impressions: m.impressions,
      posted_at: m.created_at,
      url: m.url,
    }));

    // 4. Calculate aggregates
    const totalMentions = structured.total_estimated_mentions || mentionRows.length;
    const sentiments = mentionRows.reduce(
      (acc, m) => { acc[m.sentiment]++; return acc; },
      { positive: 0, neutral: 0, negative: 0 } as Record<string, number>
    );
    const total = mentionRows.length || 1;
    const positivePct = Math.round((sentiments.positive / total) * 100);
    const negativePct = Math.round((sentiments.negative / total) * 100);
    const neutralPct = 100 - positivePct - negativePct;

    const hasTier1 = mentionRows.some((m) => m.source_tier === 1);
    // KOL posts with negative sentiment increase alert severity
    const hasNegativeKOL = kolMentions.some((m) => m.sentiment === "negative");
    const alertLevel = calculateAlertLevel(
      negativePct,
      hasTier1 || hasNegativeKOL,
      totalMentions
    );

    // 5. Fetch BNB price
    let bnbPrice: number | null = null;
    try {
      const priceRes = await fetch(BNB_PRICE_URL);
      const priceData = await priceRes.json();
      bnbPrice = priceData?.binancecoin?.usd ?? null;
    } catch {
      // continue without price
    }

    // 6. Aggregate countries and URLs
    const countries: Record<string, number> = {};
    mentionRows.forEach((m) => {
      if (m.country) countries[m.country] = (countries[m.country] || 0) + 1;
    });

    const urlCounts: Record<string, number> = {};
    mentionRows.forEach((m) => {
      if (m.url) urlCounts[m.url] = (urlCounts[m.url] || 0) + 1;
    });
    const topUrls = Object.entries(urlCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([url, count]) => ({ url, count }));

    // 7. Store snapshot
    const snapshot = {
      timestamp: now.toISOString(),
      total_mentions: totalMentions,
      total_impressions: mentionRows.reduce((sum, m) => sum + m.impressions, 0),
      total_reach: mentionRows.reduce((sum, m) => sum + m.impressions * 2, 0),
      unique_authors: new Set(mentionRows.map((m) => m.author)).size,
      positive_pct: positivePct,
      neutral_pct: neutralPct,
      negative_pct: negativePct,
      alert_level: alertLevel,
      bnb_price: bnbPrice,
      kol_mention_count: structured.kol_count || kolMentions.length,
      top_countries: countries,
      top_urls: topUrls,
      top_kols: kolActivities.sort((a, b) => b.followers - a.followers).slice(0, 10),
    };

    if (isSupabaseConfigured()) {
      const { createServiceClient } = await import("@/lib/supabase/server");
      const supabase = createServiceClient();
      await supabase.from("mentions").insert(mentionRows);
      await supabase.from("sentiment_snapshots").insert(snapshot);
    } else {
      dataStore.addMentions(mentionRows);
      dataStore.addSnapshot(snapshot);
    }

    // 8. Detect events (KOL-driven event detection)
    const existingTitles = dataStore.getActiveEvents().map((e) => e.title);
    const detectedEvents = await detectEvents(
      mentionRows.map((m) => ({
        text: m.text,
        author: m.author,
        author_handle: m.author_handle,
        sentiment: m.sentiment,
        impressions: m.impressions,
        is_kol: m.is_kol,
        author_followers: m.author_followers,
      })),
      existingTitles
    );

    for (const evt of detectedEvents.events) {
      const officialResponse = mentionRows.some((m) => m.is_official_response);
      const eventData = {
        title: evt.title,
        description: evt.description,
        severity: evt.severity as any,
        is_new_event: evt.is_new_event,
        official_response: officialResponse,
        source_tier: (hasTier1 ? 1 : 2) as 1 | 2,
        theme: evt.theme,
        first_detected_at: now.toISOString(),
        mention_count: evt.mention_count,
        impression_estimate: evt.impression_estimate,
        positive_pct: evt.positive_pct,
        neutral_pct: evt.neutral_pct,
        negative_pct: evt.negative_pct,
        status: "active" as const,
      };

      if (isSupabaseConfigured()) {
        const { createServiceClient } = await import("@/lib/supabase/server");
        const supabase = createServiceClient();
        await supabase.from("events").insert(eventData);
      } else {
        dataStore.addEvent(eventData);
      }
    }

    // 9. Monitor competitor
    try {
      const competitor = await searchCompetitorMentions("Coinbase", fromDate, toDate);
      const compAlertLevel = calculateAlertLevel(competitor.negative_pct, false, competitor.total_mentions);
      const compData = {
        timestamp: now.toISOString(),
        exchange_name: "coinbase",
        total_mentions: competitor.total_mentions,
        negative_pct: competitor.negative_pct,
        positive_pct: competitor.positive_pct,
        neutral_pct: competitor.neutral_pct,
        alert_level: compAlertLevel,
      };

      if (isSupabaseConfigured()) {
        const { createServiceClient } = await import("@/lib/supabase/server");
        const supabase = createServiceClient();
        await supabase.from("competitor_snapshots").insert(compData);
      } else {
        dataStore.addCompetitorSnapshot(compData);
      }
    } catch {
      // competitor monitoring not critical
    }

    return NextResponse.json({
      success: true,
      mentions: totalMentions,
      kol_mentions: structured.kol_count || kolMentions.length,
      events: detectedEvents.events.length,
      alertLevel,
      kol_summary: structured.kol_summary,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("监控任务失败:", error);
    return NextResponse.json(
      { error: "监控失败: " + String(error), mentions: 0, events: 0 },
      { status: 500 }
    );
  }
}
