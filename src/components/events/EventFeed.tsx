"use client";

import { useState } from "react";
import type { SentimentEvent, Severity } from "@/lib/types";
import { EventCard } from "./EventCard";
import { EventDetailModal } from "./EventDetailModal";

interface EventFeedProps {
  events: SentimentEvent[];
}

const SEVERITY_TABS: { label: string; value: Severity | "all" }[] = [
  { label: "全部", value: "all" },
  { label: "严重", value: "critical" },
  { label: "高", value: "high" },
  { label: "中", value: "medium" },
  { label: "低", value: "low" },
];

const STATUS_TABS = [
  { label: "活跃", value: "active" },
  { label: "监控中", value: "monitoring" },
  { label: "已解决", value: "resolved" },
];

export function EventFeed({ events }: EventFeedProps) {
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [statusFilter, setStatusFilter] = useState("active");
  const [selectedEvent, setSelectedEvent] = useState<SentimentEvent | null>(null);

  const filtered = events.filter((e) => {
    if (severityFilter !== "all" && e.severity !== severityFilter) return false;
    if (e.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-6 mb-5">
        <div className="flex items-center gap-1 bg-bg-base rounded-lg p-1">
          {SEVERITY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSeverityFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                severityFilter === tab.value
                  ? "bg-bg-card text-text-primary"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-bg-base rounded-lg p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                statusFilter === tab.value
                  ? "bg-bg-card text-text-primary"
                  : "text-text-tertiary hover:text-text-secondary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-text-tertiary">
          共 {filtered.length} 个事件
        </span>
      </div>

      {/* Event list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-text-tertiary text-sm">
            当前筛选条件下无事件
          </div>
        ) : (
          filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => setSelectedEvent(event)}
            />
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
