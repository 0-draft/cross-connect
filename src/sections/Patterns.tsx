import { useState } from "react";
import type { L } from "../i18n/lang";
import { useLang } from "../i18n/useLang";
import { Panel, Section, Segmented, Tag } from "../components/ui";
import { type Answers, type Plan, recommend } from "../lib/advisor";

const C = {
  kicker: { en: "Design patterns", ja: "設計パターン" },
  title: { en: "Pick a topology in seven questions", ja: "7 つの質問でトポロジーを選ぶ" },
  lead: {
    en: "Answer for your workload and the plan updates live. It follows the decision tree in the research notes; it is a starting point for a design review, not a substitute for one.",
    ja: "自分のワークロードに合わせて答えると、構成案がその場で更新されます。調査ノートの決定木に沿ったもので、設計レビューの出発点であって代わりではありません。",
  },
  plan: { en: "Recommended plan", ja: "推奨構成" },
  anti: {
    en: "Anti-patterns that cause real outages",
    ja: "実際に障害を起こすアンチパターン",
  },
  yes: { en: "Yes", ja: "はい" },
  no: { en: "No", ja: "いいえ" },
};

const Q = {
  production: { en: "Production / business critical?", ja: "本番・業務クリティカル?" },
  needs9999: { en: "Need a 99.99% SLA?", ja: "99.99% の SLA が必要?" },
  scale: { en: "How many VPCs / Regions?", ja: "VPC / リージョンの規模は?" },
  gbps: { en: "Bandwidth per location", ja: "ロケーションあたりの帯域" },
  encryption: { en: "Encryption", ja: "暗号化" },
  publicServices: {
    en: "AWS public endpoints over DX?",
    ja: "AWS パブリックエンドポイントを DX 経由で?",
  },
  siteToSite: { en: "Traffic between your own sites?", ja: "自社拠点間の通信も?" },
};

const RES: Record<Plan["resiliency"], L> = {
  maximum: {
    en: "Maximum resiliency — 2 locations × 2 connections on separate devices (99.99%, Enterprise Support + WAR)",
    ja: "Maximum — 2 拠点 × 各 2 本、別機器 (99.99%、Enterprise Support + WAR 必須)",
  },
  high: {
    en: "High resiliency — 1 connection in each of 2 locations (99.9%)",
    ja: "High — 2 拠点に各 1 本 (99.9%)",
  },
  dev: {
    en: "Dev/Test — 2 connections in 1 location, or 1 DX + VPN backup",
    ja: "開発 / テスト — 1 拠点に 2 本、または DX 1 本 + VPN バックアップ",
  },
};

const ATTACH: Record<Plan["attach"], L> = {
  vgw: {
    en: "Private VIF → DX gateway → VGWs (up to 20 VPCs, no TGW charges)",
    ja: "プライベート VIF → DXGW → VGW (最大 20 VPC、TGW 料金なし)",
  },
  tgw: {
    en: "Transit VIF → DX gateway → Transit Gateway (summarize allowed prefixes, ≤ 200 per TGW)",
    ja: "トランジット VIF → DXGW → Transit Gateway (許可されたプレフィックスは集約、TGW あたり 200 まで)",
  },
  cloudwan: {
    en: "Transit VIF → DX gateway → Cloud WAN core network (segments, no DX communities)",
    ja: "トランジット VIF → DXGW → Cloud WAN コアネットワーク (セグメント、DX コミュニティ非対応)",
  },
};

function Yn({
  label,
  value,
  onChange,
}: {
  label: L;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { t } = useLang();
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] py-2.5">
      <span className="text-sm">{t(label)}</span>
      <Segmented
        label={t(label)}
        value={value ? "y" : "n"}
        options={[
          { value: "y", label: t(C.yes) },
          { value: "n", label: t(C.no) },
        ]}
        onChange={(v) => onChange(v === "y")}
      />
    </div>
  );
}

