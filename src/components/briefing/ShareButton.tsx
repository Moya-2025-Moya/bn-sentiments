"use client";

import { useState } from "react";
import { Download, Share2, Check } from "lucide-react";
import { toPng } from "html-to-image";

interface ShareButtonProps {
  targetId: string;
}

export function ShareButton({ targetId }: ShareButtonProps) {
  const [status, setStatus] = useState<"idle" | "copying" | "done">("idle");

  async function handleExport() {
    const el = document.getElementById(targetId);
    if (!el) return;

    setStatus("copying");
    try {
      const dataUrl = await toPng(el, {
        backgroundColor: "#0B0E11",
        quality: 1.0,
        pixelRatio: 2,
      });

      // Try clipboard first
      try {
        const blob = await (await fetch(dataUrl)).blob();
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
      } catch {
        // Fallback: download
        const link = document.createElement("a");
        link.download = `briefing-${new Date().toISOString().split("T")[0]}.png`;
        link.href = dataUrl;
        link.click();
      }

      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      console.error("Export failed:", err);
      setStatus("idle");
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={status === "copying"}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/10 text-gold border border-gold/30 text-sm font-medium hover:bg-gold/20 transition-all disabled:opacity-50"
    >
      {status === "done" ? (
        <>
          <Check size={14} />
          Copied!
        </>
      ) : status === "copying" ? (
        <>
          <Download size={14} className="animate-pulse" />
          Exporting...
        </>
      ) : (
        <>
          <Share2 size={14} />
          Share Snapshot
        </>
      )}
    </button>
  );
}
