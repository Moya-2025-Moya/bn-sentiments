// In-memory data store - works without Supabase
// Data persists during server runtime, resets on restart
// When Supabase is configured, this is bypassed

import type {
  SentimentSnapshot,
  SentimentEvent,
  CompetitorSnapshot,
  Mention,
  Report,
} from "./types";

class DataStore {
  snapshots: SentimentSnapshot[] = [];
  events: SentimentEvent[] = [];
  mentions: Mention[] = [];
  competitorSnapshots: CompetitorSnapshot[] = [];
  reports: Report[] = [];
  latestBriefing: Record<string, unknown> | null = null;

  addSnapshot(snapshot: Omit<SentimentSnapshot, "id">) {
    const entry: SentimentSnapshot = {
      ...snapshot,
      id: crypto.randomUUID(),
    };
    this.snapshots.push(entry);
    return entry;
  }

  addEvent(event: Omit<SentimentEvent, "id" | "created_at" | "updated_at">) {
    const now = new Date().toISOString();
    const entry: SentimentEvent = {
      ...event,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };
    this.events.push(entry);
    return entry;
  }

  addMentions(mentions: Omit<Mention, "id">[]) {
    const entries = mentions.map((m) => ({
      ...m,
      id: crypto.randomUUID(),
    }));
    this.mentions.push(...entries);
    return entries;
  }

  addCompetitorSnapshot(snapshot: Omit<CompetitorSnapshot, "id">) {
    const entry: CompetitorSnapshot = {
      ...snapshot,
      id: crypto.randomUUID(),
    };
    this.competitorSnapshots.push(entry);
    return entry;
  }

  getLatestSnapshot(): SentimentSnapshot | null {
    return this.snapshots.length > 0
      ? this.snapshots[this.snapshots.length - 1]
      : null;
  }

  getPreviousSnapshot(): SentimentSnapshot | null {
    return this.snapshots.length > 1
      ? this.snapshots[this.snapshots.length - 2]
      : null;
  }

  getSnapshots24h(): SentimentSnapshot[] {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    return this.snapshots.filter(
      (s) => new Date(s.timestamp).getTime() > since
    );
  }

  getActiveEvents(): SentimentEvent[] {
    return this.events
      .filter((e) => e.status === "active" || e.status === "monitoring")
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }

  getCompetitorSnapshots24h(): CompetitorSnapshot[] {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    return this.competitorSnapshots.filter(
      (s) => new Date(s.timestamp).getTime() > since
    );
  }

  hasData(): boolean {
    return this.snapshots.length > 0;
  }
}

// Singleton
export const dataStore = new DataStore();

export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-project.supabase.co" &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== "your-service-role-key"
  );
}
