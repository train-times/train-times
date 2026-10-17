import { describe, expect, it } from "bun:test";

import { getDurationMinutes, normalizeTrainServicesData } from "#lib/normalize";

import { example1 } from "./fixtures/example-1";
import { example2 } from "./fixtures/example-2";
import { example3 } from "./fixtures/example-3";
import { example4 } from "./fixtures/example-4";
import { example5 } from "./fixtures/example-5";

describe("normalizeTrainServicesData", () => {
  it("example 1", () => {
    expect(normalizeTrainServicesData(example1)).toMatchSnapshot();
  });

  it("example 2", () => {
    expect(normalizeTrainServicesData(example2)).toMatchSnapshot();
  });

  it("example 3", () => {
    expect(normalizeTrainServicesData(example3)).toMatchSnapshot();
  });

  it("example 4", () => {
    expect(normalizeTrainServicesData(example4)).toMatchSnapshot();
  });

  it("example 5", () => {
    expect(normalizeTrainServicesData(example5)).toMatchSnapshot();
  });
});

describe("getDurationMinutes", () => {
  it("returns null when fromTime is null", () => {
    expect(getDurationMinutes(null, "10:30")).toBeNull();
  });

  it("returns null when toTime is null", () => {
    expect(getDurationMinutes("10:00", null)).toBeNull();
  });

  it("returns null when either time is Delayed", () => {
    expect(getDurationMinutes("Delayed", "10:30")).toBeNull();
    expect(getDurationMinutes("10:00", "Delayed")).toBeNull();
  });

  it("returns the difference in minutes", () => {
    expect(getDurationMinutes("10:00", "10:45")).toBe(45);
    expect(getDurationMinutes("09:15", "11:00")).toBe(105);
  });

  it("returns 0 for identical times", () => {
    expect(getDurationMinutes("10:00", "10:00")).toBe(0);
    expect(getDurationMinutes("12:30", "12:30")).toBe(0);
  });

  it("wraps past midnight", () => {
    expect(getDurationMinutes("23:45", "00:15")).toBe(30);
    expect(getDurationMinutes("23:00", "01:00")).toBe(120);
  });

  it("handles midnight as a valid hour", () => {
    expect(getDurationMinutes("00:00", "01:00")).toBe(60);
    expect(getDurationMinutes("01:00", "00:30")).toBe(1410);
  });

  it("returns null for invalid times", () => {
    expect(getDurationMinutes("abc", "10:00")).toBeNull();
    expect(getDurationMinutes("10:00", "foo")).toBeNull();
  });
});
