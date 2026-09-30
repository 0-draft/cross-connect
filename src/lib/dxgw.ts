import { type Cidr, contains, formatCidr } from "./cidr";

export type Association = "vgw" | "tgw";

/**
 * What your router learns from AWS for one association, given the VPC CIDRs
 * behind it and the DXGW "allowed prefixes" list.
 *
 * - VGW: the list is a filter. A VPC CIDR is advertised (as itself) only if an
 *   allowed prefix is equal to or wider than it.
 * - TGW: the list IS the advertisement, originated by the DXGW, whether or not
 *   any VPC uses that space.
 */
export function advertised(kind: Association, vpcs: Cidr[], allowed: Cidr[]): string[] {
  if (kind === "tgw") return allowed.map(formatCidr);
  return vpcs.filter((v) => allowed.some((a) => contains(a, v))).map(formatCidr);
}