const ANTI: [L, L][] = [
  [
    { en: "One connection for production", ja: "本番を 1 本で運用" },
    {
      en: "95% SLA at best; every maintenance window is an outage.",
      ja: "SLA は最大 95%。メンテのたびに停止。",
    },
  ],
  [
    { en: "Two connections in the same location", ja: "同じロケーションに 2 本" },
    {
      en: "Survives a device failure, not a building. Dev/Test grade.",
      ja: "機器障害には耐えるが建物障害には耐えない。開発 / テスト向け。",
    },
  ],
  [
    {
      en: "Redundant links through one conduit or one router",
      ja: "冗長回線が同じ管路・同じルーター",
    },
    {
      en: "Hidden shared fate. Diversify carriers, paths and routers.",
      ja: "隠れた共倒れ要因。キャリア・経路・ルーターを分散。",
    },
  ],
  [
    { en: "Every link at 90% utilization", ja: "全回線を 90% で運用" },
    {
      en: "After a failure the survivors drown. Size N+1, alarm at 70–80%.",
      ja: "障害時に生き残った回線が溢れる。N+1 で設計し 70〜80% でアラーム。",
    },
  ],
  [
    { en: "BGP without BFD", ja: "BFD なしの BGP" },
    {
      en: "Up to 90 s of blackholing on silent failures. BFD 300 ms × 3.",
      ja: "無言の障害で最大 90 秒ブラックホール。BFD 300 ms × 3 を。",
    },
  ],
  [
    {
      en: "Active/passive that disagrees with itself",
      ja: "双方向で食い違う Active/Passive",
    },
    {
      en: "AWS prefers A, you prefer B → asymmetric paths break stateful firewalls.",
      ja: "AWS は A、自社は B を優先 → 非対称経路でステートフル FW が壊れる。",
    },
  ],
  [
    {
      en: "VPN backup advertising more specifics",
      ja: "VPN バックアップでより細かい経路を広告",
    },
    {
      en: "Longest prefix wins, so the 'backup' VPN becomes primary.",
      ja: "最長一致が勝つので「バックアップ」の VPN が主経路になる。",
    },
  ],
  [
    { en: "Hundreds of /24s on a private VIF", ja: "プライベート VIF に /24 を数百本" },
    {
      en: "Over the prefix limit the session goes Idle. Summarize; alarm on PrefixesAccepted.",
      ja: "上限超えでセッションが Idle に。集約し、PrefixesAccepted にアラーム。",
    },
  ],
  [
    { en: "Same ASN on TGW and DXGW", ja: "TGW と DXGW が同じ ASN" },
    {
      en: "Both default to 64512 → the association fails.",
      ja: "どちらもデフォルト 64512 → 関連付けに失敗。",
    },
  ],
  [
    { en: "Never testing failover", ja: "フェイルオーバーを試さない" },
    {
      en: "You find the bug during AWS maintenance. Run the BGP failover test.",
      ja: "AWS のメンテ中にバグが発覚する。BGP フェイルオーバーテストを定期実施。",
    },
  ],
];

