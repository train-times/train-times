import { describe, expect, it } from "bun:test";

import { normalizeTrainServicesData } from "#lib/normalize";

import { example1 } from "./fixtures/example-1";
import { example2 } from "./fixtures/example-2";
import { example3 } from "./fixtures/example-3";
import { example4 } from "./fixtures/example-4";

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
});
