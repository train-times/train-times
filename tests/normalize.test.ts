import { describe, expect, it } from "bun:test";

import { normalizeTrainServicesData } from "#lib/normalize";

import { example1 } from "./fixtures/example-1";
import { example2 } from "./fixtures/example-2";
import { example3 } from "./fixtures/example-3";

describe("normalizeTrainServicesData", () => {
  it("example 1", () => {
    expect(normalizeTrainServicesData(example1, "WIN")).toMatchSnapshot();
  });

  it("example 2", () => {
    expect(normalizeTrainServicesData(example2, "WIN")).toMatchSnapshot();
  });

  it("example 3", () => {
    expect(normalizeTrainServicesData(example3, "WAT")).toMatchSnapshot();
  });
});
