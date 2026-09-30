import { describe, expect, it } from "vitest";
import { type Path, isAsymmetric, localPrefValue, selectPath } from "./routing";

const dx = (id: string, over: Partial<Path> = {}): Path => ({
  id,
  kind: "dx",
  up: true,
  prefixLength: 16,
  community: null,
  prepend: 0,
  homeRegion: true,
  ...over,
});

describe("selectPath", () => {
  it("returns nothing when every path is down", () => {
    expect(selectPath([dx("a", { up: false })])).toEqual({
      winners: [],
      decidedBy: "no-path",
    });
  });

  it("uses the only surviving path", () => {
    expect(selectPath([dx("a"), dx("b", { up: false })])).toEqual({
      winners: ["a"],
      decidedBy: "only-path",
    });
  });

  it("longest prefix beats everything, even a VPN over DX", () => {
    const r = selectPath([
      dx("dx", { community: "7224:7300" }),
      { ...dx("vpn", { prefixLength: 24 }), kind: "vpn-bgp" },
    ]);
    expect(r).toEqual({ winners: ["vpn"], decidedBy: "longest-prefix" });
  });

  it("prefers DX over VPN static over VPN BGP for the same prefix", () => {
    expect(
      selectPath([
        dx("dx"),
        { ...dx("s"), kind: "vpn-static" },
        { ...dx("b"), kind: "vpn-bgp" },
      ]),
    ).toEqual({ winners: ["dx"], decidedBy: "path-type" });
    expect(
      selectPath([
        { ...dx("s"), kind: "vpn-static" },
        { ...dx("b"), kind: "vpn-bgp" },
      ]),
    ).toEqual({ winners: ["s"], decidedBy: "path-type" });
  });

  it("local preference is evaluated before AS_PATH", () => {
    const r = selectPath([
      dx("primary", { community: "7224:7300", prepend: 5 }),
      dx("secondary", { community: "7224:7100" }),
    ]);
    expect(r).toEqual({ winners: ["primary"], decidedBy: "local-preference" });
  });

  it("untagged routes prefer locations in the sending Region", () => {
    expect(localPrefValue(null, true)).toBe(localPrefValue("7224:7200", true));
    expect(localPrefValue(null, false)).toBeLessThan(localPrefValue(null, true));
    expect(localPrefValue(null, false)).toBeGreaterThan(
      localPrefValue("7224:7100", false),
    );
    const home = selectPath([dx("home"), dx("remote", { homeRegion: false })]);
    expect(home).toEqual({ winners: ["home"], decidedBy: "local-preference" });
  });

  it("the same explicit tag load-balances regardless of home Region", () => {
    const r = selectPath([
      dx("a", { community: "7224:7200" }),
      dx("b", { community: "7224:7200", homeRegion: false }),
    ]);
    expect(r).toEqual({ winners: ["a", "b"], decidedBy: "ecmp" });
  });

  it("an untagged home-Region route beats a low-tagged one", () => {
    const r = selectPath([dx("plain"), dx("low", { community: "7224:7100" })]);
    expect(r.winners).toEqual(["plain"]);
  });

  it("shorter AS_PATH wins when local preference ties", () => {
    const r = selectPath([dx("a", { prepend: 2 }), dx("b")]);
    expect(r).toEqual({ winners: ["b"], decidedBy: "as-path" });
  });

  it("load-balances across equal paths", () => {
    const r = selectPath([dx("a"), dx("b"), dx("c", { prepend: 1 })]);
    expect(r).toEqual({ winners: ["a", "b"], decidedBy: "ecmp" });
  });
});

describe("isAsymmetric", () => {
  it("flags when your router and AWS pick different paths", () => {
    expect(isAsymmetric(["DX-A"], "DX-A")).toBe(false);
    expect(isAsymmetric(["DX-A"], "DX-B")).toBe(true);
    // ECMP on the AWS side still includes your choice.
    expect(isAsymmetric(["DX-A", "DX-B"], "DX-B")).toBe(false);
    expect(isAsymmetric([], "DX-A")).toBe(false);
    expect(isAsymmetric(["DX-A"], null)).toBe(false);
  });
});
