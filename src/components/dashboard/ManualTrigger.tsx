"use client";

import { useState, useEffect } from "react";
import { Radar, Loader2, ChevronDown } from "lucide-react";

interface ModelOption {
  id: string;
  name: string;
  description: string;
}

export function ManualTrigger() {
  const [status, setStatus] = useState<
    "idle" | "running" | "done" | "error"
  >("idle");
  const [result, setResult] = useState<string | null>(null);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState("grok-4-1-fast-reasoning");
  const [showModels, setShowModels] = useState(false);

  useEffect(() => {
    fetch("/api/search-logs")
      .then((r) => r.json())
      .then((data) => {
        if (data.available_models) {
          setModels(data.available_models);
          setSelectedModel(data.default_model || "grok-4-1-fast-reasoning");
        }
      })
      .catch(() => {});
  }, []);

  async function handleTrigger() {
    setStatus("running");
    setResult(null);
    try {
      const res = await fetch(
        `/api/monitor?manual=true&model=${encodeURIComponent(selectedModel)}`
      );
      const data = await res.json();
      if (res.ok) {
        setStatus("done");
        setResult(
          `检测完成：${data.mentions || 0} 条提及，${data.kol_mentions || 0} 个大V，${data.events || 0} 个事件`
        );
      } else {
        setStatus("error");
        setResult(data.error || "监控失败");
      }
    } catch {
      setStatus("error");
      setResult("网络错误");
    }
    setTimeout(() => {
      setStatus("idle");
      setResult(null);
    }, 8000);
  }

  const currentModel = models.find((m) => m.id === selectedModel);

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span
          className={`text-xs ${
            status === "error" ? "text-negative" : "text-positive"
          }`}
        >
          {result}
        </span>
      )}

      {/* Model Selector */}
      <div className="relative">
        <button
          onClick={() => setShowModels(!showModels)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg-base text-text-secondary border border-border-default text-xs hover:bg-bg-card-hover transition-all"
        >
          <span className="font-mono text-gold">
            {currentModel?.name || selectedModel}
          </span>
          <ChevronDown size={10} />
        </button>

        {showModels && (
          <div className="absolute right-0 top-full mt-1 w-52 bg-bg-darker border border-border-default rounded-lg shadow-xl z-50 py-1">
            {models.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedModel(m.id);
                  setShowModels(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-bg-card-hover transition-all ${
                  m.id === selectedModel ? "text-gold" : "text-text-secondary"
                }`}
              >
                <div className="font-mono font-medium">{m.name}</div>
                <div className="text-[10px] text-text-tertiary mt-0.5">
                  {m.description}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Trigger Button */}
      <button
        onClick={handleTrigger}
        disabled={status === "running"}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/10 text-gold border border-gold/30 text-sm font-medium hover:bg-gold/20 transition-all disabled:opacity-50"
      >
        {status === "running" ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Radar size={14} />
        )}
        {status === "running" ? "Grok 检测中..." : "手动检测"}
      </button>
    </div>
  );
}
