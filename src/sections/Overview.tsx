import { useState } from "react";
import type { L } from "../i18n/lang";
import { useLang } from "../i18n/useLang";
import { HikariSays } from "../components/Hikari";
import { Callout, Panel, Scroll, Section, T } from "../components/ui";
import { UI } from "../content/ui";
import { useNarrow } from "../components/useNarrow";

type PartId =
  | "router"
  | "carrier"
  | "cage"
  | "xc"
  | "dxrouter"
  | "vif"
  | "backbone"
  | "gateway"
  | "vpc"
  | "public";

const PARTS: Record<PartId, { name: L; body: L }> = {
  router: {
    name: { en: "Customer router", ja: "自社ルーター" },
    body: {
      en: "Your edge router. It must speak 802.1Q VLANs and BGP with MD5 authentication; BFD is optional but recommended. It terminates one BGP session per virtual interface.",
      ja: "自社のエッジルーター。802.1Q VLAN と MD5 認証付き BGP が必須で、BFD は任意 (推奨)。仮想インターフェイス (VIF) ごとに 1 本の BGP セッションを張ります。",
    },
  },
  carrier: {
    name: { en: "Carrier circuit", ja: "キャリア回線" },
    body: {
      en: "If your router is not already in the Direct Connect location, a network provider extends the port to your site over Metro Ethernet, dark fiber or a wavelength. The provider does not have to be an AWS partner.",
      ja: "ルーターが Direct Connect ロケーション内に無い場合、通信事業者が広域イーサネット・ダークファイバー・波長サービスなどでポートを自拠点まで延伸します。事業者は AWS パートナーである必要はありません。",
    },
  },
  cage: {
    name: { en: "Your cage / partner rack", ja: "自社ケージ / パートナーラック" },
    body: {
      en: "Space in the colocation facility that belongs to you or your provider. A Direct Connect location is a third-party data center (Equinix, AT Tokyo, CoreSite…) where AWS also has routers.",
      ja: "コロケーション施設内の自社または事業者のスペース。Direct Connect ロケーションとは、AWS がルーターを置いている第三者のデータセンター (Equinix、AT東京、CoreSite など) のことです。",
    },
  },
  xc: {
    name: { en: "Cross connect", ja: "クロスコネクト" },
    body: {
      en: "A single-mode fiber patch between your port and the AWS port. You order it from the facility with the LOA-CFA that AWS issues. This short cable is the physical heart of Direct Connect, and the reason this site is called cross-connect.",
      ja: "自社ポートと AWS ポートをつなぐシングルモード光ファイバーのパッチ。AWS が発行する LOA-CFA を使って施設事業者に発注します。この数メートルのケーブルこそ Direct Connect の物理的な心臓部で、このサイト名の由来です。",
    },
  },
  dxrouter: {
    name: { en: "AWS Direct Connect router", ja: "AWS Direct Connect ルーター" },
    body: {
      en: "The AWS-owned device your connection lands on. A dedicated connection is one physical port on it (1, 10, 100 or 400 Gbps). For resiliency, separate connections should land on separate devices, ideally in separate locations.",
      ja: "接続が収容される AWS 所有の機器。専用接続はこの機器の物理ポート 1 つ (1/10/100/400 Gbps)。冗長化では接続ごとに別機器、できれば別ロケーションに収容します。",
    },
  },
  vif: {
    name: { en: "Virtual interfaces (VIFs)", ja: "仮想インターフェイス (VIF)" },
    body: {
      en: "Logical channels on the connection: each VIF is one 802.1Q VLAN plus one BGP session. Private VIFs reach VPCs, public VIFs reach AWS public endpoints, transit VIFs reach Transit Gateway or Cloud WAN through a Direct Connect gateway.",
      ja: "接続上の論理チャネル。VIF は 802.1Q VLAN 1 本と BGP セッション 1 本の組。プライベート VIF は VPC へ、パブリック VIF は AWS のパブリックエンドポイントへ、トランジット VIF は Direct Connect ゲートウェイ経由で Transit Gateway / Cloud WAN へ届きます。",
    },
  },
  backbone: {
    name: { en: "AWS global backbone", ja: "AWS グローバルバックボーン" },
    body: {
      en: "From the Direct Connect router onward, traffic rides AWS's own network. Each location has a home Region, but with a Direct Connect gateway it can reach VPCs in any public Region (China excluded) without touching the internet.",
      ja: "Direct Connect ルーターから先は AWS 自前のネットワークを通ります。各ロケーションには「ホームリージョン」がありますが、Direct Connect ゲートウェイを使えば中国を除く全パブリックリージョンの VPC にインターネットを経由せず到達できます。",
    },
  },
  gateway: {
    name: { en: "Gateways", ja: "ゲートウェイ" },
    body: {
      en: "Where the VIF lands inside AWS: a virtual private gateway (one VPC), a Direct Connect gateway (a global object fanning out to many VPCs, Regions and accounts), and behind it a Transit Gateway or a Cloud WAN core network.",
      ja: "VIF が AWS 内で着地する先。仮想プライベートゲートウェイ (VPC 1 つ)、Direct Connect ゲートウェイ (多数の VPC・リージョン・アカウントに分岐するグローバルオブジェクト)、その先の Transit Gateway や Cloud WAN コアネットワーク。",
    },
  },
  vpc: {
    name: { en: "VPCs", ja: "VPC" },
    body: {
      en: "Your private address space. Routes learned over Direct Connect are propagated into VPC route tables (or Transit Gateway route tables), and your VPC CIDRs are advertised back to your router over BGP.",
      ja: "自社のプライベートアドレス空間。Direct Connect で学習した経路は VPC ルートテーブル (または TGW ルートテーブル) に伝播し、逆に VPC の CIDR は BGP で自社ルーターに広告されます。",
    },
  },
  public: {
    name: { en: "AWS public services", ja: "AWS パブリックサービス" },
    body: {
      en: "Public endpoints such as Amazon S3 and DynamoDB, reached over a public VIF using public IP addresses. AWS advertises its public prefixes to you; you advertise public prefixes you own.",
      ja: "Amazon S3 や DynamoDB などのパブリックエンドポイント。パブリック VIF 経由でパブリック IP を使って到達します。AWS はパブリックプレフィックスを広告し、自社が保有するパブリックプレフィックスを広告します。",
    },
  },
};

