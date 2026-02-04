"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/shared/Card";
import { CHART_COLORS } from "@/lib/constants";
import { format } from "date-fns";
import type { SentimentSnapshot } from "@/lib/types";

interface TrendChartProps {
  data: SentimentSnapshot[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-darker border border-border-default rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-text-tertiary mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-sm" style={{ color: p.color }}>
          {p.name}: {p.name === "负面 %" ? `${p.value}%` : p.value}
        </p>
      ))}
    </div>
  );
}

export function TrendChart({ data }: TrendChartProps) {
  const chartData = data.map((s) => ({
    time: format(new Date(s.timestamp), "HH:mm"),
    mentions: s.total_mentions,
    "负面 %": Math.round(s.negative_pct),
  }));

  return (
    <Card title="舆情趋势（24小时）">
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.gold} stopOpacity={0.3} />
                <stop offset="100%" stopColor={CHART_COLORS.gold} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.negative} stopOpacity={0.3} />
                <stop offset="100%" stopColor={CHART_COLORS.negative} stopOpacity={0} />
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
              yAxisId="left"
              tick={{ fill: "#848E9C", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#848E9C", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              unit="%"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: "#848E9C" }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="mentions"
              stroke={CHART_COLORS.gold}
              fill="url(#goldGradient)"
              strokeWidth={2}
              name="提及量"
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="负面 %"
              stroke={CHART_COLORS.negative}
              fill="url(#redGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
