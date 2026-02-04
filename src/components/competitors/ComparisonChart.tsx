"use client";

import { useState, useMemo } from "react";
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
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Card } from "@/components/shared/Card";
import { CHART_COLORS } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import { format } from "date-fns";
import type { SentimentSnapshot, CompetitorSnapshot } from "@/lib/types";

interface ComparisonChartProps {
  binanceData: SentimentSnapshot[];
  competitorData: CompetitorSnapshot[];
}

const EXCHANGE_COLORS: Record<string, string> = {
  coinbase: "#1652F0",
  okx: "#FFFFFF",
  bybit: "#F7A600",
  kraken: "#5741D9",
  bitget: "#00C5AB",
  kucoin: "#24AE8F",
  "gate.io": "#2354E6",
  htx: "#2D74E7",
  "crypto.com": "#002D74",
  upbit: "#093687",
};

function getExchangeColor(name: string): string {
  return EXCHANGE_COLORS[name] || "#848E9C";
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-darker border border-border-default rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-text-tertiary mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-sm" style={{ color: p.color }}>
          {p.name}: {p.value}%
        </p>
      ))}
    </div>
  );
}

export function ComparisonChart({
  binanceData,
  competitorData,
}: ComparisonChartProps) {
  // Get unique exchange names
  const exchanges = useMemo(() => {
    const names = new Set(competitorData.map((c) => c.exchange_name));
    return Array.from(names).sort();
  }, [competitorData]);

  const [selectedExchanges, setSelectedExchanges] = useState<string[]>(
    exchanges.slice(0, 3)
  );

  // Latest data for summary table
  const latestByExchange = useMemo(() => {
    const latest: Record<string, CompetitorSnapshot> = {};
    for (const snap of competitorData) {
      if (
        !latest[snap.exchange_name] ||
        new Date(snap.timestamp) > new Date(latest[snap.exchange_name].timestamp)
      ) {
        latest[snap.exchange_name] = snap;
      }
    }
    return latest;
  }, [competitorData]);

  const latestBinance = binanceData[binanceData.length - 1];

  // Chart data for selected exchanges
  const chartData = useMemo(() => {
    return binanceData.map((s, i) => {
      const point: Record<string, any> = {
        time: format(new Date(s.timestamp), "HH:mm"),
        Binance: Math.round(s.negative_pct),
      };
      for (const ex of selectedExchanges) {
        const exData = competitorData.filter(
          (c) => c.exchange_name === ex
        );
        if (exData[i]) {
          point[ex] = Math.round(exData[i].negative_pct);
        }
      }
      return point;
    });
  }, [binanceData, competitorData, selectedExchanges]);

  // Summary bar chart data
  const summaryData = useMemo(() => {
    const items = [
      {
        name: "Binance",
        negative_pct: latestBinance?.negative_pct || 0,
        total_mentions: latestBinance?.total_mentions || 0,
        positive_pct: latestBinance?.positive_pct || 0,
        color: CHART_COLORS.gold,
      },
      ...exchanges.map((ex) => ({
        name: ex.charAt(0).toUpperCase() + ex.slice(1),
        negative_pct: latestByExchange[ex]?.negative_pct || 0,
        total_mentions: latestByExchange[ex]?.total_mentions || 0,
        positive_pct: latestByExchange[ex]?.positive_pct || 0,
        color: getExchangeColor(ex),
      })),
    ];
    return items.sort((a, b) => b.negative_pct - a.negative_pct);
  }, [exchanges, latestByExchange, latestBinance]);

  // Industry average
  const industryAvgNeg = useMemo(() => {
    const vals = Object.values(latestByExchange).map((s) => s.negative_pct);
    return vals.length > 0
      ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
      : 0;
  }, [latestByExchange]);

  const binanceNeg = latestBinance?.negative_pct || 0;
  const diff = binanceNeg - industryAvgNeg;

  let analysisLabel = "";
  let analysisColor = "";
  if (Math.abs(diff) < 8) {
    analysisLabel = "行业整体 FUD — Binance 与行业平均水平相当";
    analysisColor = "text-neutral-gray";
  } else if (diff > 0) {
    analysisLabel = "针对 Binance 的定向攻击 — 负面舆情显著高于行业平均";
    analysisColor = "text-negative";
  } else {
    analysisLabel = "Binance 表现优于行业平均";
    analysisColor = "text-positive";
  }

  function toggleExchange(ex: string) {
    setSelectedExchanges((prev) =>
      prev.includes(ex) ? prev.filter((e) => e !== ex) : [...prev, ex]
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Table */}
      <Card title="交易所舆情对比 — 全行业概览">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left py-2 text-text-tertiary font-medium text-xs">
                  交易所
                </th>
                <th className="text-right py-2 text-text-tertiary font-medium text-xs">
                  提及量
                </th>
                <th className="text-right py-2 text-text-tertiary font-medium text-xs">
                  正面
                </th>
                <th className="text-right py-2 text-text-tertiary font-medium text-xs">
                  负面
                </th>
                <th className="text-right py-2 text-text-tertiary font-medium text-xs">
                  情绪条
                </th>
                <th className="text-right py-2 text-text-tertiary font-medium text-xs">
                  预警
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Binance row */}
              <tr className="border-b border-border-subtle bg-gold/5">
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CHART_COLORS.gold }}
                    />
                    <span className="font-medium text-gold">Binance</span>
                  </div>
                </td>
                <td className="text-right text-text-primary font-medium">
                  {formatNumber(latestBinance?.total_mentions || 0)}
                </td>
                <td className="text-right text-positive">
                  {latestBinance?.positive_pct || 0}%
                </td>
                <td className="text-right text-negative font-medium">
                  {latestBinance?.negative_pct || 0}%
                </td>
                <td className="text-right">
                  <div className="flex h-1.5 w-20 rounded-full overflow-hidden bg-bg-base ml-auto">
                    <div
                      className="bg-positive"
                      style={{ width: `${latestBinance?.positive_pct || 0}%` }}
                    />
                    <div
                      className="bg-neutral-gray"
                      style={{ width: `${latestBinance?.neutral_pct || 0}%` }}
                    />
                    <div
                      className="bg-negative"
                      style={{ width: `${latestBinance?.negative_pct || 0}%` }}
                    />
                  </div>
                </td>
                <td className="text-right">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      latestBinance?.alert_level === "red"
                        ? "bg-negative/15 text-negative"
                        : latestBinance?.alert_level === "yellow"
                          ? "bg-gold/15 text-gold"
                          : "bg-positive/15 text-positive"
                    }`}
                  >
                    {latestBinance?.alert_level === "red"
                      ? "高危"
                      : latestBinance?.alert_level === "yellow"
                        ? "关注"
                        : "正常"}
                  </span>
                </td>
              </tr>
              {/* Competitor rows */}
              {exchanges.map((ex) => {
                const data = latestByExchange[ex];
                if (!data) return null;
                return (
                  <tr
                    key={ex}
                    className="border-b border-border-subtle hover:bg-bg-card-hover transition-colors"
                  >
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: getExchangeColor(ex) }}
                        />
                        <span className="text-text-primary capitalize">
                          {ex}
                        </span>
                      </div>
                    </td>
                    <td className="text-right text-text-primary">
                      {formatNumber(data.total_mentions)}
                    </td>
                    <td className="text-right text-positive">
                      {data.positive_pct}%
                    </td>
                    <td className="text-right text-negative">
                      {data.negative_pct}%
                    </td>
                    <td className="text-right">
                      <div className="flex h-1.5 w-20 rounded-full overflow-hidden bg-bg-base ml-auto">
                        <div
                          className="bg-positive"
                          style={{ width: `${data.positive_pct}%` }}
                        />
                        <div
                          className="bg-neutral-gray"
                          style={{ width: `${data.neutral_pct}%` }}
                        />
                        <div
                          className="bg-negative"
                          style={{ width: `${data.negative_pct}%` }}
                        />
                      </div>
                    </td>
                    <td className="text-right">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          data.alert_level === "red"
                            ? "bg-negative/15 text-negative"
                            : data.alert_level === "yellow"
                              ? "bg-gold/15 text-gold"
                              : "bg-positive/15 text-positive"
                        }`}
                      >
                        {data.alert_level === "red"
                          ? "高危"
                          : data.alert_level === "yellow"
                            ? "关注"
                            : "正常"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Negative Sentiment Bar Comparison */}
      <Card title="负面情绪占比排名">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summaryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#2B2F36" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: "#848E9C", fontSize: 11 }}
                axisLine={{ stroke: "#2B2F36" }}
                unit="%"
                domain={[0, 50]}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#848E9C", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                formatter={(val) => [`${val}%`, "负面情绪"]}
                contentStyle={{
                  backgroundColor: "#0C0E12",
                  border: "1px solid #2B2F36",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="negative_pct" radius={[0, 4, 4, 0]}>
                {summaryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Line Chart — select exchanges to compare */}
      <Card title="负面情绪趋势对比 (24h)">
        {/* Exchange selector */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs text-text-tertiary">对比:</span>
          {exchanges.map((ex) => (
            <button
              key={ex}
              onClick={() => toggleExchange(ex)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all capitalize ${
                selectedExchanges.includes(ex)
                  ? "border-border-default bg-bg-card text-text-primary"
                  : "border-border-subtle text-text-tertiary hover:text-text-secondary"
              }`}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5"
                style={{
                  backgroundColor: getExchangeColor(ex),
                  opacity: selectedExchanges.includes(ex) ? 1 : 0.3,
                }}
              />
              {ex}
            </button>
          ))}
        </div>

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
                domain={[0, 50]}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine
                y={industryAvgNeg}
                stroke="#848E9C"
                strokeDasharray="3 3"
                strokeOpacity={0.4}
                label={{
                  value: `行业均值 ${industryAvgNeg}%`,
                  fill: "#5E6673",
                  fontSize: 10,
                }}
              />
              <Line
                type="monotone"
                dataKey="Binance"
                stroke={CHART_COLORS.gold}
                strokeWidth={2.5}
                dot={false}
                name="Binance"
              />
              {selectedExchanges.map((ex) => (
                <Line
                  key={ex}
                  type="monotone"
                  dataKey={ex}
                  stroke={getExchangeColor(ex)}
                  strokeWidth={1.5}
                  dot={false}
                  name={ex.charAt(0).toUpperCase() + ex.slice(1)}
                  strokeDasharray="5 5"
                  strokeOpacity={0.7}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Analysis */}
      <Card>
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 rounded-full bg-gold" />
          <div>
            <p className={`text-sm font-semibold ${analysisColor}`}>
              {analysisLabel}
            </p>
            <p className="text-xs text-text-tertiary mt-0.5">
              Binance 负面：{binanceNeg}% | 行业均值：{industryAvgNeg}% |
              差值：{diff > 0 ? "+" : ""}
              {diff}pp
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
