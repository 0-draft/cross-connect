import { useState } from "react";
import type { L } from "../i18n/lang";
import { useLang } from "../i18n/useLang";
import { HikariSays } from "../components/Hikari";
import { Callout, Panel, Section, Segmented, T } from "../components/ui";
import {
  type ConnType,
  DTO_PER_GB,
  DX_GEOS,
  type DxGeo,
  HOURS_PER_MONTH,
  PORT_HOURLY,
  PRICES_AS_OF,
  SOURCE_REGIONS,
  type SourceRegion,
  breakEvenGb,
  estimate,
} from "../lib/pricing";

const C = {
  kicker: { en: "Pricing", ja: "料金" },
  title: {
    en: "Port-hours plus data out. Data in is free.",
    ja: "ポート時間 + 送信データ量。受信は無料。",
  },
  lead: {
    en: "Pay-as-you-go Direct Connect bills two things: an hourly charge per port (even with zero traffic) and a per-GB rate for data leaving AWS, which depends on the source Region and where the DX location is. Since 2026-09 there is also a flat-rate option for 10G and 100G dedicated ports.",
    ja: "従量課金の Direct Connect が請求するのは 2 つ。ポートごとの時間料金 (通信ゼロでも発生) と、AWS から出るデータの GB 単価 (送信元リージョンと DX ロケーションの場所で変わる) です。2026-09 からは 10G / 100G 専用ポート向けの定額料金も選べます。",
  },
  calc: { en: "Monthly estimate", ja: "月額シミュレーター" },
  type: { en: "Connection type", ja: "接続タイプ" },
  speed: { en: "Port speed", ja: "ポート速度" },
  count: { en: "Connections", ja: "接続数" },
  geo: { en: "DX location in", ja: "DX ロケーションの場所" },
  source: { en: "Traffic leaves Region", ja: "送信元リージョン" },
  gb: { en: "Data out per month (TB)", ja: "月間送信量 (TB)" },
  port: { en: "Port-hours", ja: "ポート時間" },
  dto: { en: "Data transfer out", ja: "データ転送 (アウト)" },
  total: { en: "AWS total / month", ja: "AWS 請求 / 月" },
  in: { en: "Data transfer in", ja: "データ転送 (イン)" },
  notAws: {
    en: "Not included: cross connect and colocation fees (billed by the facility), carrier circuits, partner fees, Transit Gateway attachments and data processing, SiteLink ($0.50 per VIF-hour + per GB), tax.",
    ja: "含まれないもの: クロスコネクト・コロケーション費 (施設事業者が請求)、キャリア回線、パートナー料金、Transit Gateway のアタッチメント・データ処理料、SiteLink ($0.50/VIF 時 + GB 単価)、税金。",
  },
  flatTitle: { en: "Flat-rate (since 2026-09-15)", ja: "定額料金 (2026-09-15〜)" },
  flat: {
    en: "Dedicated 10G / 100G only. A fixed hourly price per geographic tier (Tier 1 same metro … Tier 5 global) that includes DTO from the Regions in that tier. A port-pair gives you a second, redundant port for free — usable bandwidth is still one port. AWS's example: 10G Tier 1 port-pair at Ashburn = $10.96/hour.",
    ja: "専用 10G / 100G のみ。地理的ティア (Tier 1 同一都市圏 〜 Tier 5 全世界) ごとの固定時間料金で、ティア内リージョンからの DTO を含みます。ポートペアなら冗長用の 2 本目が無料 (使える帯域は 1 本分)。AWS の例: Ashburn の 10G Tier 1 ポートペア = $10.96/時。",
  },
  breakEven: {
    en: "Break-even vs 2 × pay-as-you-go 10G at $0.02/GB",
    ja: "従量 10G × 2 本 ($0.02/GB) との損益分岐",
  },
  asOf: {
    en: `USD list prices as of ${PRICES_AS_OF}. Estimates only.`,
    ja: `${PRICES_AS_OF} 時点の USD 定価。概算です。`,
  },
};

const GEO_LABEL: Record<DxGeo, L> = {
  us: { en: "US (contiguous)", ja: "米国 (本土)" },
  europe: { en: "Europe", ja: "欧州" },
  japan: { en: "Japan", ja: "日本" },
  apac: {
    en: "SG / HK / KR / TW / MY / TH",
    ja: "シンガポール / 香港 / 韓国 / 台湾 / マレーシア / タイ",
  },
  australia: { en: "Australia / NZ", ja: "オーストラリア / NZ" },
};

const SRC_LABEL: Record<SourceRegion, L> = {
  us: { en: "US", ja: "米国" },
  europe: { en: "Europe", ja: "欧州" },
  "tokyo-osaka": { en: "Tokyo / Osaka", ja: "東京 / 大阪" },
  "apac-other": {
    en: "Singapore / Seoul / HK …",
    ja: "シンガポール / ソウル / 香港 など",
  },
  india: { en: "India", ja: "インド" },
  australia: { en: "Australia / Auckland", ja: "オーストラリア / オークランド" },
  "south-america": { en: "São Paulo / Mexico", ja: "サンパウロ / メキシコ" },
};

const usd = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

const speedLabel = (m: number) => (m >= 1000 ? `${m / 1000} Gbps` : `${m} Mbps`);

