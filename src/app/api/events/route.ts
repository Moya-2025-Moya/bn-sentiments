import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, dataStore } from "@/lib/store";

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

    return NextResponse.json(data);
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
