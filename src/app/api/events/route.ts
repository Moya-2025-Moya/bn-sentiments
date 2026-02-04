import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status") || "active";
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
