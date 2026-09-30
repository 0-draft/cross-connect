import { describe, expect, it } from "vitest";
import { type Answers, recommend } from "./advisor";

const base: Answers = {
  production: true,
  needs9999: false,
  scale: "few",
  publicServices: false,
  encryption: "none",
  gbps: 5,
  siteToSite: false,
};

describe("recommend", () => {
  it("maps criticality to a resiliency model", () => {
    expect(recommend({ ...base, production: false }).resiliency).toBe("dev");
    expect(recommend(base).resiliency).toBe("high");
    expect(recommend({ ...base, needs9999: true }).resiliency).toBe("maximum");
  });

  it("rounds bandwidth up to a real port speed", () => {
    expect(recommend({ ...base, gbps: 0.5 })).toMatchObject({
      connection: "hosted",
      portGbps: 0.5,
    });
    expect(recommend({ ...base, gbps: 1 })).toMatchObject({
      connection: "dedicated",
      portGbps: 1,
    });
    expect(recommend({ ...base, gbps: 5 })).toMatchObject({
      connection: "dedicated",
      portGbps: 10,
    });
    expect(recommend({ ...base, gbps: 250 })).toMatchObject({ portGbps: 400 });
    expect(recommend({ ...base, gbps: 600 })).toMatchObject({
      connection: "dedicated-lag",
    });
  });

  it("picks the gateway by scale", () => {
    expect(recommend(base)).toMatchObject({ attach: "vgw", vif: "private" });
    expect(recommend({ ...base, scale: "many" })).toMatchObject({
      attach: "tgw",
      vif: "transit",
    });
    expect(recommend({ ...base, scale: "global" })).toMatchObject({ attach: "cloudwan" });
  });

  it("uses MACsec only where it exists", () => {
    expect(recommend({ ...base, encryption: "link", gbps: 10 }).macsec).toBe(true);
    const slow = recommend({ ...base, encryption: "link", gbps: 1 });
    expect(slow.macsec).toBe(false);
    expect(slow.privateIpVpn).toBe(true);
  });

  it("end-to-end encryption means Private IP VPN over a transit VIF", () => {
    const p = recommend({ ...base, encryption: "end-to-end" });
    expect(p).toMatchObject({ privateIpVpn: true, vif: "transit", attach: "tgw" });
  });

  it("passes through public VIF and SiteLink", () => {
    expect(recommend({ ...base, publicServices: true, siteToSite: true })).toMatchObject({
      publicVif: true,
      siteLink: true,
    });
  });
});
