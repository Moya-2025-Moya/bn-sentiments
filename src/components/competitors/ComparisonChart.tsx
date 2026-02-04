"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/shared/Card";
import { CHART_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import type { SentimentSnapshot, CompetitorSnapshot } from "@/lib/types";

interface ComparisonChartProps {
  binanceData: SentimentSnapshot[];
  competitorData: CompetitorSnapshot[];
  competitorName: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const binanceNeg = payload.find((p: any) => p.dataKey === "binanceNeg")?.value;
  const competitorNeg = payload.find((p: any) => p.dataKey === "competitorNeg")?.value;

  let analysis = "";
  if (binanceNeg && competitorNeg && Math.abs(binanceNeg - competitorNeg) < 10) {
    analysis = "行业整体 FUD";
  } else if (binanceNeg && competitorNeg && binanceNeg > competitorNeg + 15) {
    analysis = "针对 Binance 的定向攻击";
  }

  return (
    <div className="bg-bg-darker border border-border-default rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-text-tertiary mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-sm" style={{ color: p.color }}>
          {p.name}: {p.value}%
        </p>
      ))}
      {analysis && (
        <p className="text-xs font-bold mt-1 text-gold">{analysis}</p>
      )}
    </div>
  );
}

export function ComparisonChart({
  binanceData,
  competitorData,
  competitorName,
}: ComparisonChartProps) {
  const chartData = binanceData.map((s, i) => ({
    time: format(new Date(s.timestamp), "HH:mm"),
    binanceNeg: Math.round(s.negative_pct),
    competitorNeg: competitorData[i]
      ? Math.round(competitorData[i].negative_pct)
      : null,
  }));

  const binanceAvg =
    binanceData.reduce((sum, s) => sum + s.negative_pct, 0) /
    (binanceData.length || 1);
  const compAvg =
    competitorData.reduce((sum, s) => sum + s.negative_pct, 0) /
    (competitorData.length || 1);
  const diff = binanceAvg - compAvg;

  let analysisLabel = "";
  let analysisColor = "";
  if (Math.abs(diff) < 8) {
    analysisLabel = "行业整体 FUD — 两家交易所受到相似影响";
    analysisColor = "text-neutral-gray";
  } else if (diff > 0) {
    analysisLabel = "针对 Binance 的定向攻击 — 负面舆情显著高于竞对";
    analysisColor = "text-negative";
  } else {
    analysisLabel = "Binance 表现优于竞对";
    analysisColor = "text-positive";
  }

  return (
    <div className="space-y-4">
      <Card title={`负面情绪对比：Binance vs ${competitorName}`}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2B2F36" />
              <XAxis
                dataKey="time"
                tick={{ fill: "#848E9C", fontSize: 11 }}
                axisLine={{ stroke: "#2B2F36" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#848E9C", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 60]}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine
                y={25}
                stroke="#848E9C"
                strokeDasharray="3 3"
                strokeOpacity={0.3}
                label={{ value: "基线", fill: "#5E6673", fontSize: 10 }}
              />
              <Line
                type="monotone"
                dataKey="binanceNeg"
                stroke={CHART_COLORS.gold}
                strokeWidth={2}
                dot={false}
                name="Binance"
              />
              <Line
                type="monotone"
                dataKey="competitorNeg"
                stroke={CHART_COLORS.blue}
                strokeWidth={2}
                dot={false}
                name={competitorName}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 rounded-full bg-gold" />
          <div>
            <p className={`text-sm font-semibold ${analysisColor}`}>
              {analysisLabel}
            </p>
            <p className="text-xs text-text-tertiary mt-0.5">
              Binance 均值：{Math.round(binanceAvg)}% 负面 | {competitorName}{" "}
              均值：{Math.round(compAvg)}% 负面 | 差值：
              {diff > 0 ? "+" : ""}
              {Math.round(diff)}pp
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
