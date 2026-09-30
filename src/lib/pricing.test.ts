import { describe, expect, it } from "vitest";
import {
  DTO_PER_GB,
  FLAT_RATE_EXAMPLE,
  PORT_HOURLY,
  breakEvenGb,
  estimate,
  portHourly,
} from "./pricing";

describe("pricing", () => {
  // Both examples are the worked scenarios on the AWS pricing page.
  it("reproduces AWS's high-resiliency hosted example ($984.08)", () => {
    const r = estimate({
      type: "hosted",
      mbps: 2000,
      count: 2,
      dxGeo: "us",
      source: "us",
      gbOut: 1024,
    });
    expect(r).toEqual({ portHourly: 0.66, port: 963.6, dto: 20.48, total: 984.08 });
  });

  it("reproduces AWS's maximum-resiliency dedicated example ($14,762)", () => {
    const r = estimate({
      type: "dedicated",
      mbps: 10000,
      count: 4,
      dxGeo: "us",
      source: "us",
      gbOut: 409600,
    });
    expect(r.port).toBe(6570);
    expect(r.dto).toBe(8192);
    expect(r.total).toBe(14762);
  });

  it("uses Japan port prices at Japanese locations", () => {
    expect(portHourly("dedicated", 1000, "japan")).toBe(0.285);
    expect(portHourly("dedicated", 1000, "us")).toBe(0.3);
    expect(portHourly("dedicated", 100000, "japan")).toBe(22.5);
  });

  it("rejects speeds that do not exist", () => {
    expect(() => portHourly("dedicated", 25000, "us")).toThrow();
  });

  it("has a DTO rate for every source/location pair", () => {
    for (const row of Object.values(DTO_PER_GB)) {
      for (const v of Object.values(row)) expect(v).toBeGreaterThan(0);
    }
    expect(Object.keys(PORT_HOURLY.dedicated)).toEqual([
      "1000",
      "10000",
      "100000",
      "400000",
    ]);
  });

  it("matches the ~230 TB break-even for a 10G Tier 1 port-pair", () => {
    const f = FLAT_RATE_EXAMPLE;
    const gb = breakEvenGb(f.hourly, f.paygPortHourly, f.paygPorts, f.dtoPerGb);
    expect(Math.round(gb)).toBe(235790);
    expect(breakEvenGb(1, 2.25, 2, 0.02)).toBe(0);
  });
});
