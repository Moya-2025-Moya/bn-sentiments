"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/shared/Card";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Cpu } from "lucide-react";
import type { SearchLogEntry } from "@/lib/search-log";

const TYPE_LABELS: Record<string, string> = {
  search: "推特搜索",
  parse: "数据解析",
  events: "事件检测",
  briefing: "简报生成",
  competitor: "竞对搜索",
};

const TYPE_COLORS: Record<string, string> = {
  search: "text-gold",
  parse: "text-blue-400",
  events: "text-purple-400",
  briefing: "text-green-400",
  competitor: "text-cyan-400",
};

export function SearchLogs() {
  const [logs, setLogs] = useState<SearchLogEntry[]>([]);
  const [expanded, setExpanded] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchLogs() {
    try {
      const res = await fetch("/api/search-logs");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {
      // silently fail
    }
  }

  return (
    <Card>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Cpu size={14} className="text-gold" />
          <span className="text-sm font-semibold text-text-primary">
            Grok API 调用日志
          </span>
          {logs.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-base text-text-tertiary">
              {logs.length} 条记录
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUp size={14} className="text-text-tertiary" />
        ) : (
          <ChevronDown size={14} className="text-text-tertiary" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-1.5 max-h-80 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-xs text-text-tertiary py-4 text-center">
              暂无 API 调用记录 — 点击「手动检测」触发 Grok 搜索
            </p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-bg-base rounded-lg px-3 py-2 border border-border-subtle"
              >
                <button
                  onClick={() =>
                    setExpandedLog(expandedLog === log.id ? null : log.id)
                  }
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      {log.status === "success" ? (
                        <CheckCircle
                          size={12}
                          className="text-positive shrink-0"
                        />
                      ) : (
                        <XCircle
                          size={12}
                          className="text-negative shrink-0"
                        />
                      )}
                      <span
                        className={`text-[10px] font-mono shrink-0 ${TYPE_COLORS[log.type] || "text-text-secondary"}`}
                      >
                        [{TYPE_LABELS[log.type] || log.type}]
                      </span>
                      <span className="text-xs text-text-primary truncate">
                        {log.prompt_summary}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold font-mono">
                        {log.model}
                      </span>
                      <span className="text-[10px] text-text-tertiary flex items-center gap-0.5">
                        <Clock size={9} />
                        {log.duration_ms}ms
                      </span>
                    </div>
                  </div>
                </button>

                {expandedLog === log.id && (
                  <div className="mt-2 pt-2 border-t border-border-subtle">
                    <div className="text-[10px] text-text-tertiary mb-1">
                      {new Date(log.timestamp).toLocaleString("zh-CN")}
                    </div>
                    {log.result_summary && (
                      <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                        {log.result_summary}
                      </p>
                    )}
                    {log.error && (
                      <p className="text-xs text-negative leading-relaxed">
                        {log.error}
                      </p>
                    )}
                    {log.mentions_found !== undefined && (
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] text-text-tertiary">
                          提及数: {log.mentions_found}
                        </span>
                        {log.kol_count !== undefined && (
                          <span className="text-[10px] text-text-tertiary">
                            大V数: {log.kol_count}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
}
