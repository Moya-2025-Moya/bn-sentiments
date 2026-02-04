import { Header } from "@/components/shared/Header";
import { EventsPageClient } from "@/components/events/EventsPageClient";
import { isSupabaseConfigured, dataStore } from "@/lib/store";

export const dynamic = "force-dynamic";

async function getEvents() {
  if (isSupabaseConfigured()) {
    const { createServiceClient } = await import("@/lib/supabase/server");
    const supabase = createServiceClient();

    const { data } = await supabase
      .from("events")
      .select("*")
      .in("status", ["active", "monitoring"])
      .order("created_at", { ascending: false });

    return data || [];
  }

  return dataStore.getActiveEvents();
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <Header
        title="事件与推文"
        subtitle="Grok AI 检测到的舆情推文 · 按事件归类"
      />
      <EventsPageClient events={events} />
    </>
  );
}
