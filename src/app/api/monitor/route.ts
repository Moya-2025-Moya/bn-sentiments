import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, dataStore } from "@/lib/store";
import { searchBinanceMentions, tagEvents, searchAllCompetitors } from "@/lib/grok";
import { calculateAlertLevel, determineSourceTier } from "@/lib/utils";
import { BNB_PRICE_URL, KOL_FOLLOWER_THRESHOLD } from "@/lib/constants";
import { subMinutes, formatISO } from "date-fns";
import type { KOLActivity } from "@/lib/types";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const isManual = searchParams.get("manual") === "true";
  const selectedModel = searchParams.get("model") || undefined;

  if (!isManual) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!process.env.XAI_API_KEY || process.env.XAI_API_KEY === "your-xai-api-key") {
    return NextResponse.json(
      { error: "XAI_API_KEY 未配置", mentions: 0, events: 0 },
      { status: 400 }
    );
  }

  const now = new Date();
  const thirtyMinAgo = subMinutes(now, 30);
  const fromDate = formatISO(thirtyMinAgo, { representation: "date" });
  const toDate = formatISO(now, { representation: "date" });

  try {
    // Step 1+2: Search & parse ALL posts via Grok SOP
    const { posts, totalFound, rawSummary } = await searchBinanceMentions(
      fromDate,
      toDate,
      selectedModel
    );

    // System-side scoring: compute credibility score for each post
    const scoredPosts = posts.map((p, i) => ({
      id: crypto.randomUUID(),
      index: i,
      ...p,
      author_handle: p.author_handle.replace(/^@/, ""),
      source_tier: determineSourceTier(p.author_followers, p.url),
      is_kol: p.is_kol || p.author_followers >= KOL_FOLLOWER_THRESHOLD,
      // Credibility score: weighted by followers, engagement, KOL status
      credibility_score:
        Math.min(1, p.author_followers / 1_000_000) * 0.3 +
        Math.min(1, p.impressions / 500_000) * 0.2 +
        Math.min(1, (p.likes + p.retweets * 2) / 10_000) * 0.2 +
        (p.is_kol ? 0.2 : 0) +
        (p.is_exchange_account ? 0.1 : 0),
      created_at: p.posted_at || now.toISOString(),
    }));

    // Build mention rows for storage
    const mentionRows = scoredPosts.map((p) => ({
      id: p.id,
      event_id: null,
      text: p.text,
      text_zh: p.text_zh,
      author: p.author_name,
      author_handle: p.author_handle,
      author_followers: p.author_followers,
      platform: "twitter" as const,
      url: p.url,
      country: p.country,
      sentiment: p.sentiment,
      sentiment_score: p.sentiment_score,
      impressions: p.impressions,
      source_tier: p.source_tier,
      is_official_response: p.is_official_response,
      is_kol: p.is_kol,
      created_at: p.created_at,
    }));

    // Aggregates
    const total = scoredPosts.length || 1;
    const sentiments = { positive: 0, neutral: 0, negative: 0 };
    scoredPosts.forEach((p) => sentiments[p.sentiment]++);
    const positivePct = Math.round((sentiments.positive / total) * 100);
    const negativePct = Math.round((sentiments.negative / total) * 100);
    const neutralPct = 100 - positivePct - negativePct;

    const kolPosts = scoredPosts.filter((p) => p.is_kol);
    const hasTier1 = scoredPosts.some((p) => p.source_tier === 1);
    const hasNegativeKOL = kolPosts.some((p) => p.sentiment === "negative");
    const alertLevel = calculateAlertLevel(
      negativePct,
      hasTier1 || hasNegativeKOL,
      totalFound
    );

    // BNB price
    let bnbPrice: number | null = null;
    try {
      const priceRes = await fetch(BNB_PRICE_URL);
      const priceData = await priceRes.json();
      bnbPrice = priceData?.binancecoin?.usd ?? null;
    } catch {}

    // KOL activities for dashboard
    const kolActivities: KOLActivity[] = kolPosts
      .sort((a, b) => b.author_followers - a.author_followers)
      .slice(0, 10)
      .map((p) => ({
        handle: p.author_handle,
        name: p.author_name,
        followers: p.author_followers,
        category: p.is_exchange_account ? "交易所" : "加密KOL",
        tweet_text: p.text,
        tweet_text_zh: p.text_zh,
        sentiment: p.sentiment,
        impressions: p.impressions,
        posted_at: p.created_at,
        url: p.url,
      }));

    // Countries & URLs
    const countries: Record<string, number> = {};
    scoredPosts.forEach((p) => {
      if (p.country) countries[p.country] = (countries[p.country] || 0) + 1;
    });
    const urlCounts: Record<string, number> = {};
    scoredPosts.forEach((p) => {
      if (p.url) urlCounts[p.url] = (urlCounts[p.url] || 0) + 1;
    });
    const topUrls = Object.entries(urlCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([url, count]) => ({ url, count }));

    // Store snapshot
    const snapshot = {
      timestamp: now.toISOString(),
      total_mentions: totalFound,
      total_impressions: scoredPosts.reduce((s, p) => s + p.impressions, 0),
      total_reach: scoredPosts.reduce((s, p) => s + p.impressions * 2, 0),
      unique_authors: new Set(scoredPosts.map((p) => p.author_handle)).size,
      positive_pct: positivePct,
      neutral_pct: neutralPct,
      negative_pct: negativePct,
      alert_level: alertLevel,
      bnb_price: bnbPrice,
      kol_mention_count: kolPosts.length,
      top_countries: countries,
      top_urls: topUrls,
      top_kols: kolActivities,
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

    // Step 3: Tag events
    let existingTitles: string[] = [];
    if (isSupabaseConfigured()) {
      const { createServiceClient } = await import("@/lib/supabase/server");
      const supabase = createServiceClient();
      const { data: existingEvents } = await supabase
        .from("events")
        .select("title")
        .in("status", ["active", "monitoring"]);
      existingTitles = (existingEvents || []).map((e: { title: string }) => e.title);
    } else {
      existingTitles = dataStore.getActiveEvents().map((e) => e.title);
    }
    const tagResult = await tagEvents(scoredPosts, existingTitles);

    for (const evt of tagResult.events) {
      const eventPosts = evt.post_indices
        .filter((i) => i < scoredPosts.length)
        .map((i) => scoredPosts[i]);
      const evtSentiments = { positive: 0, neutral: 0, negative: 0 };
      eventPosts.forEach((p) => evtSentiments[p.sentiment]++);
      const evtTotal = eventPosts.length || 1;

      const eventData = {
        title: evt.title,
        description: evt.description,
        severity: evt.severity as any,
        is_new_event: evt.is_new_event,
        official_response: eventPosts.some((p) => p.is_official_response),
        source_tier: (eventPosts.some((p) => p.source_tier === 1) ? 1 : 2) as 1 | 2,
        theme: evt.theme,
        first_detected_at: now.toISOString(),
        mention_count: eventPosts.length,
        impression_estimate: eventPosts.reduce((s, p) => s + p.impressions, 0),
        positive_pct: Math.round((evtSentiments.positive / evtTotal) * 100),
        neutral_pct: Math.round((evtSentiments.neutral / evtTotal) * 100),
        negative_pct: Math.round((evtSentiments.negative / evtTotal) * 100),
        status: "active" as const,
        key_kols: [...new Set(eventPosts.filter((p) => p.is_kol).map((p) => p.author_handle))],
        related_tweets: eventPosts.slice(0, 10).map((p) => ({
          author_handle: p.author_handle,
          author_name: p.author_name,
          author_followers: p.author_followers,
          text: p.text,
          text_zh: p.text_zh,
          url: p.url,
          sentiment: p.sentiment,
          impressions: p.impressions,
          posted_at: p.created_at,
          is_kol: p.is_kol,
        })),
      };

      if (isSupabaseConfigured()) {
        const { createServiceClient } = await import("@/lib/supabase/server");
        const supabase = createServiceClient();
        await supabase.from("events").insert(eventData);
      } else {
        dataStore.addEvent(eventData);
      }
    }

    // Competitor monitoring (all exchanges)
    try {
      const competitors = await searchAllCompetitors(fromDate, toDate, selectedModel);
      for (const comp of competitors) {
        const compData = {
          timestamp: now.toISOString(),
          exchange_name: comp.name.toLowerCase(),
          total_mentions: comp.total_mentions,
          negative_pct: comp.negative_pct,
          positive_pct: comp.positive_pct,
          neutral_pct: comp.neutral_pct,
          alert_level: calculateAlertLevel(comp.negative_pct, false, comp.total_mentions),
        };
        if (isSupabaseConfigured()) {
          const { createServiceClient } = await import("@/lib/supabase/server");
          const supabase = createServiceClient();
          await supabase.from("competitor_snapshots").insert(compData);
        } else {
          dataStore.addCompetitorSnapshot(compData);
        }
      }
    } catch {}

    return NextResponse.json({
      success: true,
      total_posts: totalFound,
      parsed_posts: scoredPosts.length,
      kol_posts: kolPosts.length,
      events: tagResult.events.length,
      alertLevel,
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
