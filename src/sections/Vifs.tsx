import { useState } from "react";
import type { L } from "../i18n/lang";
import { useLang } from "../i18n/useLang";
import { useNarrow } from "../components/useNarrow";
import { HikariSays } from "../components/Hikari";
import { Callout, Panel, Scroll, Section, Segmented, T } from "../components/ui";

type Vif = "private" | "public" | "transit";

const COLOR: Record<Vif, string> = {
  private: "var(--ok)",
  public: "var(--violet)",
  transit: "var(--aws)",
};

const C = {
  kicker: { en: "Virtual interfaces", ja: "仮想インターフェイス" },
  title: {
    en: "One VLAN, one BGP session, one kind of destination",
    ja: "VLAN 1 本、BGP 1 本、行き先は 1 種類",
  },
  lead: {
    en: "A connection is only a pipe. Nothing flows until you create a virtual interface (VIF) on it: an 802.1Q VLAN plus an eBGP session. The VIF type decides what you can reach.",
    ja: "接続はただの土管です。仮想インターフェイス (VIF) — 802.1Q VLAN と eBGP セッションの組 — を作るまで何も流れません。VIF の種類で到達先が決まります。",
  },
  pick: { en: "VIF type", ja: "VIF 種別" },
  params: { en: "Parameters you choose", ja: "作成時に決めるパラメータ" },
  limitsTitle: { en: "Per-connection limits", ja: "接続あたりの上限" },
  limits: {
    en: "A dedicated connection or LAG takes up to 51 VIFs: 50 private/public plus up to 4 transit. A hosted connection takes exactly one. Routes you advertise on a private or transit VIF are capped at 100 per address family by default (up to 1,000 with inbound prefix controls since 2026-08); above the limit the BGP session goes Idle. Public VIFs accept 1,000.",
    ja: "VIF は専用接続 / LAG あたり最大 51 本 (プライベート / パブリック 50 本 + トランジット最大 4 本)、ホスト接続では 1 本だけです。プライベート / トランジット VIF で自社が広告できる経路は、アドレスファミリーごとにデフォルト 100 本です (2026-08 以降は inbound prefix controls で最大 1,000 本)。上限を超えると BGP は Idle になります。パブリック VIF の上限は 1,000 本です。",
  },
};

const INFO: Record<Vif, { what: L; attach: L; asn: L; ips: L; mtu: string; note: L }> = {
  private: {
    what: {
      en: "Your VPCs, using private IP addresses.",
      ja: "VPC へ、プライベート IP で。",
    },
    attach: {
      en: "A virtual private gateway (one VPC, same Region) or a Direct Connect gateway (VGWs in any Region / account)",
      ja: "仮想プライベートゲートウェイ (VPC 1 つ、同一リージョン) または Direct Connect ゲートウェイ (任意のリージョン / アカウントの VGW)",
    },
    asn: { en: "The VGW's or DXGW's ASN", ja: "VGW または DXGW の ASN" },
    ips: {
      en: "Any range; AWS can generate private IPv4",
      ja: "任意。AWS にプライベート IPv4 を生成させることも可",
    },
    mtu: "1500 / 9001",
    note: {
      en: "Classic single-VPC hybrid. Attaching to a DXGW instead of a VGW makes the same VIF reach VPCs in other Regions.",
      ja: "定番の単一 VPC 接続。VGW ではなく DXGW に接続すれば、同じ VIF で他リージョンの VPC にも届きます。",
    },
  },
  public: {
    what: {
      en: "Every AWS public prefix in every public Region (S3, DynamoDB, public endpoints…), not the internet.",
      ja: "全パブリックリージョンの AWS パブリックプレフィックス (S3、DynamoDB、各種パブリックエンドポイント)。インターネットではない。",
    },
    attach: {
      en: "Nothing — no gateway, cannot attach to a DXGW",
      ja: "なし — ゲートウェイ不要、DXGW にも接続不可",
    },
    asn: { en: "7224 (AWS)", ja: "7224 (AWS)" },
    ips: {
      en: "Public IPv4 you own, or a /31 from AWS via a support case",
      ja: "自社保有のパブリック IPv4、またはサポートケース経由で AWS から /31",
    },
    mtu: "1500",
    note: {
      en: "Sits in 'verifying' until AWS checks you own the prefixes and ASN (RIR records or an LOA). After 1 hour AWS opens a support case automatically. Accelerated VPN does not work over a public VIF.",
      ja: "プレフィックスと ASN の所有 (RIR 登録または LOA) を AWS が確認するまで 'verifying' 状態。1 時間を超えると AWS が自動でサポートケースを起票します。Accelerated VPN はパブリック VIF 上では使えません。",
    },
  },
  transit: {
    what: {
      en: "Transit Gateways or an AWS Cloud WAN core network — and through them, thousands of VPCs.",
      ja: "Transit Gateway または AWS Cloud WAN コアネットワーク、その先の多数の VPC。",
    },
    attach: {
      en: "A Direct Connect gateway only",
      ja: "Direct Connect ゲートウェイのみ",
    },
    asn: { en: "The DXGW's ASN", ja: "DXGW の ASN" },
    ips: { en: "Any range", ja: "任意" },
    mtu: "1500 / 8500",
    note: {
      en: "The scalable option for hub-and-spoke networks. Up to 4 per dedicated connection. It is also the transport for Private IP VPN (IPsec with private outer addresses).",
      ja: "ハブ&スポーク型ネットワーク向けのスケーラブルな選択肢。専用接続あたり最大 4 本。Private IP VPN (外側アドレスがプライベートの IPsec) の下回りにもなります。",
    },
  },
};

