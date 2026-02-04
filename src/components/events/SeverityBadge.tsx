import type { Severity } from "@/lib/types";
import { SEVERITY_CONFIG } from "@/lib/constants";

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config = SEVERITY_CONFIG[severity];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.bg} ${config.color} ${config.border}`}
    >
      {config.label}
    </span>
  );
}

export function NewRecycledBadge({ isNew }: { isNew: boolean }) {
  return isNew ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gold/15 text-gold border border-gold/30">
      新爆点
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-bg-card-hover text-text-tertiary border border-border-default">
      炒冷饭
    </span>
  );
}

export function TierBadge({ tier }: { tier: 1 | 2 }) {
  return tier === 1 ? (
    <span className="inline-flex items-center gap-1 text-xs text-gold">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      一级信源
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs text-text-tertiary">
      <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
      二级信源
    </span>
  );
}
