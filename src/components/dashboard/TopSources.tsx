"use client";

import { Card } from "@/components/shared/Card";
import { ExternalLink } from "lucide-react";

interface TopSourcesProps {
  data: ({ url: string; count: number } | string)[];
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

export function TopSources({ data }: TopSourcesProps) {
  const sources = (data || []).slice(0, 8).map((item) =>
    typeof item === "string" ? { url: item, count: 0 } : item
  );

  if (sources.length === 0) {
    return (
      <Card title="热门引用来源">
        <div className="h-48 flex items-center justify-center text-text-tertiary text-sm">
          暂无来源数据
        </div>
      </Card>
    );
  }

  return (
    <Card title="热门引用来源">
      <div className="space-y-2">
        {sources.map((source, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-text-tertiary text-xs w-5 shrink-0">
                {i + 1}
              </span>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text-primary hover:text-gold truncate flex items-center gap-1.5 transition-colors"
              >
                {extractDomain(source.url)}
                <ExternalLink size={12} className="shrink-0 text-text-tertiary" />
              </a>
            </div>
            <span className="text-sm font-medium text-text-secondary ml-3">
              {source.count}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
