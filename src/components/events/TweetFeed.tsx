"use client";

import { useState, useMemo } from "react";
import type { SentimentEvent, Severity } from "@/lib/types";
import { TweetCard, type FlatTweet } from "./TweetCard";
import { EventDetailModal } from "./EventDetailModal";
import { ArrowUpDown } from "lucide-react";

interface TweetFeedProps {
  events: SentimentEvent[];
}

type SortKey = "time" | "impressions" | "followers" | "sentiment" | "credibility";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "time", label: "时间" },
  { value: "impressions", label: "曝光量" },
  { value: "followers", label: "粉丝数" },
  { value: "sentiment", label: "情绪值" },
  { value: "credibility", label: "可信度" },
];

const THEME_TABS = [
  "全部",
  "合规",
  "安全",
  "监管",
  "链上异动",
  "媒体",
  "官方回应",
  "市场",
  "产品",
  "一般讨论",
];

const SENTIMENT_FILTERS: { label: string; value: string }[] = [
  { label: "全部", value: "all" },
  { label: "负面", value: "negative" },
  { label: "中性", value: "neutral" },
  { label: "正面", value: "positive" },
];

function computeCredibility(tweet: {
  author_followers: number;
  impressions: number;
  is_kol: boolean;
}): number {
  return (
    Math.min(1, tweet.author_followers / 1_000_000) * 0.4 +
    Math.min(1, tweet.impressions / 500_000) * 0.3 +
    (tweet.is_kol ? 0.3 : 0)
  );
}

// Sentiment to numeric value for sorting (-1 to 1)
const SENTIMENT_SORT_VALUE = {
  negative: -1,
  neutral: 0,
  positive: 1,
};

export function TweetFeed({ events }: TweetFeedProps) {
  const [sortKey, setSortKey] = useState<SortKey>("time");
  const [sortAsc, setSortAsc] = useState(false);
  const [themeFilter, setThemeFilter] = useState("全部");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [kolOnly, setKolOnly] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SentimentEvent | null>(null);

  // Flatten all tweets from all events
  const allTweets = useMemo<FlatTweet[]>(() => {
    const tweets: FlatTweet[] = [];
    for (const event of events) {
      if (!event.related_tweets) continue;
      for (const tweet of event.related_tweets) {
        tweets.push({
          ...tweet,
          event_title: event.title,
          event_id: event.id,
          event_severity: event.severity,
          event_theme: event.theme,
          credibility_score: computeCredibility(tweet),
        });
      }
    }
    return tweets;
  }, [events]);

  // Apply filters
  const filtered = useMemo(() => {
    return allTweets.filter((t) => {
      if (themeFilter !== "全部" && t.event_theme !== themeFilter) return false;
      if (sentimentFilter !== "all" && t.sentiment !== sentimentFilter) return false;
      if (kolOnly && !t.is_kol) return false;
      return true;
    });
  }, [allTweets, themeFilter, sentimentFilter, kolOnly]);

  // Apply sorting
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "time":
          cmp = new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
          break;
        case "impressions":
          cmp = b.impressions - a.impressions;
          break;
        case "followers":
          cmp = b.author_followers - a.author_followers;
          break;
        case "sentiment":
          cmp = SENTIMENT_SORT_VALUE[a.sentiment] - SENTIMENT_SORT_VALUE[b.sentiment];
          break;
        case "credibility":
          cmp = b.credibility_score - a.credibility_score;
          break;
      }
      return sortAsc ? -cmp : cmp;
    });
    return arr;
  }, [filtered, sortKey, sortAsc]);

  // Get unique themes present in data
  const presentThemes = useMemo(() => {
    const themes = new Set(allTweets.map((t) => t.event_theme));
    return THEME_TABS.filter((t) => t === "全部" || themes.has(t));
  }, [allTweets]);

  function handleEventClick(eventId: string) {
    const event = events.find((e) => e.id === eventId);
    if (event) setSelectedEvent(event);
  }

  function handleSortClick(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  return (
    <div>
      {/* Filters Bar */}
      <div className="space-y-3 mb-5">
        {/* Theme filter */}
        <div className="flex items-center gap-1 bg-bg-base rounded-lg p-1 flex-wrap">
          {presentThemes.map((theme) => (
            <button
              key={theme}
              onClick={() => setThemeFilter(theme)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                themeFilter === theme
                  ? "bg-bg-card text-text-primary"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {theme}
            </button>
          ))}
        </div>

        {/* Second row: sentiment filter + KOL toggle + sort */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* Sentiment filter */}
            <div className="flex items-center gap-1 bg-bg-base rounded-lg p-1">
              {SENTIMENT_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setSentimentFilter(f.value)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    sentimentFilter === f.value
                      ? "bg-bg-card text-text-primary"
                      : "text-text-tertiary hover:text-text-secondary"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* KOL toggle */}
            <button
              onClick={() => setKolOnly(!kolOnly)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                kolOnly
                  ? "bg-gold/15 text-gold border-gold/30"
                  : "bg-bg-base text-text-tertiary border-border-subtle hover:text-text-secondary"
              }`}
            >
              仅大V
            </button>

            <span className="text-xs text-text-tertiary">
              共 {sorted.length} 条推文
            </span>
          </div>

          {/* Sort buttons */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-tertiary mr-1">排序</span>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSortClick(opt.value)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                  sortKey === opt.value
                    ? "bg-bg-card text-gold border border-gold/30"
                    : "bg-bg-base text-text-tertiary hover:text-text-secondary border border-transparent"
                }`}
              >
                {opt.label}
                {sortKey === opt.value && (
                  <ArrowUpDown
                    size={10}
                    className={sortAsc ? "rotate-180" : ""}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tweet list */}
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <div className="text-center py-12 text-text-tertiary text-sm">
            当前筛选条件下无推文
          </div>
        ) : (
          sorted.map((tweet, i) => (
            <TweetCard
              key={`${tweet.event_id}-${tweet.author_handle}-${i}`}
              tweet={tweet}
              onEventClick={handleEventClick}
            />
          ))
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
