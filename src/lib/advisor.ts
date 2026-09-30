/** Turns a few design answers into a Direct Connect topology recommendation. */

export interface Answers {
  production: boolean;
  needs9999: boolean;
  scale: "few" | "many" | "global";
  publicServices: boolean;
  encryption: "none" | "link" | "end-to-end";
  gbps: number;
  siteToSite: boolean;
}

export type Resiliency = "maximum" | "high" | "dev";
export type Attach = "vgw" | "tgw" | "cloudwan";
export type Conn = "hosted" | "dedicated" | "dedicated-lag";

export interface Plan {
  resiliency: Resiliency;
  connection: Conn;
  vif: "private" | "transit";
  attach: Attach;
  publicVif: boolean;
  macsec: boolean;
  privateIpVpn: boolean;
  siteLink: boolean;
  /** Port speed to order per connection, in Gbps (hosted may be fractional). */
  portGbps: number;
}

const DEDICATED = [1, 10, 100, 400];

export function recommend(a: Answers): Plan {
  const resiliency: Resiliency = !a.production ? "dev" : a.needs9999 ? "maximum" : "high";

  // Hosted tops out at 25G; below 1G only hosted exists. Above 400G per
  // location you need a LAG (2 x 400G = 800G max).
  let connection: Conn;
  let portGbps: number;
  if (a.gbps < 1) {
    connection = "hosted";
    portGbps = a.gbps;
  } else if (a.gbps > 400) {
    connection = "dedicated-lag";
    portGbps = 400;
  } else {
    connection = "dedicated";
    portGbps = DEDICATED.find((s) => s >= a.gbps) ?? 400;
  }

  const attach: Attach =
    a.scale === "few" ? "vgw" : a.scale === "many" ? "tgw" : "cloudwan";
  // Private IP VPN rides a transit VIF to a TGW, so end-to-end encryption
  // pushes a "few VPCs" design onto a TGW as well.
  const privateIpVpn =
    a.encryption === "end-to-end" || (a.encryption === "link" && portGbps < 10);
  const finalAttach: Attach = privateIpVpn && attach === "vgw" ? "tgw" : attach;
  const macsec = a.encryption === "link" && connection !== "hosted" && portGbps >= 10;

  return {
    resiliency,
    connection,
    vif: finalAttach === "vgw" ? "private" : "transit",
    attach: finalAttach,
    publicVif: a.publicServices,
    macsec,
    privateIpVpn,
    siteLink: a.siteToSite,
    portGbps,
  };
}
