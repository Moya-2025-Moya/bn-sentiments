"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/shared/Card";
import { CHART_COLORS } from "@/lib/constants";

interface GeoBreakdownProps {
  data: Record<string, number>;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-darker border border-border-default rounded-lg px-3 py-2 shadow-xl">
      <p className="text-sm text-text-primary">
        {payload[0].payload.country}：<strong>{payload[0].value}</strong>{" "}
        条提及
      </p>
    </div>
  );
}

export function GeoBreakdown({ data }: GeoBreakdownProps) {
  const chartData = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([country, count]) => ({ country, count }));

  if (chartData.length === 0) {
    return (
      <Card title="提及量国家分布">
        <div className="h-48 flex items-center justify-center text-text-tertiary text-sm">
          暂无地理数据
        </div>
      </Card>
    );
  }

  return (
    <Card title="提及量国家分布">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" barSize={16}>
            <XAxis
              type="number"
              tick={{ fill: "#848E9C", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="country"
              tick={{ fill: "#EAECEF", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#2B2F3622" }} />
            <Bar
              dataKey="count"
              fill={CHART_COLORS.gold}
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
