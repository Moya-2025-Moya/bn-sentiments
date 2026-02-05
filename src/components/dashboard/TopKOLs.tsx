"use client";

import { Card } from "@/components/shared/Card";
import { ExternalLink } from "lucide-react";
import { formatNumber, timeAgo } from "@/lib/utils";
import type { KOLActivity } from "@/lib/types";

interface TopKOLsProps {
  data: KOLActivity[];
}

const SENTIMENT_STYLES = {
  positive: { dot: "bg-positive", text: "text-positive", label: "正面" },
  neutral: { dot: "bg-neutral-gray", text: "text-text-secondary", label: "中性" },
  negative: { dot: "bg-negative", text: "text-negative", label: "负面" },
};

export function TopKOLs({ data }: TopKOLsProps) {
  if (data.length === 0) {
    return (
      <Card title="大V动态">
        <div className="h-48 flex items-center justify-center text-text-tertiary text-sm">
          暂无大V发文数据
        </div>
      </Card>
    );
  }

  return (
    <Card title="大V动态 — 推特 KOL 最新发文">
      <div className="space-y-3">
        {data.slice(0, 6).map((kol, i) => {
          const style = SENTIMENT_STYLES[kol.sentiment];
          const displayName = kol.name || (kol as any).author?.replace(/^@/, '') || "Unknown";
          const displayHandle = kol.handle || (kol as any).author?.replace(/^@/, '') || "unknown";
          return (
            <div
              key={i}
              className="py-2.5 border-b border-border-subtle last:border-0"
            >
              {/* KOL Header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-bg-base border border-border-default flex items-center justify-center text-xs font-bold text-gold shrink-0">
                    {displayName[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-text-primary truncate">
                        {displayName}
                      </span>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-text-tertiary">
                      <span>@{displayHandle}</span>
                      <span>{formatNumber(kol.followers)} 粉丝</span>
                      <span className="px-1 py-0 rounded bg-bg-base text-text-tertiary">
                        {kol.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-text-tertiary">
                    {timeAgo(kol.posted_at)}
                  </span>
                  {kol.url && (
                    <a
                      href={kol.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-tertiary hover:text-gold transition-colors"
                    >
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>

              {/* Tweet Text */}
              <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 ml-9">
                {kol.tweet_text_zh || kol.tweet_text}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-3 ml-9 mt-1">
                <span className="text-[10px] text-text-tertiary">
                  曝光 {formatNumber(kol.impressions)}
                </span>
                <span className={`text-[10px] font-medium ${style.text}`}>
                  {style.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
