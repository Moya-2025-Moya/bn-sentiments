"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/shared/Header";
import { BriefingPanel } from "@/components/briefing/BriefingPanel";
import { ShareButton } from "@/components/briefing/ShareButton";
import { DEMO_BRIEFING } from "@/lib/demo-data";
import { RefreshCw } from "lucide-react";

export default function BriefingPage() {
  const [briefing, setBriefing] = useState(DEMO_BRIEFING);
  const [loading, setLoading] = useState(false);

  // Load latest briefing from API on mount
  useEffect(() => {
    fetch("/api/briefing")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.headline) {
          setBriefing(data);
        }
      })
      .catch(() => {});
  }, []);

  async function refreshBriefing() {
    setLoading(true);
    try {
      const res = await fetch("/api/briefing", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setBriefing(data);
      }
    } catch (err) {
      console.error("生成简报失败:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header
        title="高管智能简报"
        subtitle="AI 生成的舆情情报摘要，供管理层参考"
      >
        <ShareButton targetId="briefing-content" />
        <button
          onClick={refreshBriefing}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-card text-text-secondary border border-border-default text-sm font-medium hover:bg-bg-card-hover transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "生成中..." : "刷新简报"}
        </button>
      </Header>

      <BriefingPanel briefing={briefing} />
    </>
  );
}
