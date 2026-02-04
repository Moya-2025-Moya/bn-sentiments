import { NextResponse } from "next/server";
import { searchLogStore } from "@/lib/search-log";
import { AVAILABLE_MODELS, DEFAULT_SEARCH_MODEL } from "@/lib/grok";

export async function GET() {
  return NextResponse.json({
    logs: searchLogStore.getRecent(30),
    available_models: AVAILABLE_MODELS,
    default_model: DEFAULT_SEARCH_MODEL,
  });
}
