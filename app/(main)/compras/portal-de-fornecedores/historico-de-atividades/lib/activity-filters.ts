import {
  PO_FRS_EVENT_TYPES,
  type ActivityEvent,
  type ActivityEventFilterValue,
} from "../types";

export type ActivityFiltersState = {
  search: string;
  eventType: ActivityEventFilterValue;
  startDate: string;
  endDate: string;
  responsible: string;
};

export const DEFAULT_ACTIVITY_FILTERS: ActivityFiltersState = {
  search: "",
  eventType: "all",
  startDate: "",
  endDate: "",
  responsible: "",
};

function parseBrazilianDate(value: string): Date | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    parsed.getFullYear() !== Number(year) ||
    parsed.getMonth() !== Number(month) - 1 ||
    parsed.getDate() !== Number(day)
  ) {
    return null;
  }
  return parsed;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function formatActivityDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatActivityTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatActivityDateTime(isoDate: string): string {
  return `${formatActivityDate(isoDate)} às ${formatActivityTime(isoDate)}`;
}

function matchesEventType(event: ActivityEvent, filter: ActivityEventFilterValue): boolean {
  if (filter === "all") return true;
  if (filter === "po-frs-vinculada") return PO_FRS_EVENT_TYPES.includes(event.eventType);
  return event.eventType === filter;
}

function matchesSearch(event: ActivityEvent, search: string): boolean {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) return true;

  const haystack = [
    event.description,
    event.responsibleName,
    event.responsibleEmail,
    event.targetName,
    event.targetReference,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedSearch);
}

function matchesResponsible(event: ActivityEvent, responsible: string): boolean {
  const normalizedResponsible = responsible.trim().toLowerCase();
  if (!normalizedResponsible) return true;

  return (
    event.responsibleName.toLowerCase().includes(normalizedResponsible) ||
    event.responsibleEmail.toLowerCase().includes(normalizedResponsible)
  );
}

function matchesDateRange(event: ActivityEvent, startDate: string, endDate: string): boolean {
  const eventDate = new Date(event.createdAt);
  const parsedStart = startDate ? parseBrazilianDate(startDate) : null;
  const parsedEnd = endDate ? parseBrazilianDate(endDate) : null;

  if (parsedStart && eventDate < startOfDay(parsedStart)) return false;
  if (parsedEnd && eventDate > endOfDay(parsedEnd)) return false;
  return true;
}

export function filterActivityEvents(
  events: ActivityEvent[],
  filters: ActivityFiltersState,
): ActivityEvent[] {
  return events
    .filter((event) => matchesEventType(event, filters.eventType))
    .filter((event) => matchesSearch(event, filters.search))
    .filter((event) => matchesResponsible(event, filters.responsible))
    .filter((event) => matchesDateRange(event, filters.startDate, filters.endDate))
    .sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
}

export function hasActiveActivityFilters(filters: ActivityFiltersState): boolean {
  return (
    Boolean(filters.search.trim()) ||
    filters.eventType !== "all" ||
    Boolean(filters.startDate.trim()) ||
    Boolean(filters.endDate.trim()) ||
    Boolean(filters.responsible.trim())
  );
}

export function getActivityReference(event: ActivityEvent): string {
  return event.targetReference ?? event.targetName ?? "—";
}
