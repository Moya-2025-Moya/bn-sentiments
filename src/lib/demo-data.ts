import type { SentimentSnapshot, SentimentEvent, CompetitorSnapshot, KOLActivity } from "./types";

// Real timestamps based on current time
function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3600000).toISOString();
}

// No fake demo data — all content comes from real Grok API calls
export const DEMO_KOL_ACTIVITIES: KOLActivity[] = [];

export const DEMO_SNAPSHOT: SentimentSnapshot = {
  id: "empty",
  timestamp: new Date().toISOString(),
  total_mentions: 0,
  total_impressions: 0,
  total_reach: 0,
  unique_authors: 0,
  positive_pct: 0,
  neutral_pct: 0,
  negative_pct: 0,
  alert_level: "green",
  bnb_price: null,
  kol_mention_count: 0,
  top_countries: {},
  top_urls: [],
  top_kols: [],
};

export const DEMO_PREVIOUS_SNAPSHOT: SentimentSnapshot = {
  id: "empty-prev",
  timestamp: hoursAgo(24),
  total_mentions: 0,
  total_impressions: 0,
  total_reach: 0,
  unique_authors: 0,
  positive_pct: 0,
  neutral_pct: 0,
  negative_pct: 0,
  alert_level: "green",
  bnb_price: null,
  kol_mention_count: 0,
  top_countries: {},
  top_urls: [],
  top_kols: [],
};

export const DEMO_SNAPSHOTS_24H: SentimentSnapshot[] = [];

export const DEMO_EVENTS: SentimentEvent[] = [];

export const DEMO_COMPETITOR_SNAPSHOTS: CompetitorSnapshot[] = [];

export const DEMO_BRIEFING = {
  alert_level: "green" as const,
  headline: "暂无数据 — 请点击「手动触发」按钮运行 Grok 搜索",
  what_happened: "尚未运行监控任务。请在总览页面点击「手动触发」按钮，系统将调用 Grok API 搜索推特上关于 Binance 的真实推文。",
  why_it_matters: "首次运行后，系统将自动分析推文情绪、识别大V发文、检测舆情事件。",
  what_to_do: "1. 前往总览页面\n2. 点击「手动触发」按钮\n3. 等待 Grok API 返回真实推文数据\n4. 查看搜索日志确认 API 调用状态",
  key_metrics: {
    total_mentions: 0,
    negative_pct: 0,
    top_source: "暂无",
  },
};
