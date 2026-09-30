import { describe, expect, it } from "vitest";
import { lagState, macsecCiphers, macsecOutcome, maxMembers } from "./lag";

describe("LAG", () => {
  it("caps members by speed", () => {
    expect(maxMembers(1)).toBe(4);
    expect(maxMembers(10)).toBe(4);
    expect(maxMembers(100)).toBe(2);
    expect(maxMembers(400)).toBe(2);
    // 2 x 400G is the largest possible LAG.
    expect(maxMembers(400) * 400).toBe(800);
  });

  it("stays up with minLinks 0 as long as one member works", () => {
    expect(lagState(10, 1, 0)).toEqual({ operational: true, capacity: 10 });
    expect(lagState(10, 0, 0)).toEqual({ operational: false, capacity: 0 });
  });

  it("goes down entirely below minLinks", () => {
    expect(lagState(10, 3, 3)).toEqual({ operational: true, capacity: 30 });
    expect(lagState(10, 2, 3)).toEqual({ operational: false, capacity: 0 });
  });
});

describe("MACsec", () => {
  it("should_encrypt falls back to cleartext, must_encrypt drops", () => {
    expect(macsecOutcome("should_encrypt", true)).toBe("encrypted");
    expect(macsecOutcome("must_encrypt", true)).toBe("encrypted");
    expect(macsecOutcome("should_encrypt", false)).toBe("cleartext");
    expect(macsecOutcome("must_encrypt", false)).toBe("dropped");
  });

  it("requires XPN at 100G and above, none on 1G", () => {
    expect(macsecCiphers(1)).toEqual([]);
    expect(macsecCiphers(10)).toContain("GCM-AES-256");
    expect(macsecCiphers(100)).toEqual(["GCM-AES-XPN-256"]);
    expect(macsecCiphers(400)).toEqual(["GCM-AES-XPN-256"]);
  });
});

describe("LAG edge cases", () => {
  it("minimum links above the member count keeps the LAG down", () => {
    expect(lagState(100, 2, 3)).toEqual({ operational: false, capacity: 0 });
    expect(lagState(400, 2, 2)).toEqual({ operational: true, capacity: 800 });
  });
});