const LANE_DEST: Record<Vif, L[]> = {
  private: [
    { en: "VGW → one VPC in the same Region", ja: "VGW → 同一リージョンの VPC 1 つ" },
    {
      en: "or DX gateway → VGWs in any Region / account (up to 20)",
      ja: "または DX ゲートウェイ → 任意のリージョン / アカウントの VGW (最大 20)",
    },
  ],
  public: [
    {
      en: "AWS public prefixes in all public Regions (S3, DynamoDB, CloudFront, Route 53…)",
      ja: "全パブリックリージョンの AWS パブリックプレフィックス (S3、DynamoDB、CloudFront、Route 53 など)",
    },
  ],
  transit: [
    {
      en: "DX gateway → Transit Gateway (up to 6) or a Cloud WAN core network",
      ja: "DX ゲートウェイ → Transit Gateway (最大 6) または Cloud WAN コアネットワーク",
    },
  ],
};

/** Phone layout: one row per VLAN lane, the chosen lane lit up. */
function VifLanes({ vif }: { vif: Vif }) {
  const { t } = useLang();
  return (
    <ol className="space-y-2" aria-label={t(INFO[vif].what)}>
      {(["private", "public", "transit"] as Vif[]).map((v, i) => (
        <li
          key={v}
          className="rounded-2xl border-2 p-3 transition-opacity"
          style={{ borderColor: COLOR[v], opacity: v === vif ? 1 : 0.4 }}
        >
          <p className="font-mono text-sm font-bold" style={{ color: COLOR[v] }}>
            VLAN {101 + i} · {v} VIF
          </p>
          <ul className="mt-1 space-y-0.5 text-sm">
            {LANE_DEST[v].map((d) => (
              <li key={d.en}>{t(d)}</li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

function VifDiagram({ vif }: { vif: Vif }) {
  const { t } = useLang();
  const narrow = useNarrow();
  const c = COLOR[vif];
  const dim = (v: Vif) => (v === vif ? 1 : 0.18);
  if (narrow) return <VifLanes vif={vif} />;
  return (
    <Scroll>
      <svg
        viewBox="0 0 960 360"
        className="diagram min-w-[700px]"
        role="img"
        aria-label={t(INFO[vif].what)}
      >
        {/* router + connection */}
        <rect
          x="10"
          y="150"
          width="110"
          height="60"
          rx="8"
          fill="var(--panel-2)"
          stroke="var(--line)"
        />
        <text x="65" y="185" fontSize="13.8" textAnchor="middle" fill="var(--ink)">
          {t({ en: "your router", ja: "自社ルーター" })}
        </text>
        <rect
          x="150"
          y="120"
          width="150"
          height="120"
          rx="8"
          fill="var(--panel-2)"
          stroke="var(--line)"
        />
        <text x="225" y="112" fontSize="12.5" textAnchor="middle" fill="var(--muted)">
          {t({ en: "connection", ja: "接続" })}
        </text>
        {(["private", "public", "transit"] as Vif[]).map((v, i) => (
          <g key={v} opacity={dim(v)}>
            <line
              x1="120"
              x2="290"
              y1={150 + i * 30}
              y2={150 + i * 30}
              stroke={COLOR[v]}
              strokeWidth="3"
            />
            <text
              x="225"
              y={145 + i * 30}
              fontSize="11.2"
              textAnchor="middle"
              fill={COLOR[v]}
            >
              VLAN {101 + i} · {v}
            </text>
          </g>
        ))}

        {/* private: VGW -> VPC ; and DXGW -> VGW (other region) */}
        <g opacity={dim("private")}>
          <path
            d="M290 150 C340 150 340 60 400 60"
            stroke={COLOR.private}
            strokeWidth="3"
            fill="none"
            className={vif === "private" ? "flow" : undefined}
          />
          <rect
            x="400"
            y="35"
            width="110"
            height="50"
            rx="8"
            fill="var(--panel)"
            stroke={COLOR.private}
          />
          <text x="455" y="65" fontSize="13.8" textAnchor="middle" fill={COLOR.private}>
            VGW
          </text>
          <line
            x1="510"
            x2="580"
            y1="60"
            y2="60"
            stroke={COLOR.private}
            strokeWidth="2"
          />
          <rect
            x="580"
            y="35"
            width="130"
            height="50"
            rx="8"
            fill="var(--panel)"
            stroke={COLOR.private}
          />
          <text x="645" y="58" fontSize="13.8" textAnchor="middle" fill="var(--ink)">
            VPC
          </text>
          <text x="645" y="74" fontSize="11.2" textAnchor="middle" fill="var(--muted)">
            {t({ en: "same Region", ja: "同一リージョン" })}
          </text>
        </g>

        {/* public: straight to public endpoints */}
        <g opacity={dim("public")}>
          <path
            d="M290 180 H580"
            stroke={COLOR.public}
            strokeWidth="3"
            fill="none"
            className={vif === "public" ? "flow" : undefined}
          />
          <rect
            x="580"
            y="150"
            width="360"
            height="60"
            rx="8"
            fill="var(--panel)"
            stroke={COLOR.public}
          />
          <text x="760" y="176" fontSize="13.8" textAnchor="middle" fill={COLOR.public}>
            {t({
              en: "AWS public prefixes · all public Regions",
              ja: "AWS パブリックプレフィックス · 全パブリックリージョン",
            })}
          </text>
          <text x="760" y="194" fontSize="11.2" textAnchor="middle" fill="var(--muted)">
            S3 · DynamoDB · CloudFront · Route 53 …
          </text>
        </g>

        {/* transit + private-via-DXGW share the DXGW */}
        <g opacity={vif === "public" ? 0.18 : 1}>
          <path
            d="M290 210 C340 210 340 290 400 290"
            stroke={vif === "private" ? "var(--line)" : COLOR.transit}
            strokeWidth="3"
            fill="none"
            className={vif === "transit" ? "flow" : undefined}
          />
          {vif === "private" && (
            <path
              d="M290 150 C360 150 330 290 400 290"
              stroke={COLOR.private}
              strokeWidth="2"
              strokeDasharray="5 5"
              fill="none"
            />
          )}
          <rect
            x="400"
            y="265"
            width="110"
            height="50"
            rx="8"
            fill="var(--panel)"
            stroke="var(--fiber)"
          />
          <text x="455" y="289" fontSize="13.8" textAnchor="middle" fill="var(--fiber)">
            {t({ en: "DX gateway", ja: "DX ゲートウェイ" })}
          </text>
          <text x="455" y="304" fontSize="11.2" textAnchor="middle" fill="var(--muted)">
            {t({ en: "global", ja: "グローバル" })}
          </text>
        </g>
        {vif === "private" ? (
          <g>
            <line
              x1="510"
              x2="580"
              y1="290"
              y2="290"
              stroke={COLOR.private}
              strokeWidth="2"
            />
            <rect
              x="580"
              y="260"
              width="360"
              height="60"
              rx="8"
              fill="var(--panel)"
              stroke={COLOR.private}
            />
            <text x="760" y="286" fontSize="13.8" textAnchor="middle" fill="var(--ink)">
              {t({
                en: "VGW → VPC in any Region / account",
                ja: "VGW → 任意のリージョン / アカウントの VPC",
              })}
            </text>
            <text x="760" y="304" fontSize="11.2" textAnchor="middle" fill="var(--muted)">
              {t({
                en: "up to 20 VGWs per DX gateway",
                ja: "DX ゲートウェイあたり VGW 20 個まで",
              })}
            </text>
          </g>
        ) : (
          <g opacity={dim("transit")}>
            <line
              x1="510"
              x2="580"
              y1="290"
              y2="290"
              stroke={COLOR.transit}
              strokeWidth="2"
            />
            <rect
              x="580"
              y="260"
              width="170"
              height="60"
              rx="8"
              fill="var(--panel)"
              stroke={COLOR.transit}
            />
            <text
              x="665"
              y="286"
              fontSize="13.8"
              textAnchor="middle"
              fill={COLOR.transit}
            >
              Transit Gateway
            </text>
            <text x="665" y="304" fontSize="11.2" textAnchor="middle" fill="var(--muted)">
              {t({ en: "≤ 6 per DXGW", ja: "DXGW あたり 6 個まで" })}
            </text>
            <rect
              x="770"
              y="260"
              width="170"
              height="60"
              rx="8"
              fill="var(--panel)"
              stroke={COLOR.transit}
            />
            <text
              x="855"
              y="286"
              fontSize="13.8"
              textAnchor="middle"
              fill={COLOR.transit}
            >
              Cloud WAN
            </text>
            <text x="855" y="304" fontSize="11.2" textAnchor="middle" fill="var(--muted)">
              {t({ en: "core network", ja: "コアネットワーク" })}
            </text>
          </g>
        )}
        <text x="480" y="345" fontSize="12.5" textAnchor="middle" fill={c}>
          {t(INFO[vif].what)}
        </text>
      </svg>
    </Scroll>
  );
}

export function Vifs() {
  const { t } = useLang();
  const [vif, setVif] = useState<Vif>("private");
  const info = INFO[vif];
  const rows: [L, string][] = [
    [{ en: "Attaches to", ja: "接続先" }, t(info.attach)],
    [{ en: "AWS-side ASN", ja: "AWS 側 ASN" }, t(info.asn)],
    [{ en: "Peer IPs", ja: "ピア IP" }, t(info.ips)],
    [{ en: "MTU", ja: "MTU" }, info.mtu],
  ];
  return (
    <Section
      id="vifs"
      index="04"
      kicker={C.kicker}
      title={C.title}
      lead={C.lead}
      layers={["link", "routing", "aws"]}
    >
      <div className="mb-8 max-w-3xl">
        <HikariSays mood="happy">
          <T
            c={{
              en: "A connection is a road; VIFs are lanes painted on it. Each lane has its own number (a VLAN ID), its own conversation with AWS (a BGP session), and goes to one kind of place. Adding a lane costs nothing, but a road only has room for 51.",
              ja: "接続は道路、VIF はその上に引いた車線。車線ごとに番号 (VLAN ID) があって、AWS との会話 (BGP セッション) も別々、行き先の種類も 1 つずつ。車線を増やすのは無料だけど、1 本の道路に引けるのは 51 本まで。",
            }}
          />
        </HikariSays>
      </div>
      <div className="mb-4">
        <Segmented
          label={t(C.pick)}
          value={vif}
          options={[
            { value: "private", label: "Private VIF" },
            { value: "public", label: "Public VIF" },
            { value: "transit", label: "Transit VIF" },
          ]}
          onChange={setVif}
        />
      </div>
      <div className="grid gap-4">
        <Panel className="p-3 sm:p-4">
          <VifDiagram vif={vif} />
        </Panel>
        <Panel>
          <dl
            aria-live="polite"
            className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4"
          >
            {rows.map(([k, v]) => (
              <div key={k.en}>
                <dt className="text-sm font-bold" style={{ color: COLOR[vif] }}>
                  {t(k)}
                </dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 border-t border-[var(--line)] pt-4 text-sm leading-relaxed text-[var(--muted)]">
            {t(info.note)}
          </p>
        </Panel>
      </div>

      <h3 className="mt-12 mb-4 text-xl font-semibold">{t(C.params)}</h3>
      <ul className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {(
          [
            [
              "VLAN",
              {
                en: "1–4094, unique on the connection, cannot change later",
                ja: "1〜4094、接続内で一意、後から変更不可",
              },
            ],
            [
              "BGP ASN",
              {
                en: "Public (verified) or private 64512–65534; 4-byte ASNs supported since 2025",
                ja: "パブリック (所有確認あり) またはプライベート 64512〜65534。2025 年から 4 バイト ASN 対応",
              },
            ],
            [
              "MD5 key",
              {
                en: "Always on; AWS generates one if you leave it blank",
                ja: "常に有効。空欄なら AWS が生成",
              },
            ],
            [
              "IPv4 peers",
              {
                en: "Same mask on both sides; /31 works on every VIF type",
                ja: "両端同じマスク。/31 は全 VIF 種別で利用可",
              },
            ],
            [
              "IPv6 peers",
              {
                en: "Always a /125 allocated by Amazon",
                ja: "常に Amazon が割り当てる /125",
              },
            ],
            [
              "Sessions",
              {
                en: "One BGP session per address family (IPv4, IPv6)",
                ja: "アドレスファミリー (IPv4 / IPv6) ごとに BGP 1 本",
              },
            ],
          ] as [string, L][]
        ).map(([k, v]) => (
          <li
            key={k}
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"
          >
            <p className="mb-1 font-mono text-xs text-[var(--fiber)]">{k}</p>
            <p>{t(v)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 max-w-3xl">
        <Callout title={C.limitsTitle}>
          <T c={C.limits} />
        </Callout>
      </div>
    </Section>
  );
}
