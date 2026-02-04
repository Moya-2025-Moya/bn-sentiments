import { Header } from "@/components/shared/Header";
import { RealtimeProvider } from "@/components/providers/RealtimeProvider";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SentimentDonut } from "@/components/dashboard/SentimentDonut";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { PriceCorrelation } from "@/components/dashboard/PriceCorrelation";
import { GeoBreakdown } from "@/components/dashboard/GeoBreakdown";
import { TopKOLs } from "@/components/dashboard/TopKOLs";
import { TopSources } from "@/components/dashboard/TopSources";
import { ManualTrigger } from "@/components/dashboard/ManualTrigger";
import { SearchLogs } from "@/components/dashboard/SearchLogs";
import { isSupabaseConfigured, dataStore } from "@/lib/store";
import {
  DEMO_SNAPSHOT,
  DEMO_PREVIOUS_SNAPSHOT,
} from "@/lib/demo-data";
import { subHours } from "date-fns";

export const dynamic = "force-dynamic";

async function getData() {
  if (isSupabaseConfigured()) {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = createServiceClient();

    // Latest snapshot
    const { data: latestSnap } = await supabase
      .from("sentiment_snapshots")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(1)
      .single();

    // Previous snapshot (second most recent)
    const { data: prevSnaps } = await supabase
      .from("sentiment_snapshots")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(2);

    // 24h snapshots for charts
    const since24h = subHours(new Date(), 24).toISOString();
    const { data: snaps24h } = await supabase
      .from("sentiment_snapshots")
      .select("*")
      .gte("timestamp", since24h)
      .order("timestamp", { ascending: true });

    // Active events
    const { data: evts } = await supabase
      .from("events")
      .select("*")
      .in("status", ["active", "monitoring"])
      .order("created_at", { ascending: false });

    const latestSnapshot = latestSnap || DEMO_SNAPSHOT;
    const previousSnapshot = (prevSnaps && prevSnaps.length > 1 ? prevSnaps[1] : null) || DEMO_PREVIOUS_SNAPSHOT;

    return {
      latestSnapshot,
      previousSnapshot,
      snapshots24h: snaps24h || [],
      activeEvents: evts || [],
    };
  }

  // Fallback: in-memory store
  const latestSnapshot = dataStore.getLatestSnapshot() || DEMO_SNAPSHOT;
  const previousSnapshot = dataStore.getPreviousSnapshot() || DEMO_PREVIOUS_SNAPSHOT;
  const snapshots24h = dataStore.getSnapshots24h();
  const activeEvents = dataStore.getActiveEvents();

  return {
    latestSnapshot,
    previousSnapshot,
    snapshots24h,
    activeEvents,
  };
}

export default async function DashboardPage() {
  const { latestSnapshot, previousSnapshot, snapshots24h, activeEvents } =
    await getData();

  return (
    <RealtimeProvider
      initialSnapshot={latestSnapshot}
      initialPreviousSnapshot={previousSnapshot}
      initialEvents={activeEvents}
    >
      <Header
        title="总览"
        subtitle="推特大V舆情实时监控"
        lastUpdated={latestSnapshot.timestamp}
      >
        <ManualTrigger />
      </Header>

      <div className="space-y-5">
        <AlertBanner />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            label="总提及量"
            value={latestSnapshot.total_mentions}
            previousValue={previousSnapshot.total_mentions}
          />
          <MetricCard
            label="大V发文数"
            value={latestSnapshot.kol_mention_count}
            previousValue={previousSnapshot.kol_mention_count}
          />
          <MetricCard
            label="总曝光量"
            value={latestSnapshot.total_impressions}
            previousValue={previousSnapshot.total_impressions}
          />
          <MetricCard
            label="总触达量"
            value={latestSnapshot.total_reach}
            previousValue={previousSnapshot.total_reach}
          />
          <MetricCard
            label="独立作者"
            value={latestSnapshot.unique_authors}
            previousValue={previousSnapshot.unique_authors}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SentimentDonut
            positive={latestSnapshot.positive_pct}
            neutral={latestSnapshot.neutral_pct}
            negative={latestSnapshot.negative_pct}
          />
          <div className="lg:col-span-2">
            <TrendChart data={snapshots24h} />
          </div>
        </div>

        <PriceCorrelation data={snapshots24h} />

        {/* KOL Activity — primary focus */}
        <TopKOLs data={latestSnapshot.top_kols} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GeoBreakdown data={latestSnapshot.top_countries} />
          <TopSources data={latestSnapshot.top_urls} />
        </div>

        {/* Grok API Logs */}
        <SearchLogs />
      </div>
    </RealtimeProvider>
  );
}
