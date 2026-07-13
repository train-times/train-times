import { describe, expect, it } from "bun:test";

import { normalizeTrainServicesData } from "../src/normalize";
import { example1 } from "./fixtures/example-1";
import { example2 } from "./fixtures/example-2";

describe("normalizeTrainServicesData", () => {
  it("example 1", () => {
    expect(normalizeTrainServicesData(example1, "WIN")).toMatchSnapshot();
  });

  it("example 2", () => {
    expect(normalizeTrainServicesData(example2, "WIN")).toMatchSnapshot();
  });
});
