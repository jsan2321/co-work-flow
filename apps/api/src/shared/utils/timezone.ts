let supportedTimeZones: Set<string> | null = null;

export function isValidIanaTimezone(timeZone: string): boolean {
  if (!timeZone || typeof timeZone !== "string") {
    return false;
  }

  if (!supportedTimeZones) {
    if (typeof Intl !== "undefined" && typeof (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf === "function") {
      supportedTimeZones = new Set((Intl as unknown as { supportedValuesOf: (key: string) => string[] }).supportedValuesOf("timeZone"));
    } else {
      supportedTimeZones = new Set();
    }
  }

  if (supportedTimeZones.size > 0) {
    return supportedTimeZones.has(timeZone) || timeZone === "UTC";
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function normalizeToUtc(input: string | Date): Date {
  const date = typeof input === "string" ? new Date(input) : input;
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }
  return date;
}

export function doIntervalsOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  // Half-open interval semantics [start, end)
  // Two intervals [A_start, A_end) and [B_start, B_end) overlap iff A_start < B_end && A_end > B_start
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}
