"use client";

import { useEffect, useRef } from "react";
import { X, ExternalLink, Clock, CheckCircle, XCircle, Users } from "lucide-react";
import type { SentimentEvent } from "@/lib/types";
import { SeverityBadge, NewRecycledBadge, TierBadge } from "./SeverityBadge";
import { formatNumber, timeAgo, formatDateTime } from "@/lib/utils";
import { SEVERITY_CONFIG } from "@/lib/constants";

const SENTIMENT_DOT = {
  positive: "bg-positive",
  neutral: "bg-neutral-gray",
  negative: "bg-negative",
};

const SENTIMENT_LABEL = {
  positive: "正面",
  neutral: "中性",
  negative: "负面",
};

interface EventDetailModalProps {
  event: SentimentEvent;
  onClose: () => void;
}

export function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const severityConfig = SEVERITY_CONFIG[event.severity];

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="bg-bg-card border border-border-default rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-bg-card border-b border-border-subtle px-5 py-4 flex items-start justify-between gap-3 z-10">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <SeverityBadge severity={event.severity} />
              <NewRecycledBadge isNew={event.is_new_event} />
              <span className="text-xs px-2 py-0.5 rounded bg-bg-base text-text-secondary border border-border-subtle">
                {event.theme}
              </span>
              <TierBadge tier={event.source_tier} />
            </div>
            <h2 className="text-base font-bold text-text-primary">
              {event.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors shrink-0 p-1"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Description */}
          <p className="text-sm text-text-secondary leading-relaxed">
            {event.description}
          </p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-bg-base rounded-lg px-3 py-2 border border-border-subtle">
              <p className="text-[10px] text-text-tertiary">提及量</p>
              <p className="text-lg font-bold text-text-primary">
                {formatNumber(event.mention_count)}
              </p>
            </div>
            <div className="bg-bg-base rounded-lg px-3 py-2 border border-border-subtle">
              <p className="text-[10px] text-text-tertiary">曝光量</p>
              <p className="text-lg font-bold text-text-primary">
                {formatNumber(event.impression_estimate)}
              </p>
            </div>
            <div className="bg-bg-base rounded-lg px-3 py-2 border border-border-subtle">
              <p className="text-[10px] text-text-tertiary">负面情绪</p>
              <p className="text-lg font-bold text-negative">
                {event.negative_pct}%
              </p>
            </div>
            <div className="bg-bg-base rounded-lg px-3 py-2 border border-border-subtle">
              <p className="text-[10px] text-text-tertiary">官方回应</p>
              <p className="text-lg font-bold">
                {event.official_response ? (
                  <span className="flex items-center gap-1 text-positive">
                    <CheckCircle size={16} /> 已回应
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-text-tertiary">
                    <XCircle size={16} /> 未回应
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Sentiment Bar */}
          <div>
            <p className="text-xs text-text-tertiary mb-1.5">情绪分布</p>
            <div className="flex h-3 rounded-full overflow-hidden">
              <div
                className="bg-positive transition-all"
                style={{ width: `${event.positive_pct}%` }}
              />
              <div
                className="bg-neutral-gray transition-all"
                style={{ width: `${event.neutral_pct}%` }}
              />
              <div
                className="bg-negative transition-all"
                style={{ width: `${event.negative_pct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-positive">
                正面 {event.positive_pct}%
              </span>
              <span className="text-[10px] text-neutral-gray">
                中性 {event.neutral_pct}%
              </span>
              <span className="text-[10px] text-negative">
                负面 {event.negative_pct}%
              </span>
            </div>
          </div>

          {/* Key KOLs */}
          {event.key_kols && event.key_kols.length > 0 && (
            <div>
              <p className="text-xs text-text-tertiary mb-2 flex items-center gap-1">
                <Users size={12} />
                相关大V
              </p>
              <div className="flex flex-wrap gap-2">
                {event.key_kols.map((handle) => (
                  <a
                    key={handle}
                    href={`https://x.com/${handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold/10 text-gold text-xs border border-gold/20 hover:bg-gold/20 transition-all"
                  >
                    @{handle}
                    <ExternalLink size={10} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Related Tweets */}
          {event.related_tweets && event.related_tweets.length > 0 && (
            <div>
              <p className="text-xs text-text-tertiary mb-2">
                相关推文 ({event.related_tweets.length})
              </p>
              <div className="space-y-2">
                {event.related_tweets.map((tweet, i) => (
                  <div
                    key={i}
                    className="bg-bg-base rounded-lg px-4 py-3 border border-border-subtle"
                  >
                    {/* Tweet Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-bg-card border border-border-default flex items-center justify-center text-[10px] font-bold text-gold">
                          {tweet.author_name[0]}
                        </div>
                        <div>
                          <span className="text-xs font-medium text-text-primary">
                            {tweet.author_name}
                          </span>
                          <span className="text-[10px] text-text-tertiary ml-1.5">
                            @{tweet.author_handle}
                          </span>
                          {tweet.is_kol && (
                            <span className="text-[10px] ml-1 px-1 py-0 rounded bg-gold/10 text-gold">
                              大V
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${SENTIMENT_DOT[tweet.sentiment]}`}
                        />
                        <span className="text-[10px] text-text-tertiary">
                          {timeAgo(tweet.posted_at)}
                        </span>
                      </div>
                    </div>

                    {/* Tweet Text */}
                    <p className="text-sm text-text-secondary leading-relaxed mb-2">
                      {tweet.text}
                    </p>

                    {/* Tweet Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[10px] text-text-tertiary">
                        <span>
                          {formatNumber(tweet.author_followers)} 粉丝
                        </span>
                        <span>曝光 {formatNumber(tweet.impressions)}</span>
                        <span>{formatDateTime(tweet.posted_at)}</span>
                      </div>
                      {tweet.url && (
                        <a
                          href={tweet.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-gold hover:text-gold-hover transition-colors"
                        >
                          查看原文
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="flex items-center gap-4 text-xs text-text-tertiary pt-2 border-t border-border-subtle">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              首次发现：{formatDateTime(event.first_detected_at)}（{timeAgo(event.first_detected_at)}）
            </span>
            <span>
              最后更新：{formatDateTime(event.updated_at)}（{timeAgo(event.updated_at)}）
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