const C = {
  kicker: { en: "Overview", ja: "概要" },
  title: {
    en: "A private fiber from your router into AWS",
    ja: "自社ルーターから AWS へ、専用の光ファイバーを一本",
  },
  lead: {
    en: "AWS Direct Connect (DX) links your network to AWS over a standard Ethernet fiber in a colocation facility, then carries your traffic on the AWS backbone instead of the internet. Everything else — virtual interfaces, gateways, BGP — is built on that one cable.",
    ja: "AWS Direct Connect (DX) は、コロケーション施設内の標準的なイーサネット光ファイバーで自社のネットワークと AWS を接続し、その先はインターネットではなく AWS のバックボーンで通信を運びます。VIF もゲートウェイも BGP も、すべてこのケーブルの上に構築されます。",
  },
  diagramTitle: { en: "The end-to-end path", ja: "エンドツーエンドの経路" },
  compareTitle: {
    en: "Direct Connect vs Site-to-Site VPN vs the internet",
    ja: "Direct Connect / Site-to-Site VPN / インターネットの比較",
  },
  premises: { en: "Your premises", ja: "自社拠点" },
  location: { en: "Direct Connect location", ja: "Direct Connect ロケーション" },
  region: { en: "AWS Region", ja: "AWS リージョン" },
  notEncTitle: { en: "Not encrypted by default", ja: "デフォルトでは暗号化されない" },
  notEnc: {
    en: "A private fiber is not an encrypted one. Add MACsec on the link (dedicated 10/100/400G) or run IPsec over the top if you need encryption in transit.",
    ja: "閉域 ≠ 暗号化です。通信の暗号化が必要なら、リンク上の MACsec (専用 10/100/400G) か、その上での IPsec を追加します。",
  },
};