function Calculator() {
  const { t } = useLang();
  const [type, setType] = useState<ConnType>("dedicated");
  const [mbps, setMbps] = useState(10000);
  const [count, setCount] = useState(2);
  const [dxGeo, setDxGeo] = useState<DxGeo>("japan");
  const [source, setSource] = useState<SourceRegion>("tokyo-osaka");
  const [tb, setTb] = useState(10);

  const speeds = Object.keys(PORT_HOURLY[type]).map(Number);
  const safeMbps = speeds.includes(mbps) ? mbps : speeds[speeds.length - 1];
  const r = estimate({ type, mbps: safeMbps, count, dxGeo, source, gbOut: tb * 1024 });
  const share = r.total > 0 ? r.port / r.total : 0;
  const field =
    "rounded-full border border-[var(--line)] bg-[var(--panel-2)] px-2 py-1.5 text-sm";

  return (
    <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
      <Panel>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <span className="mb-1 block text-xs text-[var(--muted)]">{t(C.type)}</span>
            <Segmented
              label={t(C.type)}
              value={type}
              options={[
                { value: "dedicated", label: t({ en: "Dedicated", ja: "専用" }) },
                { value: "hosted", label: t({ en: "Hosted", ja: "ホスト接続" }) },
              ]}
              onChange={(v) => {
                setType(v);
                setMbps(v === "dedicated" ? 10000 : 1000);
              }}
            />
          </div>
          <label className="text-sm">
            <span className="mb-1 block text-xs text-[var(--muted)]">{t(C.speed)}</span>
            <select
              className={`${field} w-full`}
              value={safeMbps}
              onChange={(e) => setMbps(Number(e.target.value))}
            >
              {speeds.map((s) => (
                <option key={s} value={s}>
                  {speedLabel(s)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs text-[var(--muted)]">{t(C.count)}</span>
            <input
              type="number"
              min={1}
              max={16}
              className={`${field} w-full font-mono`}
              value={count}
              onChange={(e) =>
                setCount(Math.max(1, Math.min(16, Number(e.target.value) || 1)))
              }
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs text-[var(--muted)]">{t(C.geo)}</span>
            <select
              className={`${field} w-full`}
              value={dxGeo}
              onChange={(e) => setDxGeo(e.target.value as DxGeo)}
            >
              {DX_GEOS.map((g) => (
                <option key={g} value={g}>
                  {t(GEO_LABEL[g])}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs text-[var(--muted)]">{t(C.source)}</span>
            <select
              className={`${field} w-full`}
              value={source}
              onChange={(e) => setSource(e.target.value as SourceRegion)}
            >
              {SOURCE_REGIONS.map((s) => (
                <option key={s} value={s}>
                  {t(SRC_LABEL[s])}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 flex justify-between text-xs text-[var(--muted)]">
              {t(C.gb)} <span className="font-mono text-[var(--ink)]">{tb} TB</span>
            </span>
            <input
              type="range"
              min={0}
              max={500}
              step={1}
              value={tb}
              onChange={(e) => setTb(Number(e.target.value))}
              className="w-full accent-[var(--fiber)]"
            />
          </label>
        </div>
      </Panel>
      <Panel className="flex flex-col">
        <dl aria-live="polite" className="space-y-3 font-mono text-sm">
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">
              {t(C.port)}
              <span className="block text-xs">
                {count} × ${r.portHourly}/h × {HOURS_PER_MONTH}h
              </span>
            </dt>
            <dd>{usd(r.port)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">
              {t(C.dto)}
              <span className="block text-xs">
                {(tb * 1024).toLocaleString()} GB × ${DTO_PER_GB[source][dxGeo]}/GB
              </span>
            </dt>
            <dd>{usd(r.dto)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-[var(--muted)]">{t(C.in)}</dt>
            <dd className="text-[var(--ok)]">$0.00</dd>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-[var(--panel-2)]"
            aria-hidden="true"
          >
            <div
              className="h-full bg-[var(--fiber)]"
              style={{ width: `${share * 100}%` }}
            />
          </div>
          <div className="flex justify-between gap-2 border-t border-[var(--line)] pt-3 text-lg font-semibold">
            <dt>{t(C.total)}</dt>
            <dd className="text-[var(--fiber)]">{usd(r.total)}</dd>
          </div>
        </dl>
        <p className="mt-auto pt-4 text-xs text-[var(--muted)]">{t(C.asOf)}</p>
      </Panel>
    </div>
  );
}

export function Pricing() {
  const { t } = useLang();
  const be = breakEvenGb(10.96, 2.25, 2, 0.02);
  return (
    <Section
      id="pricing"
      index="10"
      kicker={C.kicker}
      title={C.title}
      lead={C.lead}
      layers={["money"]}
    >
      <div className="mb-8 max-w-3xl">
        <HikariSays mood="happy">
          <T
            c={{
              en: "Three different bills: AWS charges the connection owner for port-hours and the sending account for data out; the colocation facility bills the cross connect; your carrier or partner bills the circuit. Data coming into AWS is always free.",
              ja: "請求書は 3 種類。AWS は接続のオーナーにポート時間を、送信元アカウントにデータ転送料を請求。クロスコネクト代はデータセンター事業者から、回線代はキャリアやパートナーから。AWS に入ってくるデータはいつでも無料。",
            }}
          />
        </HikariSays>
      </div>
      <h3 className="mb-4 text-xl font-semibold">{t(C.calc)}</h3>
      <Calculator />
      <p className="mt-4 max-w-3xl text-sm text-[var(--muted)]">{t(C.notAws)}</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Callout title={C.flatTitle}>
          <T c={C.flat} />
        </Callout>
        <Panel>
          <p className="text-xs text-[var(--muted)]">{t(C.breakEven)}</p>
          <p className="mt-2 font-mono text-3xl font-semibold text-[var(--fiber)]">
            ≈ {Math.round(be / 1024)} TB
            <span className="text-base text-[var(--muted)]"> / mo</span>
          </p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            ($10.96 − 2 × $2.25) × 730 h ÷ $0.02/GB
          </p>
        </Panel>
      </div>
    </Section>
  );
}
