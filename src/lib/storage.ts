import { CalendarEvent } from '../types';

const STORAGE_KEY = 'calendar_events';

export function loadEvents(): CalendarEvent[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveEvents(events: CalendarEvent[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function addEvent(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
  const events = loadEvents();
  const newEvent = {
    ...event,
    id: crypto.randomUUID()
  };
  events.push(newEvent);
  saveEvents(events);
  return newEvent;
}

export function updateEvent(event: CalendarEvent): void {
  const events = loadEvents();
  const index = events.findIndex(e => e.id === event.id);
  if (index !== -1) {
    events[index] = event;
    saveEvents(events);
  }
}

export function deleteEvent(id: string): void {
  const events = loadEvents();
  const filtered = events.filter(e => e.id !== id);
  saveEvents(filtered);
}