const ROWS: { k: L; dx: L; vpn: L; net: L }[] = [
  {
    k: { en: "Transport", ja: "経路" },
    dx: {
      en: "Fiber to a DX location, then the AWS backbone",
      ja: "DX ロケーションまで光ファイバー、以降 AWS バックボーン",
    },
    vpn: {
      en: "IPsec tunnels over the internet",
      ja: "インターネット上の IPsec トンネル",
    },
    net: { en: "Public internet", ja: "パブリックインターネット" },
  },
  {
    k: { en: "Bandwidth", ja: "帯域" },
    dx: {
      en: "Dedicated 1/10/100/400 Gbps; hosted 50 Mbps–25 Gbps; LAG up to 800 Gbps",
      ja: "専用 1/10/100/400 Gbps、ホスト接続 50 Mbps〜25 Gbps、LAG で最大 800 Gbps",
    },
    vpn: {
      en: "1.25 Gbps per tunnel; 5 Gbps Large Bandwidth Tunnels (TGW / Cloud WAN, Nov 2025)",
      ja: "トンネルあたり 1.25 Gbps、Large Bandwidth Tunnel で 5 Gbps (TGW / Cloud WAN、2025-11)",
    },
    net: { en: "Best effort", ja: "ベストエフォート" },
  },
  {
    k: { en: "Latency / jitter", ja: "遅延・揺らぎ" },
    dx: { en: "Consistent", ja: "安定" },
    vpn: { en: "Varies with the internet", ja: "インターネット次第" },
    net: { en: "Varies", ja: "変動" },
  },
  {
    k: { en: "Time to deploy", ja: "開通まで" },
    dx: {
      en: "Days to weeks (port up to 72 business hours, then cross connect and circuit)",
      ja: "数日〜数週間 (ポート払い出し最大 72 営業時間 + クロスコネクト + 回線)",
    },
    vpn: { en: "Minutes", ja: "数分" },
    net: { en: "Immediate", ja: "即時" },
  },
  {
    k: { en: "Encryption", ja: "暗号化" },
    dx: {
      en: "None by default; MACsec (L2) or IPsec over DX",
      ja: "デフォルトなし。MACsec (L2) または DX 上の IPsec",
    },
    vpn: { en: "IPsec built in", ja: "IPsec 標準" },
    net: { en: "TLS in the application", ja: "アプリ層の TLS" },
  },
  {
    k: { en: "SLA", ja: "SLA" },
    dx: {
      en: "Up to 99.99% (Maximum Resiliency model)",
      ja: "最大 99.99% (Maximum Resiliency モデル)",
    },
    vpn: { en: "Separate VPN SLA", ja: "VPN 独自の SLA" },
    net: { en: "None", ja: "なし" },
  },
];

function Hotspot({
  id,
  active,
  onPick,
  children,
}: {
  id: PartId;
  active: PartId;
  onPick: (id: PartId) => void;
  children: React.ReactNode;
}) {
  const { t } = useLang();
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={t(PARTS[id].name)}
      aria-pressed={active === id}
      onClick={() => onPick(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPick(id);
        }
      }}
      className="cursor-pointer outline-none [&:focus-visible_.hl]:stroke-[var(--ink)]"
      opacity={active === id ? 1 : 0.88}
    >
      {children}
    </g>
  );
}

const ROUTE: { zone: L; color: string; parts: PartId[] }[] = [
  { zone: C.premises, color: "var(--violet)", parts: ["router", "carrier"] },
  { zone: C.location, color: "var(--fiber)", parts: ["cage", "xc", "dxrouter", "vif"] },
  {
    zone: C.region,
    color: "var(--aws)",
    parts: ["backbone", "gateway", "vpc", "public"],
  },
];

