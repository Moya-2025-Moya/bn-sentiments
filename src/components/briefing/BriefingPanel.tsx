"use client";

import { Card } from "@/components/shared/Card";
import { ALERT_LABELS } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import type { AlertLevel } from "@/lib/types";

interface BriefingData {
  alert_level: AlertLevel;
  headline: string;
  what_happened: string;
  why_it_matters: string;
  what_to_do: string;
  key_metrics: {
    total_mentions: number;
    negative_pct: number;
    top_source: string;
  };
}

interface BriefingPanelProps {
  briefing: BriefingData;
}

const ALERT_STYLES = {
  green: {
    bg: "bg-positive/10",
    border: "border-positive/30",
    text: "text-positive",
    dot: "bg-positive",
  },
  yellow: {
    bg: "bg-gold/10",
    border: "border-gold/30",
    text: "text-gold",
    dot: "bg-gold",
  },
  red: {
    bg: "bg-negative/10",
    border: "border-negative/30",
    text: "text-negative",
    dot: "bg-negative animate-pulse",
  },
};

export function BriefingPanel({ briefing }: BriefingPanelProps) {
  const style = ALERT_STYLES[briefing.alert_level];
  const label = ALERT_LABELS[briefing.alert_level];

  return (
    <div id="briefing-content" className="space-y-4">
      {/* Alert Status */}
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-xl border ${style.bg} ${style.border}`}
      >
        <div className={`w-3 h-3 rounded-full ${style.dot}`} />
        <span className={`font-bold text-sm ${style.text}`}>
          {label.label}
        </span>
        <span className="text-text-secondary text-sm">
          {briefing.headline}
        </span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-xs text-text-tertiary mb-1">总提及量</p>
          <p className="text-xl font-bold text-text-primary">
            {formatNumber(briefing.key_metrics.total_mentions)}
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-text-tertiary mb-1">负面比例</p>
          <p className="text-xl font-bold text-negative">
            {briefing.key_metrics.negative_pct}%
          </p>
        </Card>
        <Card className="text-center">
          <p className="text-xs text-text-tertiary mb-1">主要信源</p>
          <p className="text-sm font-bold text-gold truncate">
            {briefing.key_metrics.top_source}
          </p>
        </Card>
      </div>

      {/* Sections */}
      <Card>
        <div className="space-y-5">
          <section>
            <h3 className="text-sm font-bold text-gold mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-gold rounded-full" />
              发生了什么
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {briefing.what_happened}
            </p>
          </section>

          <section>
            <h3 className="text-sm font-bold text-gold mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-gold rounded-full" />
              为什么重要
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {briefing.why_it_matters}
            </p>
          </section>

          <section>
            <h3 className="text-sm font-bold text-gold mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-gold rounded-full" />
              建议行动
            </h3>
            <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              {briefing.what_to_do}
            </div>
          </section>
        </div>
      </Card>
    </div>
  );
}
