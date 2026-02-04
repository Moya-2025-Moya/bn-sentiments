import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AlertLevel, SourceTier } from "./types";
import {
  ALERT_THRESHOLDS,
  TIER1_FOLLOWER_THRESHOLD,
  TIER1_MEDIA_DOMAINS,
} from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateAlertLevel(
  negativePct: number,
  hasTier1Source: boolean,
  mentionVelocity: number
): AlertLevel {
  if (
    negativePct >= ALERT_THRESHOLDS.red.minNegativePct &&
    hasTier1Source &&
    mentionVelocity >= ALERT_THRESHOLDS.red.minVelocity
  ) {
    return "red";
  }
  if (negativePct >= ALERT_THRESHOLDS.yellow.maxNegativePct || hasTier1Source) {
    return "yellow";
  }
  return "green";
}

export function determineSourceTier(
  followerCount: number,
  url?: string | null
): SourceTier {
  if (followerCount >= TIER1_FOLLOWER_THRESHOLD) return 1;
  if (url) {
    try {
      const domain = new URL(url).hostname.replace("www.", "");
      if (TIER1_MEDIA_DOMAINS.includes(domain)) return 1;
    } catch {
      // invalid URL
    }
  }
  return 2;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function calculatePercentChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin}分钟前`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}小时前`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}天前`;
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
