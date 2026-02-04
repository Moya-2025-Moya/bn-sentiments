"use client";

import {
  ComposedChart,
  Line,
  Area,
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
import type { SentimentSnapshot } from "@/lib/types";

interface PriceCorrelationProps {
  data: SentimentSnapshot[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const bnbPrice = payload.find((p: any) => p.dataKey === "bnbPrice")?.value;
  const negPct = payload.find((p: any) => p.dataKey === "negativePct")?.value;

  let signal = "";
  let signalColor = "";
  if (negPct > 30 && bnbPrice) {
    signal = "利空信号";
    signalColor = CHART_COLORS.negative;
  } else if (negPct > 30) {
    signal = "情绪噪音";
    signalColor = CHART_COLORS.neutral;
  }

  return (
    <div className="bg-bg-darker border border-border-default rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-text-tertiary mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-sm" style={{ color: p.color }}>
          {p.name}: {p.dataKey === "bnbPrice" ? `$${p.value}` : `${p.value}%`}
        </p>
      ))}
      {signal && (
        <p className="text-xs font-bold mt-1" style={{ color: signalColor }}>
          {signal}
        </p>
      )}
    </div>
  );
}

export function PriceCorrelation({ data }: PriceCorrelationProps) {
  const chartData = data
    .filter((s) => s.bnb_price)
    .map((s) => ({
      time: format(new Date(s.timestamp), "HH:mm"),
      bnbPrice: s.bnb_price,
      negativePct: Math.round(s.negative_pct),
    }));

  if (chartData.length === 0) {
    return (
      <Card title="BNB Price vs Negative Sentiment">
        <div className="h-48 flex items-center justify-center text-text-tertiary text-sm">
          等待价格数据...
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="BNB 价格 vs 负面舆情"
      headerRight={
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-gold inline-block rounded" />
            <span className="text-text-tertiary">BNB 价格</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-negative inline-block rounded" />
            <span className="text-text-tertiary">负面 %</span>
          </span>
        </div>
      }
    >
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="negGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={CHART_COLORS.negative}
                  stopOpacity={0.2}
                />
                <stop
                  offset="100%"
                  stopColor={CHART_COLORS.negative}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2B2F36" />
            <XAxis
              dataKey="time"
              tick={{ fill: "#848E9C", fontSize: 11 }}
              axisLine={{ stroke: "#2B2F36" }}
              tickLine={false}
            />
            <YAxis
              yAxisId="price"
              tick={{ fill: "#848E9C", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(v) => `$${v}`}
            />
            <YAxis
              yAxisId="sentiment"
              orientation="right"
              tick={{ fill: "#848E9C", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              unit="%"
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              yAxisId="sentiment"
              y={40}
              stroke={CHART_COLORS.negative}
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            <Area
              yAxisId="sentiment"
              type="monotone"
              dataKey="negativePct"
              fill="url(#negGradient)"
              stroke={CHART_COLORS.negative}
              strokeWidth={2}
              name="负面情绪"
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="bnbPrice"
              stroke={CHART_COLORS.gold}
              strokeWidth={2}
              dot={false}
              name="BNB 价格"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-6 mt-3 text-[11px] text-text-tertiary">
        <span>
          <span className="text-negative font-medium">舆情上升 + 币价下跌</span>{" "}
          = 真实利空（需处理）
        </span>
        <span>
          <span className="text-neutral-gray font-medium">仅舆情上升</span>{" "}
          = 情绪噪音（可忽略）
        </span>
      </div>
    </Card>
  );
}
