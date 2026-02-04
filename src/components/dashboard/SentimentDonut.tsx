"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/shared/Card";
import { CHART_COLORS } from "@/lib/constants";

interface SentimentDonutProps {
  positive: number;
  neutral: number;
  negative: number;
}

const RADIAN = Math.PI / 180;

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-bg-darker border border-border-default rounded-lg px-3 py-2 shadow-xl">
      <p className="text-sm text-text-primary font-medium">
        {name}: {value}%
      </p>
    </div>
  );
}

export function SentimentDonut({
  positive,
  neutral,
  negative,
}: SentimentDonutProps) {
  const data = [
    { name: "正面", value: positive, color: CHART_COLORS.positive },
    { name: "中性", value: neutral, color: CHART_COLORS.neutral },
    { name: "负面", value: negative, color: CHART_COLORS.negative },
  ];

  const dominant = data.reduce((a, b) => (a.value > b.value ? a : b));

  return (
    <Card title="情绪分布">
      <div className="flex flex-col items-center">
        <div className="w-full h-56 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div
                className="text-2xl font-bold"
                style={{ color: dominant.color }}
              >
                {dominant.value}%
              </div>
              <div className="text-[11px] text-text-tertiary">
                {dominant.name}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-2">
          {data.map((entry) => (
            <div key={entry.name} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: entry.color }}
              />
              <span className="text-xs text-text-secondary">
                {entry.value}% {entry.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
