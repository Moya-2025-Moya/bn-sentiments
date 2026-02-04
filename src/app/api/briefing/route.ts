import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, dataStore } from "@/lib/store";
import { generateBriefing } from "@/lib/grok";

export async function POST(request: NextRequest) {
  try {
    let snapshot: any;
    let events: any[] = [];
    let mentions: any[] = [];

    if (isSupabaseConfigured()) {
      const { createServiceClient } = await import("@/lib/supabase/server");
      const supabase = createServiceClient();

      const { data: snapData } = await supabase
        .from("sentiment_snapshots")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(1)
        .single();

      const { data: evtData } = await supabase
        .from("events")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(10);

      const { data: mentData } = await supabase
        .from("mentions")
        .select("*")
        .order("impressions", { ascending: false })
        .limit(10);

      snapshot = snapData;
      events = evtData || [];
      mentions = mentData || [];
    } else {
      snapshot = dataStore.getLatestSnapshot();
      events = dataStore.getActiveEvents().slice(0, 10);
      mentions = [...dataStore.mentions]
        .sort((a, b) => b.impressions - a.impressions)
        .slice(0, 10);
    }

    if (!snapshot) {
      return NextResponse.json(
        { error: "暂无数据，请先运行手动触发" },
        { status: 404 }
      );
    }

    const topPosts = mentions
      .map((m: any) => `@${m.author_handle} (${m.author_followers} 粉丝, ${m.impressions} 曝光): ${(m.text_zh || m.text).slice(0, 200)}`)
      .join("\n");

    const eventsStr = events
      .map((e: any) => `[${e.severity}] ${e.title}: ${e.description}`)
      .join("\n");

    const briefing = await generateBriefing({
      totalPosts: snapshot.total_mentions,
      kolPosts: snapshot.kol_mention_count || 0,
      negativePct: snapshot.negative_pct,
      positivePct: snapshot.positive_pct,
      alertLevel: snapshot.alert_level,
      topPosts: topPosts || "暂无",
      events: eventsStr || "暂无",
    });

    // Store briefing
    if (isSupabaseConfigured()) {
      const { createServiceClient } = await import("@/lib/supabase/server");
      const supabase = createServiceClient();
      await supabase.from("reports").insert({
        title: `Executive Briefing - ${new Date().toISOString().split("T")[0]}`,
        time_range_start: new Date(
          Date.now() - 24 * 60 * 60 * 1000
        ).toISOString(),
        time_range_end: new Date().toISOString(),
        keywords: ["binance"],
        summary_text: briefing.headline,
        executive_briefing: JSON.stringify(briefing),
        data: briefing as any,
      });
    } else {
      dataStore.latestBriefing = briefing;
    }

    return NextResponse.json(briefing);
  } catch (error) {
    console.error("Briefing generation failed:", error);
    return NextResponse.json(
      { error: "生成简报失败: " + String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const { createServiceClient } = await import("@/lib/supabase/server");
      const supabase = createServiceClient();

      const { data: report } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!report?.data) {
        return NextResponse.json(null);
      }

      return NextResponse.json(report.data);
    }

    return NextResponse.json(dataStore.latestBriefing);
  } catch {
    return NextResponse.json(null);
  }
}
