"use client";

import { useRealtime } from "@/components/providers/RealtimeProvider";
import { Shield, AlertTriangle, XOctagon } from "lucide-react";
import { ALERT_LABELS } from "@/lib/constants";

const ALERT_CONFIG = {
  green: {
    icon: Shield,
    bg: "bg-positive/10",
    border: "border-positive/30",
    text: "text-positive",
    dot: "bg-positive",
  },
  yellow: {
    icon: AlertTriangle,
    bg: "bg-gold/10",
    border: "border-gold/30",
    text: "text-gold",
    dot: "bg-gold",
  },
  red: {
    icon: XOctagon,
    bg: "bg-negative/10",
    border: "border-negative/30",
    text: "text-negative",
    dot: "bg-negative animate-pulse",
  },
};

export function AlertBanner() {
  const { alertLevel } = useRealtime();
  const config = ALERT_CONFIG[alertLevel];
  const labels = ALERT_LABELS[alertLevel];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border ${config.bg} ${config.border}`}
    >
      <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
      <Icon size={18} className={config.text} />
      <div className="flex-1">
        <span className={`font-semibold text-sm ${config.text}`}>
          {labels.label}
        </span>
        <span className="text-text-secondary text-sm ml-2">
          {labels.description}
        </span>
      </div>
    </div>
  );
}
