import { NextResponse } from "next/server";
import { BNB_PRICE_URL } from "@/lib/constants";

export async function GET() {
  try {
    const res = await fetch(BNB_PRICE_URL, { next: { revalidate: 60 } });
    const data = await res.json();

    return NextResponse.json({
      price: data?.binancecoin?.usd ?? null,
      change_24h: data?.binancecoin?.usd_24h_change ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch BNB price" },
      { status: 500 }
    );
  }
}
