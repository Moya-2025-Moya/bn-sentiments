"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <AlertTriangle size={48} className="text-negative mx-auto" />
        <h2 className="text-xl font-display font-bold text-text-primary">
          Something went wrong
        </h2>
        <p className="text-sm text-text-secondary max-w-md">
          {error.message || "An unexpected error occurred while loading this page."}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold text-bg-darkest font-medium text-sm hover:bg-gold-hover transition-all"
        >
          <RefreshCw size={14} />
          Try Again
        </button>
      </div>
    </div>
  );
}
