import { Header } from "@/components/shared/Header";
import { ComparisonChart } from "@/components/competitors/ComparisonChart";
import {
  DEMO_SNAPSHOTS_24H,
  DEMO_COMPETITOR_SNAPSHOTS,
} from "@/lib/demo-data";

async function getData() {
  return {
    binanceData: DEMO_SNAPSHOTS_24H,
    competitorData: DEMO_COMPETITOR_SNAPSHOTS,
  };
}

export default async function CompetitorsPage() {
  const { binanceData, competitorData } = await getData();

  return (
    <>
      <Header
        title="竞对对比"
        subtitle="区分行业整体 FUD 和针对 Binance 的定向攻击"
      />
      <ComparisonChart
        binanceData={binanceData}
        competitorData={competitorData}
        competitorName="Coinbase"
      />
    </>
  );
}
