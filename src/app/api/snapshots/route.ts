import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { subHours, subDays } from "date-fns";

export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
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
