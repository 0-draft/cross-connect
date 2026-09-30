/**
 * A small model of how AWS picks a path back to your network when the same
 * destination is reachable over several Direct Connect virtual interfaces and
 * a Site-to-Site VPN attached to the same virtual private gateway.
 *
 * Order (AWS docs, "Route priority" + "Direct Connect routing policies"):
 *   1. Longest prefix match wins, whatever the path type.
 *   2. For the same prefix: Direct Connect BGP > VPN static > VPN BGP.
 *   3. Among Direct Connect paths: highest local preference. You set it with
 *      7224:7300 > 7224:7200 > 7224:7100. Untagged routes get 7224:7200 when
 *      the DX location's associated Region is the sending Region, and "a lower
 *      value" otherwise; AWS does not publish that value, so this model puts
 *      it between low and medium.
 *   4. Shortest AS_PATH (so prepending makes a path less preferred).
 *   5. Anything still tied is load-balanced (ECMP).
 */

export type PathKind = "dx" | "vpn-static" | "vpn-bgp";

/** Local-preference communities AWS honours on routes you advertise. */
export type LocalPrefCommunity = "7224:7100" | "7224:7200" | "7224:7300" | null;

export interface Path {
  id: string;
  kind: PathKind;
  up: boolean;
  /** Prefix length you advertise over this path, e.g. 16 for 10.0.0.0/16. */
  prefixLength: number;
  community: LocalPrefCommunity;
  /** Extra copies of your ASN prepended to AS_PATH (0 = none). */
  prepend: number;
  /** Is the DX location associated with the Region sending the traffic? */
  homeRegion: boolean;
}

export type Decision =
  | "no-path"
  | "only-path"
  | "longest-prefix"
  | "path-type"
  | "local-preference"
  | "as-path"
  | "ecmp";

export interface Selection {
  winners: string[];
  /** The first step that narrowed the candidates to the final set. */
  decidedBy: Decision;
}

const KIND_RANK: Record<PathKind, number> = { dx: 3, "vpn-static": 2, "vpn-bgp": 1 };

export function localPrefValue(c: LocalPrefCommunity, homeRegion: boolean): number {
  switch (c) {
    case "7224:7300":
      return 300;
    case "7224:7200":
      return 200;
    case "7224:7100":
      return 100;
    default:
      return homeRegion ? 200 : 150;
  }
}

function keepMax<T>(items: T[], score: (t: T) => number): T[] {
  const best = Math.max(...items.map(score));
  return items.filter((i) => score(i) === best);
}

export function selectPath(paths: Path[]): Selection {
  let c = paths.filter((p) => p.up);
  if (c.length === 0) return { winners: [], decidedBy: "no-path" };
  if (c.length === 1) return { winners: [c[0].id], decidedBy: "only-path" };

  const steps: [Decision, (p: Path) => number][] = [
    ["longest-prefix", (p) => p.prefixLength],
    ["path-type", (p) => KIND_RANK[p.kind]],
    // Communities and AS_PATH only compare Direct Connect paths with each
    // other; after step 2 the set is homogeneous, so this is safe.
    [
      "local-preference",
      (p) => (p.kind === "dx" ? localPrefValue(p.community, p.homeRegion) : 0),
    ],
    ["as-path", (p) => -p.prepend],
  ];

  for (const [name, score] of steps) {
    const next = keepMax(c, score);
    if (next.length < c.length) {
      c = next;
      if (c.length === 1) return { winners: [c[0].id], decidedBy: name };
    }
  }

  // Several paths survived every tie-breaker: AWS spreads flows across them.
  // The last step that narrowed the set is less useful to the reader than
  // "these are equal", so report ECMP.
  return { winners: c.map((p) => p.id), decidedBy: "ecmp" };
}

/**
 * The two directions are decided by different routers: AWS picks the return
 * path from what you advertise, your router picks the outbound path from its
 * own local preference. If they disagree, flows are asymmetric and a stateful
 * firewall that only sees one direction drops them.
 */
export function isAsymmetric(awsWinners: string[], onPremChoice: string | null): boolean {
  if (!onPremChoice || awsWinners.length === 0) return false;
  return !awsWinners.includes(onPremChoice);
}
