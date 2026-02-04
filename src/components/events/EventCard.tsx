"use client";

import type { SentimentEvent } from "@/lib/types";
import { SeverityBadge, NewRecycledBadge, TierBadge } from "./SeverityBadge";
import { SEVERITY_CONFIG } from "@/lib/constants";
import { CheckCircle, XCircle, Clock, ChevronRight } from "lucide-react";
import { timeAgo, formatNumber, formatDateTime } from "@/lib/utils";

interface EventCardProps {
  event: SentimentEvent;
  onClick?: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const severityConfig = SEVERITY_CONFIG[event.severity];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-bg-card rounded-xl border p-5 transition-all hover:bg-bg-card-hover cursor-pointer group ${severityConfig.border}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <SeverityBadge severity={event.severity} />
          <NewRecycledBadge isNew={event.is_new_event} />
          <span className="text-xs px-2 py-0.5 rounded bg-bg-base text-text-secondary border border-border-subtle">
            {event.theme}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TierBadge tier={event.source_tier} />
          <ChevronRight
            size={14}
            className="text-text-tertiary group-hover:text-gold transition-colors"
          />
        </div>
      </div>

      {/* Title + Description */}
      <h3 className="text-sm font-semibold text-text-primary mb-1.5">
        {event.title}
      </h3>
      <p className="text-sm text-text-secondary leading-relaxed line-clamp-2 mb-3">
        {event.description}
      </p>

      {/* KOL Tags */}
      {event.key_kols && event.key_kols.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {event.key_kols.map((handle) => (
            <span
              key={handle}
              className="text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold border border-gold/20"
            >
              @{handle}
            </span>
          ))}
        </div>
      )}

      {/* Metrics Row */}
      <div className="flex items-center gap-5 mb-3">
        <div className="text-xs">
          <span className="text-text-tertiary">提及量：</span>
          <span className="text-text-primary font-medium">
            {formatNumber(event.mention_count)}
          </span>
        </div>
        <div className="text-xs">
          <span className="text-text-tertiary">曝光量：</span>
          <span className="text-text-primary font-medium">
            {formatNumber(event.impression_estimate)}
          </span>
        </div>
        {/* Mini sentiment bar */}
        <div className="flex items-center gap-1.5">
          <div className="flex h-1.5 w-24 rounded-full overflow-hidden bg-bg-base">
            <div
              className="bg-positive"
              style={{ width: `${event.positive_pct}%` }}
            />
            <div
              className="bg-neutral-gray"
              style={{ width: `${event.neutral_pct}%` }}
            />
            <div
              className="bg-negative"
              style={{ width: `${event.negative_pct}%` }}
            />
          </div>
          <span className="text-xs text-negative font-medium">
            {event.negative_pct}%负面
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
            <Clock size={12} />
            <span>首次发现：{timeAgo(event.first_detected_at)}</span>
          </div>
          <span className="text-[10px] text-text-tertiary">
            ({formatDateTime(event.first_detected_at)})
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {event.official_response ? (
            <span className="flex items-center gap-1 text-positive">
              <CheckCircle size={12} />
              已官方回应
            </span>
          ) : (
            <span className="flex items-center gap-1 text-text-tertiary">
              <XCircle size={12} />
              未回应
            </span>
          )}
        </div>
      </div>

      {/* Tweet count hint */}
      {event.related_tweets && event.related_tweets.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border-subtle">
          <span className="text-[10px] text-gold group-hover:underline">
            查看 {event.related_tweets.length} 条相关推文 →
          </span>
        </div>
      )}
    </button>
  );
}
