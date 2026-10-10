import { describe, expect, it } from "vitest";
import { ON_RAMP, onRampUrl } from "./onramp";

describe("onRampUrl", () => {
  it("links the English site without a query", () => {
    expect(onRampUrl("en")).toBe(ON_RAMP);
    expect(onRampUrl("en", "routing")).toBe(`${ON_RAMP}#routing`);
  });

  it("carries ?lang=ja before the section hash", () => {
    expect(onRampUrl("ja")).toBe(`${ON_RAMP}?lang=ja`);
    expect(onRampUrl("ja", "hubs")).toBe(`${ON_RAMP}?lang=ja#hubs`);
  });
});
