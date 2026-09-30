/** Minimal IPv4 CIDR helpers for the allowed-prefix lab. */

export interface Cidr {
  base: number;
  len: number;
}

export function parseCidr(s: string): Cidr | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/.exec(s.trim());
  if (!m) return null;
  const octets = m.slice(1, 5).map(Number);
  const len = Number(m[5]);
  if (octets.some((o) => o > 255) || len > 32) return null;
  const ip = octets.reduce((acc, o) => acc * 256 + o, 0);
  const size = 2 ** (32 - len);
  // Normalise host bits away so 10.0.0.1/16 behaves like 10.0.0.0/16.
  return { base: Math.floor(ip / size) * size, len };
}

export function formatCidr(c: Cidr): string {
  const o = [24, 16, 8, 0].map((s) => Math.floor(c.base / 2 ** s) % 256);
  return `${o.join(".")}/${c.len}`;
}

/** Does `outer` contain `inner` (equal counts as containing)? */
export function contains(outer: Cidr, inner: Cidr): boolean {
  if (outer.len > inner.len) return false;
  const size = 2 ** (32 - outer.len);
  return Math.floor(inner.base / size) * size === outer.base;
}

export function overlaps(a: Cidr, b: Cidr): boolean {
  return contains(a, b) || contains(b, a);
}