/** The same path, top to bottom, for phone screens. */
function VerticalPath({
  active,
  onPick,
}: {
  active: PartId;
  onPick: (id: PartId) => void;
}) {
  const { t } = useLang();
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="absolute top-4 bottom-4 left-[28px] w-1 rounded-full bg-[var(--fiber)] opacity-40"
      />
      <ol className="space-y-3" aria-label={t(C.diagramTitle)}>
        {ROUTE.map((z) => (
          <li
            key={z.zone.en}
            className="relative rounded-2xl border-2 p-3"
            style={{ borderColor: z.color }}
          >
            <p className="mb-2 pl-9 text-xs font-bold" style={{ color: z.color }}>
              {t(z.zone)}
            </p>
            <ul className="space-y-1.5">
              {z.parts.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    aria-expanded={active === id}
                    aria-controls={`part-${id}`}
                    onClick={() => onPick(id)}
                    className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-2 text-left text-sm font-bold ${
                      active === id
                        ? "bg-[var(--fiber-soft)] text-[var(--fiber)]"
                        : "hover:bg-[var(--panel-2)]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 rounded-full border-[3px] bg-[var(--panel)]"
                      style={{ borderColor: active === id ? "var(--fiber)" : z.color }}
                    />
                    {t(PARTS[id].name)}
                  </button>
                  {active === id && (
                    <p
                      id={`part-${id}`}
                      className="mt-1 mb-2 ml-9 text-sm leading-relaxed"
                    >
                      {t(PARTS[id].body)}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function PathDiagram() {
  const { t } = useLang();
  const narrow = useNarrow();
  const [active, setActive] = useState<PartId>("xc");
  const on = (id: PartId) => (active === id ? "var(--fiber)" : "var(--line)");

  return (
    <div className="grid gap-4">
      <Panel className="p-3 sm:p-4">
        <p className="mb-2 text-xs font-bold text-[var(--muted)]">
          {t(C.diagramTitle)} — <T c={UI.clickHint} />
        </p>
        {narrow ? (
          <VerticalPath active={active} onPick={setActive} />
        ) : (
          <Scroll>
            <svg
              viewBox="0 0 1000 380"
              className="diagram min-w-[720px]"
              role="group"
              aria-label={t(C.diagramTitle)}
            >
              {/* zones */}
              <rect
                x="10"
                y="30"
                width="150"
                height="330"
                rx="10"
                fill="var(--panel-2)"
              />
              <rect
                x="215"
                y="30"
                width="360"
                height="330"
                rx="10"
                fill="none"
                stroke="var(--line)"
                strokeDasharray="4 4"
              />
              <rect
                x="660"
                y="30"
                width="330"
                height="330"
                rx="10"
                fill="none"
                stroke="var(--aws)"
                strokeOpacity="0.5"
              />
              <text x="22" y="52" fontSize="12.5" fill="var(--muted)">
                {t(C.premises)}
              </text>
              <text x="227" y="52" fontSize="12.5" fill="var(--muted)">
                {t(C.location)}
              </text>
              <text x="672" y="52" fontSize="12.5" fill="var(--aws)">
                {t(C.region)}
              </text>

              {/* the office the router lives in, so the column reads as a place */}
              <g aria-hidden="true">
                <path
                  d="M40 118 L85 84 L130 118"
                  fill="var(--violet-soft)"
                  stroke="var(--violet)"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <rect
                  x="48"
                  y="116"
                  width="74"
                  height="40"
                  rx="6"
                  fill="var(--panel)"
                  stroke="var(--violet)"
                  strokeWidth="2"
                />
                <rect
                  x="60"
                  y="126"
                  width="14"
                  height="12"
                  rx="2"
                  fill="var(--aws-soft)"
                />
                <rect
                  x="96"
                  y="126"
                  width="14"
                  height="12"
                  rx="2"
                  fill="var(--aws-soft)"
                />
                <line
                  x1="85"
                  x2="85"
                  y1="156"
                  y2="170"
                  stroke="var(--violet)"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
                <text
                  x="85"
                  y="300"
                  fontSize="12"
                  textAnchor="middle"
                  fill="var(--muted)"
                >
                  {t({ en: "office / DC", ja: "オフィス / DC" })}
                </text>
              </g>
              {/* fibres (drawn first so boxes sit on top) */}
              <path
                d="M125 200 H265"
                stroke="var(--fiber)"
                strokeWidth="3"
                className="flow"
              />
              <path
                d="M355 200 H435"
                stroke="var(--fiber)"
                strokeWidth="3"
                className="flow"
              />
              <path
                d="M555 200 C610 200 620 200 700 200"
                stroke="var(--aws)"
                strokeWidth="3"
                className="flow"
              />
              <path
                d="M800 185 C840 140 850 120 860 115"
                stroke="var(--aws)"
                strokeWidth="2"
              />
              <path
                d="M800 215 C840 260 850 280 860 285"
                stroke="var(--aws)"
                strokeWidth="2"
              />

              <Hotspot id="router" active={active} onPick={setActive}>
                <rect
                  className="hl"
                  x="35"
                  y="170"
                  width="90"
                  height="60"
                  rx="8"
                  fill="var(--panel)"
                  stroke={on("router")}
                  strokeWidth="2"
                />
                <text
                  x="80"
                  y="198"
                  fontSize="12.5"
                  textAnchor="middle"
                  fill="var(--ink)"
                >
                  {t({ en: "router", ja: "ルーター" })}
                </text>
                <text
                  x="80"
                  y="214"
                  fontSize="11"
                  textAnchor="middle"
                  fill="var(--muted)"
                >
                  BGP · 802.1Q
                </text>
              </Hotspot>

              <Hotspot id="carrier" active={active} onPick={setActive}>
                <rect x="135" y="175" width="120" height="50" fill="transparent" />
                <text
                  x="190"
                  y="190"
                  fontSize="12.5"
                  textAnchor="middle"
                  fill={
                    on("carrier") === "var(--fiber)" ? "var(--fiber)" : "var(--muted)"
                  }
                >
                  {t({ en: "carrier circuit", ja: "キャリア回線" })}
                </text>
              </Hotspot>

              <Hotspot id="cage" active={active} onPick={setActive}>
                <rect
                  className="hl"
                  x="265"
                  y="150"
                  width="90"
                  height="100"
                  rx="6"
                  fill="var(--panel)"
                  stroke={on("cage")}
                  strokeWidth="2"
                />
                <text
                  x="310"
                  y="195"
                  fontSize="12.5"
                  textAnchor="middle"
                  fill="var(--ink)"
                >
                  {t({ en: "cage", ja: "ケージ" })}
                </text>
                <text
                  x="310"
                  y="211"
                  fontSize="11"
                  textAnchor="middle"
                  fill="var(--muted)"
                >
                  {t({ en: "you / partner", ja: "自社 / 事業者" })}
                </text>
              </Hotspot>

              <Hotspot id="xc" active={active} onPick={setActive}>
                <rect x="358" y="160" width="74" height="80" fill="transparent" />
                <path
                  d="M355 200 C380 150 410 250 435 200"
                  stroke={active === "xc" ? "var(--fiber)" : "var(--muted)"}
                  strokeWidth={active === "xc" ? 4 : 2}
                  fill="none"
                />
                <text
                  x="395"
                  y="262"
                  fontSize="12.5"
                  textAnchor="middle"
                  fill="var(--fiber)"
                >
                  {t({ en: "cross connect", ja: "クロスコネクト" })}
                </text>
                <text
                  x="395"
                  y="276"
                  fontSize="11"
                  textAnchor="middle"
                  fill="var(--muted)"
                >
                  LOA-CFA · SMF
                </text>
              </Hotspot>

              <Hotspot id="dxrouter" active={active} onPick={setActive}>
                <rect
                  className="hl"
                  x="435"
                  y="150"
                  width="120"
                  height="100"
                  rx="6"
                  fill="var(--panel)"
                  stroke={on("dxrouter")}
                  strokeWidth="2"
                />
                <text
                  x="495"
                  y="192"
                  fontSize="12.5"
                  textAnchor="middle"
                  fill="var(--aws)"
                >
                  {t({ en: "AWS DX router", ja: "AWS DX ルーター" })}
                </text>
                <text
                  x="495"
                  y="208"
                  fontSize="11"
                  textAnchor="middle"
                  fill="var(--muted)"
                >
                  {t({ en: "1–400G port", ja: "1〜400G ポート" })}
                </text>
              </Hotspot>

              <Hotspot id="vif" active={active} onPick={setActive}>
                <rect
                  className="hl"
                  x="230"
                  y="290"
                  width="330"
                  height="64"
                  rx="6"
                  fill="var(--panel)"
                  stroke={on("vif")}
                  strokeWidth="2"
                />
                {[
                  ["VLAN 101 · private", "var(--ok)"],
                  ["VLAN 102 · public", "var(--violet)"],
                  ["VLAN 103 · transit", "var(--aws)"],
                ].map(([label, color], i) => (
                  <text
                    key={label}
                    x={i === 1 ? 400 : 245}
                    y={i === 2 ? 340 : 314}
                    fontSize="12.5"
                    fill={color}
                  >
                    {label}
                  </text>
                ))}
              </Hotspot>

              <Hotspot id="backbone" active={active} onPick={setActive}>
                <rect x="560" y="170" width="130" height="60" fill="transparent" />
                <text
                  x="625"
                  y="188"
                  fontSize="12.5"
                  textAnchor="middle"
                  fill={active === "backbone" ? "var(--fiber)" : "var(--aws)"}
                >
                  {t({ en: "AWS backbone", ja: "AWS バックボーン" })}
                </text>
              </Hotspot>

              <Hotspot id="gateway" active={active} onPick={setActive}>
                <rect
                  className="hl"
                  x="700"
                  y="160"
                  width="100"
                  height="80"
                  rx="8"
                  fill="var(--panel)"
                  stroke={on("gateway")}
                  strokeWidth="2"
                />
                <text
                  x="750"
                  y="194"
                  fontSize="13.1"
                  textAnchor="middle"
                  fill="var(--ink)"
                >
                  VGW / DXGW
                </text>
                <text
                  x="750"
                  y="210"
                  fontSize="11"
                  textAnchor="middle"
                  fill="var(--muted)"
                >
                  TGW · Cloud WAN
                </text>
              </Hotspot>

              <Hotspot id="vpc" active={active} onPick={setActive}>
                <rect
                  className="hl"
                  x="860"
                  y="80"
                  width="110"
                  height="70"
                  rx="8"
                  fill="var(--panel)"
                  stroke={on("vpc")}
                  strokeWidth="2"
                />
                <text
                  x="915"
                  y="112"
                  fontSize="12.5"
                  textAnchor="middle"
                  fill="var(--ok)"
                >
                  VPC
                </text>
                <text
                  x="915"
                  y="128"
                  fontSize="11"
                  textAnchor="middle"
                  fill="var(--muted)"
                >
                  10.0.0.0/16
                </text>
              </Hotspot>

              <Hotspot id="public" active={active} onPick={setActive}>
                <rect
                  className="hl"
                  x="860"
                  y="250"
                  width="110"
                  height="70"
                  rx="8"
                  fill="var(--panel)"
                  stroke={on("public")}
                  strokeWidth="2"
                />
                <text
                  x="915"
                  y="282"
                  fontSize="12.5"
                  textAnchor="middle"
                  fill="var(--violet)"
                >
                  S3 · DynamoDB
                </text>
                <text
                  x="915"
                  y="298"
                  fontSize="11"
                  textAnchor="middle"
                  fill="var(--muted)"
                >
                  {t({ en: "public IPs", ja: "パブリック IP" })}
                </text>
              </Hotspot>
            </svg>
          </Scroll>
        )}
      </Panel>
      {!narrow && (
        <Panel>
          <p className="mb-1 text-sm font-bold text-[var(--fiber)]">
            {t(PARTS[active].name)}
          </p>
          <p aria-live="polite" className="leading-relaxed">
            {t(PARTS[active].body)}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {(Object.keys(PARTS) as PartId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                className={`min-h-8 rounded-full border-2 px-3 py-1 text-xs font-bold ${
                  active === id
                    ? "border-[var(--fiber)] text-[var(--fiber)]"
                    : "border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {t(PARTS[id].name)}
              </button>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

export function Overview() {
  const { t } = useLang();
  return (
    <Section
      id="overview"
      index="01"
      kicker={C.kicker}
      title={C.title}
      lead={C.lead}
      layers={["physical", "routing", "aws"]}
    >
      <div className="mb-8 max-w-3xl">
        <HikariSays mood="happy">
          <T
            c={{
              en: "Think of a DX location as an airport. AWS runs the boarding gate (its router) and the flights (the backbone). Getting to the airport is up to you: your carrier circuit is the airport bus. People often assume AWS provides the whole line — it only starts at the gate.",
              ja: "DX ロケーションは空港みたいなもの。AWS が担当するのは搭乗口 (AWS ルーター) と飛行機 (バックボーン) だけ。空港まではリムジンバス (キャリア回線) で自分で来てね。「AWS が回線を全部用意してくれる」と思われがちだけど、そこは自分の担当だよ。",
            }}
          />
        </HikariSays>
      </div>
      <PathDiagram />
      <h3 className="mt-14 mb-4 text-xl font-semibold">{t(C.compareTitle)}</h3>
      <Scroll>
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-left text-xs font-bold text-[var(--muted)]">
              <th className="py-2 pr-4" />
              <th className="py-2 pr-4 text-[var(--fiber)]">Direct Connect</th>
              <th className="py-2 pr-4">Site-to-Site VPN</th>
              <th className="py-2">Internet</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.k.en} className="border-b border-[var(--line)] align-top">
                <th
                  scope="row"
                  className="py-3 pr-4 text-left font-medium whitespace-nowrap"
                >
                  {t(r.k)}
                </th>
                <td className="py-3 pr-4">{t(r.dx)}</td>
                <td className="py-3 pr-4 text-[var(--muted)]">{t(r.vpn)}</td>
                <td className="py-3 text-[var(--muted)]">{t(r.net)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <div className="mt-6 max-w-3xl">
        <Callout tone="warn" title={C.notEncTitle}>
          <T c={C.notEnc} />
        </Callout>
      </div>
    </Section>
  );
}
