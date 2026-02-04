import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, dataStore } from "@/lib/store";
import { subHours, subDays } from "date-fns";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "24h";
  const now = new Date();

  let since: Date;
  switch (period) {
    case "7d":
      since = subDays(now, 7);
      break;
    case "30d":
      since = subDays(now, 30);
      break;
    default:
      since = subHours(now, 24);
  }

  if (isSupabaseConfigured()) {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("sentiment_snapshots")
      .select("*")
      .gte("timestamp", since.toISOString())
      .order("timestamp", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  }

  // Fallback: in-memory store
  const sinceMs = since.getTime();
  const snapshots = dataStore.snapshots.filter(
    (s) => new Date(s.timestamp).getTime() >= sinceMs
  );

  return NextResponse.json(snapshots);
}
