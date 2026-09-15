export const LOCATION_TIMEZONE = "America/Los_Angeles";
export const LOCATION_TIMEZONE_LABEL = "PT (Pacific Time)";

export interface TimeSlot {
  id: string;
  startAt: string; // ISO string
  endAt: string; // ISO string
  displayStart: string; // e.g. "09:00 AM"
  displayEnd: string; // e.g. "09:30 AM"
}

/**
 * Formats an ISO date string into a friendly localized date (e.g. "Mon, Sep 15, 2026").
 */
export function formatDate(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    return new Intl.DateTimeFormat("en-US", {
      timeZone: LOCATION_TIMEZONE,
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return isoDateString;
  }
}

/**
 * Formats an ISO date string into localized time (e.g. "02:30 PM").
 */
export function formatTime(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    return new Intl.DateTimeFormat("en-US", {
      timeZone: LOCATION_TIMEZONE,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch {
    return isoDateString;
  }
}

/**
 * Formats a start and end interval (e.g. "09:00 AM – 11:30 AM PT").
 */
export function formatInterval(startAt: string, endAt: string): string {
  return `${formatTime(startAt)} – ${formatTime(endAt)} ${LOCATION_TIMEZONE_LABEL}`;
}

/**
 * Returns human-readable duration between two ISO dates (e.g. "1 hr 30 mins").
 */
export function formatDuration(startAt: string, endAt: string): string {
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  const diffMinutes = Math.max(0, Math.round((end - start) / (1000 * 60)));

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours === 0) return `${minutes} mins`;
  if (minutes === 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
  return `${hours} hr${hours > 1 ? "s" : ""} ${minutes} mins`;
}

/**
 * Checks if a reservation can still be cancelled by a member (now < startAt - 1 hour).
 */
export function isWithinMemberCancellationCutoff(startAt: string): boolean {
  const start = new Date(startAt).getTime();
  const cutoffTime = start - 60 * 60 * 1000; // 1 hour prior to start
  return Date.now() < cutoffTime;
}

/**
 * Generates 30-minute time slots for a given date between 08:00 and 20:00.
 */
export function generateDaySlots(baseDate: Date): TimeSlot[] {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const day = baseDate.getDate();

  const slots: TimeSlot[] = [];

  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotStart = new Date(Date.UTC(year, month, day, hour + 7, minute)); // approximate UTC offset for PT (UTC-7 PDT)
      const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);

      const startIso = slotStart.toISOString();
      const endIso = slotEnd.toISOString();

      slots.push({
        id: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
        startAt: startIso,
        endAt: endIso,
        displayStart: formatTime(startIso),
        displayEnd: formatTime(endIso),
      });
    }
  }

  return slots;
}

/**
 * Returns an array of next N days starting from today.
 */
export function getUpcomingDays(count = 14): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < count; i++) {
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + i);
    days.push(nextDay);
  }

  return days;
}
