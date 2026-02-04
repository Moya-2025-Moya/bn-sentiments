import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { generateBriefing } from "@/lib/grok";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();

    // Fetch latest snapshot
    const { data: snapshot } = await supabase
      .from("sentiment_snapshots")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(1)
      .single();

    // Fetch active events
    const { data: events } = await supabase
      .from("events")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!snapshot) {
      return NextResponse.json(
        { error: "No snapshot data available" },
        { status: 404 }
      );
    }

    const briefing = await generateBriefing({
      snapshot: {
        total_mentions: snapshot.total_mentions,
        negative_pct: snapshot.negative_pct,
        positive_pct: snapshot.positive_pct,
        alert_level: snapshot.alert_level,
      },
      events: (events || []).map((e) => ({
        title: e.title,
        severity: e.severity,
        description: e.description,
      })),
      rawSummary: `Current sentiment: ${snapshot.positive_pct}% positive, ${snapshot.neutral_pct}% neutral, ${snapshot.negative_pct}% negative. Total mentions: ${snapshot.total_mentions}.`,
    });

    // Store as report
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

    return NextResponse.json(briefing);
  } catch (error) {
    console.error("Briefing generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate briefing" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
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
  } catch {
    return NextResponse.json(null);
  }
}
