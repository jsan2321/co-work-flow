import { describe, it, expect } from "vitest";
import {
  isValidIanaTimezone,
  normalizeToUtc,
  doIntervalsOverlap,
} from "../../src/shared/utils/timezone.js";

describe("timezone and interval utilities", () => {
  describe("isValidIanaTimezone", () => {
    it("returns true for valid IANA timezones", () => {
      expect(isValidIanaTimezone("America/Los_Angeles")).toBe(true);
      expect(isValidIanaTimezone("Europe/London")).toBe(true);
      expect(isValidIanaTimezone("UTC")).toBe(true);
    });

    it("returns false for invalid timezone identifiers", () => {
      expect(isValidIanaTimezone("Invalid/Zone")).toBe(false);
      expect(isValidIanaTimezone("PST")).toBe(false);
      expect(isValidIanaTimezone("")).toBe(false);
    });
  });

  describe("normalizeToUtc", () => {
    it("parses valid ISO strings into Date objects", () => {
      const date = normalizeToUtc("2026-10-15T14:00:00.000Z");
      expect(date.toISOString()).toBe("2026-10-15T14:00:00.000Z");
    });

    it("throws on invalid date string", () => {
      expect(() => normalizeToUtc("not-a-date")).toThrow("Invalid date format");
    });
  });

  describe("doIntervalsOverlap (half-open [start, end))", () => {
    it("returns true for overlapping intervals", () => {
      const aStart = new Date("2026-10-15T10:00:00.000Z");
      const aEnd = new Date("2026-10-15T12:00:00.000Z");

      const bStart = new Date("2026-10-15T11:00:00.000Z");
      const bEnd = new Date("2026-10-15T13:00:00.000Z");

      expect(doIntervalsOverlap(aStart, aEnd, bStart, bEnd)).toBe(true);
    });

    it("returns false for strictly adjacent intervals under [start, end) semantics", () => {
      const aStart = new Date("2026-10-15T10:00:00.000Z");
      const aEnd = new Date("2026-10-15T11:00:00.000Z");

      const bStart = new Date("2026-10-15T11:00:00.000Z");
      const bEnd = new Date("2026-10-15T12:00:00.000Z");

      expect(doIntervalsOverlap(aStart, aEnd, bStart, bEnd)).toBe(false);
    });

    it("returns false for completely disjoint intervals", () => {
      const aStart = new Date("2026-10-15T09:00:00.000Z");
      const aEnd = new Date("2026-10-15T10:00:00.000Z");

      const bStart = new Date("2026-10-15T14:00:00.000Z");
      const bEnd = new Date("2026-10-15T15:00:00.000Z");

      expect(doIntervalsOverlap(aStart, aEnd, bStart, bEnd)).toBe(false);
    });
  });
});
