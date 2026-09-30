import { describe, expect, it } from "vitest";
import { contains, formatCidr, overlaps, parseCidr } from "./cidr";
import { advertised } from "./dxgw";

const c = (s: string) => {
  const r = parseCidr(s);
  if (!r) throw new Error(s);
  return r;
};

describe("cidr", () => {
  it("parses and normalises", () => {
    expect(formatCidr(c("10.0.0.1/16"))).toBe("10.0.0.0/16");
    expect(formatCidr(c("0.0.0.0/0"))).toBe("0.0.0.0/0");
    expect(parseCidr("10.0.0.0/33")).toBeNull();
    expect(parseCidr("256.0.0.0/8")).toBeNull();
    expect(parseCidr("nope")).toBeNull();
  });

  it("checks containment", () => {
    expect(contains(c("10.0.0.0/15"), c("10.0.0.0/16"))).toBe(true);
    expect(contains(c("10.0.0.0/16"), c("10.0.0.0/16"))).toBe(true);
    expect(contains(c("10.0.0.0/24"), c("10.0.0.0/16"))).toBe(false);
    expect(contains(c("10.2.0.0/15"), c("10.0.0.0/16"))).toBe(false);
    expect(overlaps(c("10.0.0.0/24"), c("10.0.0.0/16"))).toBe(true);
    expect(overlaps(c("22.0.0.0/24"), c("10.0.0.0/16"))).toBe(false);
  });
});

describe("allowed prefixes (AWS documented examples)", () => {
  const vpc = [c("10.0.0.0/16")];
  it.each([
    ["10.0.0.0/15", ["10.0.0.0/16"], ["10.0.0.0/15"]],
    ["10.0.0.0/16", ["10.0.0.0/16"], ["10.0.0.0/16"]],
    ["10.0.0.0/24", [], ["10.0.0.0/24"]],
    ["22.0.0.0/24", [], ["22.0.0.0/24"]],
  ])("allowed %s → VGW %j, TGW %j", (p, vgw, tgw) => {
    expect(advertised("vgw", vpc, [c(p)])).toEqual(vgw);
    expect(advertised("tgw", vpc, [c(p)])).toEqual(tgw);
  });
});

describe("cidr edge cases", () => {
  it("rejects leading zeros, accepts the extremes", () => {
    expect(parseCidr("010.0.0.0/8")).toBeNull();
    expect(parseCidr("10.0.0.0/08")).toBeNull();
    expect(parseCidr(" 10.0.0.0/8\n")).not.toBeNull();
    expect(formatCidr(c("255.255.255.255/32"))).toBe("255.255.255.255/32");
    expect(contains(c("0.0.0.0/0"), c("203.0.113.7/32"))).toBe(true);
  });
});
