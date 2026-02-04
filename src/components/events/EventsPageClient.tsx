"use client";

import { useState } from "react";
import type { SentimentEvent } from "@/lib/types";
import { TweetFeed } from "./TweetFeed";
import { EventFeed } from "./EventFeed";
import { MessageSquare, Layers } from "lucide-react";

interface EventsPageClientProps {
  events: SentimentEvent[];
}

const TABS = [
  { id: "tweets", label: "推文列表", icon: MessageSquare, desc: "按单条推文展示，支持排序筛选" },
  { id: "events", label: "事件概览", icon: Layers, desc: "按事件分组，查看事件详情" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function EventsPageClient({ events }: EventsPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("tweets");

  const totalTweets = events.reduce(
    (sum, e) => sum + (e.related_tweets?.length || 0),
    0
  );

  return (
    <div>
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 mb-5">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                activeTab === tab.id
                  ? "bg-bg-card text-text-primary border-gold/30"
                  : "bg-bg-base text-text-tertiary border-border-subtle hover:text-text-secondary hover:border-border-default"
              }`}
            >
              <Icon size={14} />
              {tab.label}
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-base text-text-tertiary">
                {tab.id === "tweets" ? totalTweets : events.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === "tweets" ? (
        <TweetFeed events={events} />
      ) : (
        <EventFeed events={events} />
      )}
    </div>
  );
}
