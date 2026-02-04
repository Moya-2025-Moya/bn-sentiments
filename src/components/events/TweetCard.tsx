"use client";

import { ExternalLink } from "lucide-react";
import { formatNumber, timeAgo, formatDateTime } from "@/lib/utils";
import type { Sentiment, Severity } from "@/lib/types";

const SENTIMENT_STYLES = {
  positive: { dot: "bg-positive", text: "text-positive", label: "正面" },
  neutral: { dot: "bg-neutral-gray", text: "text-text-secondary", label: "中性" },
  negative: { dot: "bg-negative", text: "text-negative", label: "负面" },
};

export interface FlatTweet {
  author_handle: string;
  author_name: string;
  author_followers: number;
  text: string;
  text_zh?: string;
  url: string | null;
  sentiment: Sentiment;
  impressions: number;
  posted_at: string;
  is_kol: boolean;
  // Event association
  event_title: string;
  event_id: string;
  event_severity: Severity;
  event_theme: string;
  credibility_score: number;
}

interface TweetCardProps {
  tweet: FlatTweet;
  onEventClick?: (eventId: string) => void;
}

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: "bg-negative/15 text-negative border-negative/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  medium: "bg-gold/15 text-gold border-gold/30",
  low: "bg-positive/15 text-positive border-positive/30",
};

export function TweetCard({ tweet, onEventClick }: TweetCardProps) {
  const style = SENTIMENT_STYLES[tweet.sentiment];

  return (
    <div className="bg-bg-card rounded-xl border border-border-default p-4 transition-all hover:bg-bg-card-hover">
      {/* Author Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-bg-base border border-border-default flex items-center justify-center text-xs font-bold text-gold shrink-0">
            {tweet.author_name[0]}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-text-primary truncate">
                {tweet.author_name}
              </span>
              {tweet.is_kol && (
                <span className="text-[10px] px-1.5 py-0 rounded bg-gold/10 text-gold border border-gold/20 shrink-0">
                  大V
                </span>
              )}
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-text-tertiary">
              <a
                href={`https://x.com/${tweet.author_handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors"
              >
                @{tweet.author_handle}
              </a>
              <span>{formatNumber(tweet.author_followers)} 粉丝</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-text-tertiary">
            {timeAgo(tweet.posted_at)}
          </span>
          {tweet.url && (
            <a
              href={tweet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-tertiary hover:text-gold transition-colors"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Tweet Text */}
      <p className="text-sm text-text-secondary leading-relaxed mb-3 ml-[42px]">
        {tweet.text_zh || tweet.text}
      </p>

      {/* Bottom Row: Event Tag + Metrics */}
      <div className="flex items-center justify-between ml-[42px]">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Event Tag */}
          <button
            onClick={() => onEventClick?.(tweet.event_id)}
            className={`text-[10px] px-2 py-0.5 rounded border cursor-pointer hover:opacity-80 transition-opacity ${SEVERITY_COLORS[tweet.event_severity]}`}
          >
            {tweet.event_theme} · {tweet.event_title.length > 20 ? tweet.event_title.slice(0, 20) + "…" : tweet.event_title}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] text-text-tertiary">
            曝光 {formatNumber(tweet.impressions)}
          </span>
          <span className={`text-[10px] font-medium ${style.text}`}>
            {style.label}
          </span>
          <span className="text-[10px] text-text-tertiary" title="可信度评分">
            ★ {(tweet.credibility_score * 100).toFixed(0)}
          </span>
        </div>
      </div>

      {/* Timestamp */}
      <div className="mt-2 ml-[42px]">
        <span className="text-[10px] text-text-tertiary">
          {formatDateTime(tweet.posted_at)}
        </span>
      </div>
    </div>
  );
}
