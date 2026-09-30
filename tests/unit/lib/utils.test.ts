import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clampDateRange,
  clampNumber,
  formatUtcDate,
  isValidDateString,
  parseIntParam,
  toIsoDate,
} from "@/lib/utils";

describe("isValidDateString", () => {
  it("accepts YYYY-MM-DD and rejects anything else", () => {
    expect(isValidDateString("2026-09-30")).toBe(true);
    expect(isValidDateString("2026-9-30")).toBe(false);
    expect(isValidDateString("2026-13-45")).toBe(false);
    expect(isValidDateString("")).toBe(false);
    expect(isValidDateString(undefined)).toBe(false);
    expect(isValidDateString(null)).toBe(false);
  });
});

describe("toIsoDate", () => {
  it("returns the UTC calendar date", () => {
    expect(toIsoDate(new Date("2026-09-30T23:59:59Z"))).toBe("2026-09-30");
  });
});

describe("clampDateRange", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("defaults to the last `defaultDays` days ending today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-30T12:00:00Z"));
    expect(clampDateRange(undefined, undefined, 30, 7)).toEqual({
      startDate: "2026-09-23",
      endDate: "2026-09-30",
    });
  });

  it("shortens a range longer than maxDays from the start", () => {
    expect(clampDateRange("2026-01-01", "2026-09-30", 30)).toEqual({
      startDate: "2026-08-31",
      endDate: "2026-09-30",
    });
  });

  it("swaps a reversed range", () => {
    expect(clampDateRange("2026-09-10", "2026-09-01", 30)).toEqual({
      startDate: "2026-09-01",
      endDate: "2026-09-10",
    });
  });

  it("ignores invalid dates", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-30T12:00:00Z"));
    expect(clampDateRange("garbage", "2026-99-99", 30, 2)).toEqual({
      startDate: "2026-09-28",
      endDate: "2026-09-30",
    });
  });
});

describe("clampNumber / parseIntParam", () => {
  it("clamps into range", () => {
    expect(clampNumber(5, 1, 3)).toBe(3);
    expect(clampNumber(-5, 1, 3)).toBe(1);
    expect(clampNumber(2, 1, 3)).toBe(2);
  });

  it("parses, falls back, and clamps", () => {
    expect(parseIntParam("7", 1, 1, 100)).toBe(7);
    expect(parseIntParam("abc", 1, 1, 100)).toBe(1);
    expect(parseIntParam(undefined, 4, 1, 100)).toBe(4);
    expect(parseIntParam("500", 1, 1, 100)).toBe(100);
    expect(parseIntParam("0", 1, 1, 100)).toBe(1);
  });
});

describe("formatUtcDate", () => {
  it("formats date-only values as that UTC calendar date", () => {
    // Parsed as UTC midnight; a local-time formatter west of UTC would show Sep 1.
    expect(formatUtcDate("2026-09-02")).toBe("Sep 2, 2026");
  });

  it("formats timestamps in UTC with the zone labelled", () => {
    expect(formatUtcDate("2026-09-02T12:23Z", true)).toBe("Sep 2, 2026, 12:23 UTC");
    expect(formatUtcDate("2026-09-02T00:05:00-05:00", true)).toBe("Sep 2, 2026, 05:05 UTC");
  });

  it("returns null for unparseable input", () => {
    expect(formatUtcDate("not a date")).toBeNull();
  });
});