export function Patterns() {
  const { t } = useLang();
  const [a, setA] = useState<Answers>({
    production: true,
    needs9999: false,
    scale: "many",
    publicServices: false,
    encryption: "link",
    gbps: 10,
    siteToSite: false,
  });
  const set = <K extends keyof Answers>(k: K, v: Answers[K]) =>
    setA((x) => ({ ...x, [k]: v }));
  const p = recommend(a);

  const conn =
    p.connection === "hosted"
      ? `Hosted ${p.portGbps * 1000} Mbps`
      : p.connection === "dedicated-lag"
        ? "Dedicated 2 × 400G LAG"
        : `Dedicated ${p.portGbps}G`;

  const lines: [string, string, string][] = [
    ["resiliency", t(RES[p.resiliency]), "var(--fiber)"],
    ["connection", conn, "var(--fiber)"],
    ["routing", t(ATTACH[p.attach]), "var(--aws)"],
  ];
  if (p.publicVif)
    lines.push([
      "public",
      t({
        en: "+ Public VIF, firewalled, filtered with 7224:8100/8200 — or VPC endpoints instead",
        ja: "+ パブリック VIF (FW 必須、7224:8100/8200 でフィルタ) — または VPC エンドポイント",
      }),
      "var(--violet)",
    ]);
  if (p.macsec)
    lines.push([
      "encrypt",
      t({
        en: "+ MACsec on every port (must_encrypt after validation)",
        ja: "+ 全ポートで MACsec (検証後 must_encrypt)",
      }),
      "var(--ok)",
    ]);
  if (p.privateIpVpn)
    lines.push([
      "encrypt",
      t({
        en: "+ Private IP VPN over the transit VIF to the TGW",
        ja: "+ トランジット VIF 上で TGW への Private IP VPN",
      }),
      "var(--ok)",
    ]);
  if (p.siteLink)
    lines.push([
      "sitelink",
      t({
        en: "+ SiteLink on the VIFs ($0.50/VIF-hour; unique ASN per site)",
        ja: "+ VIF で SiteLink を有効化 ($0.50/VIF 時、拠点ごとに別 ASN)",
      }),
      "var(--aws)",
    ]);
  if (p.connection !== "hosted" && (p.portGbps === 10 || p.portGbps === 100))
    lines.push([
      "billing",
      t({
        en: "Compare flat-rate port-pair pricing if egress is heavy and steady",
        ja: "送信量が多く安定しているなら定額ポートペアと比較",
      }),
      "var(--muted)",
    ]);

  return (
    <Section
      id="patterns"
      index="11"
      kicker={C.kicker}
      title={C.title}
      lead={C.lead}
      layers={["aws", "routing", "money"]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <Yn
            label={Q.production}
            value={a.production}
            onChange={(v) => set("production", v)}
          />
          {a.production && (
            <Yn
              label={Q.needs9999}
              value={a.needs9999}
              onChange={(v) => set("needs9999", v)}
            />
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] py-2.5">
            <span className="text-sm">{t(Q.scale)}</span>
            <Segmented
              label={t(Q.scale)}
              value={a.scale}
              options={[
                { value: "few", label: "≤ 20 VPC" },
                { value: "many", label: t({ en: "Many + transit", ja: "多数 + 中継" }) },
                { value: "global", label: t({ en: "Global WAN", ja: "グローバル WAN" }) },
              ]}
              onChange={(v) => set("scale", v)}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] py-2.5">
            <span className="text-sm">{t(Q.gbps)}</span>
            <select
              value={a.gbps}
              onChange={(e) => set("gbps", Number(e.target.value))}
              className="rounded-full border border-[var(--line)] bg-[var(--panel-2)] px-2 py-1 font-mono text-sm"
            >
              {[0.2, 0.5, 1, 5, 10, 40, 100, 200, 400, 800].map((g) => (
                <option key={g} value={g}>
                  {g < 1 ? `${g * 1000} Mbps` : `${g} Gbps`}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--line)] py-2.5">
            <span className="text-sm">{t(Q.encryption)}</span>
            <Segmented
              label={t(Q.encryption)}
              value={a.encryption}
              options={[
                { value: "none", label: t({ en: "None", ja: "不要" }) },
                { value: "link", label: t({ en: "Link", ja: "回線" }) },
                { value: "end-to-end", label: t({ en: "To VPC edge", ja: "VPC まで" }) },
              ]}
              onChange={(v) => set("encryption", v)}
            />
          </div>
          <Yn
            label={Q.publicServices}
            value={a.publicServices}
            onChange={(v) => set("publicServices", v)}
          />
          <Yn
            label={Q.siteToSite}
            value={a.siteToSite}
            onChange={(v) => set("siteToSite", v)}
          />
        </Panel>
        <Panel className="border-[var(--fiber)]">
          <p className="mb-4 text-sm font-bold text-[var(--fiber)]">{t(C.plan)}</p>
          <p aria-live="polite" className="sr-only">
            {lines.map(([, v]) => v).join(". ")}
          </p>
          <ul className="space-y-3">
            {lines.map(([k, v, color], i) => (
              <li
                key={`${k}-${i}`}
                className="grid grid-cols-[6.5rem_1fr] items-start gap-3 text-sm"
              >
                <Tag color={color}>{k}</Tag>
                <span className="leading-relaxed">{v}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <h3 className="mt-14 mb-4 text-xl font-semibold">{t(C.anti)}</h3>
      <ul className="grid gap-3 sm:grid-cols-2">
        {ANTI.map(([bad, why]) => (
          <li
            key={bad.en}
            className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4"
          >
            <p className="mb-1 font-semibold text-[var(--bad)]">✕ {t(bad)}</p>
            <p className="text-sm text-[var(--muted)]">{t(why)}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
