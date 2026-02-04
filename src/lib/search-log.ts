// Search log system — tracks all Grok API calls for transparency

export interface SearchLogEntry {
  id: string;
  timestamp: string;
  type: "search" | "parse" | "events" | "briefing" | "competitor";
  model: string;
  prompt_summary: string;
  status: "success" | "error";
  duration_ms: number;
  result_summary?: string;
  error?: string;
  mentions_found?: number;
  kol_count?: number;
}

class SearchLogStore {
  logs: SearchLogEntry[] = [];

  add(entry: Omit<SearchLogEntry, "id">) {
    const log: SearchLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
    };
    this.logs.unshift(log); // newest first
    // Keep last 100 entries
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }
    return log;
  }

  getAll(): SearchLogEntry[] {
    return this.logs;
  }

  getRecent(n: number = 20): SearchLogEntry[] {
    return this.logs.slice(0, n);
  }
}

export const searchLogStore = new SearchLogStore();
