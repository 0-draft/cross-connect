/**
 * Pay-as-you-go Direct Connect list prices in USD, taken from
 * aws.amazon.com/directconnect/pricing on 2026-09-30. Monthly figures use
 * 730 hours, as AWS's own examples do.
 */

export const HOURS_PER_MONTH = 730;
export const PRICES_AS_OF = "2026-09-30";

export type ConnType = "dedicated" | "hosted";

/** Port-hour price by capacity in Mbps: [non-Japan, Japan]. */
export const PORT_HOURLY: Record<ConnType, Record<number, [number, number]>> = {
  dedicated: {
    1000: [0.3, 0.285],
    10000: [2.25, 2.142],
    100000: [22.5, 22.5],
    400000: [85, 85],
  },
  hosted: {
    50: [0.03, 0.029],
    100: [0.06, 0.057],
    200: [0.08, 0.076],
    300: [0.12, 0.114],
    400: [0.16, 0.152],
    500: [0.2, 0.19],
    1000: [0.33, 0.314],
    2000: [0.66, 0.627],
    5000: [1.65, 1.568],
    10000: [2.48, 2.361],
    25000: [6.2, 6.2],
  },
};

export const SOURCE_REGIONS = [
  "us",
  "europe",
  "tokyo-osaka",
  "apac-other",
  "india",
  "australia",
  "south-america",
] as const;
export type SourceRegion = (typeof SOURCE_REGIONS)[number];

export const DX_GEOS = ["us", "europe", "japan", "apac", "australia"] as const;
export type DxGeo = (typeof DX_GEOS)[number];

/** Data transfer out, USD/GB: source Region group → DX location geography. */
export const DTO_PER_GB: Record<SourceRegion, Record<DxGeo, number>> = {
  us: { us: 0.02, europe: 0.02, japan: 0.0491, apac: 0.0491, australia: 0.06 },
  europe: { us: 0.0282, europe: 0.02, japan: 0.06, apac: 0.06, australia: 0.06 },
  "tokyo-osaka": { us: 0.09, europe: 0.06, japan: 0.041, apac: 0.041, australia: 0.1132 },
  "apac-other": { us: 0.09, europe: 0.09, japan: 0.042, apac: 0.041, australia: 0.1107 },
  india: { us: 0.085, europe: 0.085, japan: 0.1132, apac: 0.1, australia: 0.11 },
  australia: { us: 0.13, europe: 0.13, japan: 0.1132, apac: 0.1107, australia: 0.042 },
  "south-america": { us: 0.15, europe: 0.1107, japan: 0.17, apac: 0.17, australia: 0.18 },
};

export interface Estimate {
  type: ConnType;
  mbps: number;
  count: number;
  dxGeo: DxGeo;
  source: SourceRegion;
  gbOut: number;
}

export interface Breakdown {
  portHourly: number;
  port: number;
  dto: number;
  total: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function portHourly(type: ConnType, mbps: number, dxGeo: DxGeo): number {
  const row = PORT_HOURLY[type][mbps];
  if (!row) throw new Error(`no ${type} port at ${mbps} Mbps`);
  return dxGeo === "japan" ? row[1] : row[0];
}

export function estimate(e: Estimate): Breakdown {
  const hourly = portHourly(e.type, e.mbps, e.dxGeo);
  const port = round2(hourly * HOURS_PER_MONTH * e.count);
  const dto = round2(e.gbOut * DTO_PER_GB[e.source][e.dxGeo]);
  return { portHourly: hourly, port, dto, total: round2(port + dto) };
}

/**
 * Monthly egress (GB) above which a flat-rate price beats pay-as-you-go ports
 * plus DTO. Returns 0 if flat-rate is already cheaper with no traffic.
 */
export function breakEvenGb(
  flatHourly: number,
  paygPortHourly: number,
  paygPorts: number,
  dtoPerGb: number,
): number {
  const gap = (flatHourly - paygPortHourly * paygPorts) * HOURS_PER_MONTH;
  return gap <= 0 ? 0 : gap / dtoPerGb;
}
