import { Header } from "@/components/shared/Header";
import { EventFeed } from "@/components/events/EventFeed";
import { DEMO_EVENTS } from "@/lib/demo-data";

async function getEvents() {
  return DEMO_EVENTS;
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <>
      <Header
        title="事件"
        subtitle="Grok AI 检测到的 FUD 事件"
      />
      <EventFeed events={events} />
    </>
  );
}
