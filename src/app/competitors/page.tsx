import { Header } from "@/components/shared/Header";
import { ComparisonChart } from "@/components/competitors/ComparisonChart";
import { isSupabaseConfigured, dataStore } from "@/lib/store";
import { subHours } from "date-fns";

export const dynamic = "force-dynamic";

async function getData() {
  if (isSupabaseConfigured()) {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = createServiceClient();
    const since24h = subHours(new Date(), 24).toISOString();

    const { data: binance } = await supabase
      .from("sentiment_snapshots")
      .select("*")
      .gte("timestamp", since24h)
      .order("timestamp", { ascending: true });

    const { data: competitors } = await supabase
      .from("competitor_snapshots")
      .select("*")
      .gte("timestamp", since24h)
      .order("timestamp", { ascending: true });

    return {
      binanceData: binance || [],
      competitorData: competitors || [],
    };
  }

  return {
    binanceData: dataStore.getSnapshots24h(),
    competitorData: dataStore.getCompetitorSnapshots24h(),
  };
}

export default async function CompetitorsPage() {
  const { binanceData, competitorData } = await getData();

  return (
    <>
      <Header
        title="竞对对比"
        subtitle="Binance vs 全行业主流交易所 · 区分行业 FUD 与定向攻击"
      />
      {binanceData.length === 0 && competitorData.length === 0 ? (
        <div className="text-center py-16 text-text-tertiary text-sm">
          暂无数据 — 请先在总览页面点击「手动触发」运行 Grok 搜索
        </div>
      ) : (
        <ComparisonChart
          binanceData={binanceData}
          competitorData={competitorData}
        />
      )}
    </>
  );
}
