"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/shared/Card";
import { formatNumber, calculatePercentChange } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: number;
  previousValue: number;
  format?: "number" | "compact";
}

export function MetricCard({
  label,
  value,
  previousValue,
  format = "compact",
}: MetricCardProps) {
  const change = calculatePercentChange(value, previousValue);
  const isUp = change >= 0;
  const formatted = format === "compact" ? formatNumber(value) : value.toLocaleString();
  const previousFormatted =
    format === "compact" ? formatNumber(previousValue) : previousValue.toLocaleString();

  return (
    <Card>
      <p className="text-sm text-text-secondary mb-2">{label}</p>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-display font-bold text-text-primary">
          {formatted}
        </span>
        <div className="flex items-center gap-1">
          {isUp ? (
            <TrendingUp size={14} className="text-positive" />
          ) : (
            <TrendingDown size={14} className="text-negative" />
          )}
          <span
            className={`text-sm font-medium ${
              isUp ? "text-positive" : "text-negative"
            }`}
          >
            {Math.abs(change)}%
          </span>
        </div>
      </div>
      <p className="text-xs text-text-tertiary mt-1.5">
        上期：{previousFormatted}
      </p>
    </Card>
  );
}
