import { MOCK_ACTIVITY_EVENTS } from "../data/mock-atividades";
import type { ActivityEvent } from "../types";

const MOCK_LOADING_DELAY_MS = 600;

let inMemoryEvents: ActivityEvent[] = [...MOCK_ACTIVITY_EVENTS];

export async function fetchActivityEvents(): Promise<ActivityEvent[]> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LOADING_DELAY_MS));
  return [...inMemoryEvents].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export function appendActivityEvent(event: ActivityEvent): void {
  inMemoryEvents = [event, ...inMemoryEvents];
}

export function resetActivityEventsForTests(events: ActivityEvent[] = MOCK_ACTIVITY_EVENTS): void {
  inMemoryEvents = [...events];
}
