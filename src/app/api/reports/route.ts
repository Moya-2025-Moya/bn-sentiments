import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = createServiceClient();

  const body = await request.json();
  const { title, time_range_start, time_range_end, keywords } = body;

  // Fetch mentions in range
  const { data: mentions } = await supabase
    .from("mentions")
    .select("*")
    .gte("created_at", time_range_start)
    .lte("created_at", time_range_end);

  // Fetch snapshots in range
  const { data: snapshots } = await supabase
    .from("sentiment_snapshots")
    .select("*")
    .gte("timestamp", time_range_start)
    .lte("timestamp", time_range_end)
    .order("timestamp", { ascending: true });

  // Fetch events in range
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .gte("created_at", time_range_start)
    .lte("created_at", time_range_end);

  const allMentions = mentions || [];
  const totalMentions = allMentions.length;
  const sentimentBreakdown = {
    positive: allMentions.filter((m) => m.sentiment === "positive").length,
    neutral: allMentions.filter((m) => m.sentiment === "neutral").length,
    negative: allMentions.filter((m) => m.sentiment === "negative").length,
  };

  const reportData = {
    totalMentions,
    sentimentBreakdown,
    totalImpressions: allMentions.reduce(
      (sum, m) => sum + (m.impressions || 0),
      0
    ),
    uniqueAuthors: new Set(allMentions.map((m) => m.author)).size,
    events: events || [],
    snapshotCount: (snapshots || []).length,
  };

  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      title: title || `Report ${time_range_start} - ${time_range_end}`,
      time_range_start,
      time_range_end,
      keywords: keywords || ["binance"],
      summary_text: `${totalMentions} mentions analyzed. ${sentimentBreakdown.negative} negative (${totalMentions > 0 ? Math.round((sentimentBreakdown.negative / totalMentions) * 100) : 0}%).`,
      data: reportData,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(report);
}
