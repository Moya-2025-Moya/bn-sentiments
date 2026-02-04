"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { SentimentSnapshot, SentimentEvent, AlertLevel } from "@/lib/types";

interface RealtimeContextType {
  latestSnapshot: SentimentSnapshot | null;
  previousSnapshot: SentimentSnapshot | null;
  activeEvents: SentimentEvent[];
  alertLevel: AlertLevel;
}

const RealtimeContext = createContext<RealtimeContextType>({
  latestSnapshot: null,
  previousSnapshot: null,
  activeEvents: [],
  alertLevel: "green",
});

export function RealtimeProvider({
  children,
  initialSnapshot,
  initialPreviousSnapshot,
  initialEvents,
}: {
  children: ReactNode;
  initialSnapshot: SentimentSnapshot | null;
  initialPreviousSnapshot: SentimentSnapshot | null;
  initialEvents: SentimentEvent[];
}) {
  const [latestSnapshot, setLatestSnapshot] = useState(initialSnapshot);
  const [previousSnapshot, setPreviousSnapshot] = useState(initialPreviousSnapshot);
  const [activeEvents, setActiveEvents] = useState(initialEvents);

  const alertLevel: AlertLevel =
    (latestSnapshot?.alert_level as AlertLevel) ?? "green";

  const handleSnapshotInsert = useCallback(
    (payload: { new: SentimentSnapshot }) => {
      setPreviousSnapshot(latestSnapshot);
      setLatestSnapshot(payload.new as SentimentSnapshot);
    },
    [latestSnapshot]
  );

  const handleEventChange = useCallback(
    (payload: { eventType: string; new: SentimentEvent; old: { id: string } }) => {
      if (payload.eventType === "INSERT") {
        setActiveEvents((prev) => [payload.new as SentimentEvent, ...prev]);
      } else if (payload.eventType === "UPDATE") {
        setActiveEvents((prev) =>
          prev.map((e) =>
            e.id === (payload.new as SentimentEvent).id
              ? (payload.new as SentimentEvent)
              : e
          )
        );
      }
    },
    []
  );

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sentiment_snapshots" },
        handleSnapshotInsert as any
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        handleEventChange as any
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleSnapshotInsert, handleEventChange]);

  return (
    <RealtimeContext.Provider
      value={{ latestSnapshot, previousSnapshot, activeEvents, alertLevel }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export const useRealtime = () => useContext(RealtimeContext);
