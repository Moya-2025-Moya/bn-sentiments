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
import {
  DEMO_SNAPSHOT,
  DEMO_PREVIOUS_SNAPSHOT,
  DEMO_SNAPSHOTS_24H,
  DEMO_EVENTS,
} from "@/lib/demo-data";

async function getData() {
  return {
    latestSnapshot: DEMO_SNAPSHOT,
    previousSnapshot: DEMO_PREVIOUS_SNAPSHOT,
    snapshots24h: DEMO_SNAPSHOTS_24H,
    activeEvents: DEMO_EVENTS,
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
