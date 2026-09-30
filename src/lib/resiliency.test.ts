import { describe, expect, it } from "vitest";
import {
  MODELS,
  evaluate,
  survivesAnyConnectionLoss,
  survivesAnyLocationLoss,
  survivesLocationPlusConnection,
} from "./resiliency";

describe("resiliency models", () => {
  it("have the shapes the toolkit describes", () => {
    expect(MODELS.maximum.locations).toHaveLength(2);
    expect(MODELS.maximum.connections).toHaveLength(4);
    expect(MODELS.high.locations).toHaveLength(2);
    expect(MODELS.high.connections).toHaveLength(2);
    expect(MODELS.dev.locations).toHaveLength(1);
    expect(MODELS.dev.connections).toHaveLength(2);
    expect(MODELS.single.connections).toHaveLength(1);
  });

  it.each([
    ["maximum", true, true, true],
    ["high", true, true, false],
    ["dev", true, false, false],
    ["single", false, false, false],
  ] as const)("%s: conn=%s loc=%s loc+conn=%s", (id, conn, loc, both) => {
    const m = MODELS[id];
    expect(survivesAnyConnectionLoss(m)).toBe(conn);
    expect(survivesAnyLocationLoss(m)).toBe(loc);
    expect(survivesLocationPlusConnection(m)).toBe(both);
  });

  it("reports remaining capacity", () => {
    const o = evaluate(MODELS.maximum, { connections: [], locations: ["loc1"] });
    expect(o.connected).toBe(true);
    expect(o.surviving).toEqual(["loc2-c1", "loc2-c2"]);
    expect(o.capacity).toBe(0.5);
  });

  it("is down when everything failed", () => {
    const o = evaluate(MODELS.high, { connections: [], locations: ["loc1", "loc2"] });
    expect(o).toEqual({ connected: false, surviving: [], capacity: 0 });
  });
});
