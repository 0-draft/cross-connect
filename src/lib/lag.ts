/** LAG rules for Direct Connect dedicated connections. */

export type PortSpeed = 1 | 10 | 100 | 400;

export const PORT_SPEEDS: PortSpeed[] = [1, 10, 100, 400];

/** Four members below 100G, two at 100G and 400G. */
export function maxMembers(speed: PortSpeed): number {
  return speed >= 100 ? 2 : 4;
}

export interface LagState {
  operational: boolean;
  /** Usable capacity in Gbps. */
  capacity: number;
}

/**
 * A LAG is operational while at least `minLinks` members are up (and at least
 * one, since a LAG with no working member carries nothing). `minLinks` defaults
 * to 0 on a new LAG.
 */
export function lagState(speed: PortSpeed, up: number, minLinks: number): LagState {
  const operational = up > 0 && up >= minLinks;
  return { operational, capacity: operational ? up * speed : 0 };
}

export type MacsecMode = "should_encrypt" | "must_encrypt";

export type MacsecOutcome = "encrypted" | "cleartext" | "dropped";

/** What happens to frames depending on whether the MKA session came up. */
export function macsecOutcome(mode: MacsecMode, sessionUp: boolean): MacsecOutcome {
  if (sessionUp) return "encrypted";
  return mode === "must_encrypt" ? "dropped" : "cleartext";
}

/** Cipher suites AWS accepts per port speed. MACsec is not offered on 1G. */
export function macsecCiphers(speed: PortSpeed): string[] {
  if (speed === 1) return [];
  if (speed === 10) return ["GCM-AES-256", "GCM-AES-XPN-256"];
  return ["GCM-AES-XPN-256"];
}
