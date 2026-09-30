import { useState } from "react";
import type { L } from "../i18n/lang";
import { useLang } from "../i18n/useLang";
import { HikariSays } from "../components/Hikari";
import { Callout, Panel, Scroll, Section, Segmented, T, Tag } from "../components/ui";
import { parseCidr } from "../lib/cidr";
import { type Association, advertised } from "../lib/dxgw";

const C = {
  kicker: { en: "Direct Connect gateway", ja: "Direct Connect ゲートウェイ" },
  title: {
    en: "A global route reflector that unties VIFs from Regions",
    ja: "VIF をリージョンから解き放つ、グローバルなルートリフレクター",
  },
  lead: {
    en: "A Direct Connect gateway (DXGW) is a global, free, control-plane object: AWS describes it as a distributed set of BGP route reflectors outside the data path. Attach VIFs on one side, associate gateways in any Region and any account on the other.",
    ja: "Direct Connect ゲートウェイ (DXGW) はグローバルかつ無料のコントロールプレーンのオブジェクトです。AWS はこれを「データ経路の外にある分散 BGP ルートリフレクター群」と説明しています。片側に VIF を、反対側に任意のリージョン・任意のアカウントのゲートウェイを関連付けます。",
  },
  modes: { en: "One DXGW, one mode", ja: "1 つの DXGW に 1 つのモード" },
  modesNote: {
    en: "The three association types are mutually exclusive on a DXGW. The DXGW's own ASN must be private (default 64512).",
    ja: "3 種類の関連付けは 1 つの DXGW の中で排他的です。DXGW 自身の ASN はプライベート ASN (デフォルト 64512)。",
  },
  prefixLab: {
    en: "Allowed prefixes lab",
    ja: "許可されたプレフィックス (allowed prefixes) ラボ",
  },
  prefixLead: {
    en: "The most misunderstood DXGW setting: on a VGW association it is a filter, on a TGW association it is the literal advertisement.",
    ja: "DXGW で最も誤解される設定。VGW 関連付けではフィルター、TGW 関連付けでは「広告する経路そのもの」です。",
  },
  vpcCidr: { en: "VPC CIDR behind the gateway", ja: "ゲートウェイ配下の VPC CIDR" },
  allowed: { en: "Allowed prefix", ja: "許可されたプレフィックス" },
  vgwAssoc: { en: "VGW association", ja: "VGW 関連付け" },
  tgwAssoc: { en: "TGW association", ja: "TGW 関連付け" },
  slOn: { en: "AWS backbone, shortest path", ja: "AWS バックボーンの最短経路" },
  slOff: { en: "VIF-to-VIF blocked", ja: "VIF 間の通信は不可" },
  presets: { en: "Try an example prefix", ja: "例のプレフィックスを試す" },
  receives: { en: "Your router receives", ja: "オンプレのルーターが受け取る経路" },
  nothing: { en: "nothing", ja: "何も届かない" },
  invalid: { en: "Not a valid IPv4 CIDR", ja: "IPv4 CIDR として不正" },
  transitTitle: {
    en: "No transitive routing — except SiteLink",
    ja: "トランジットルーティング不可 — SiteLink を除く",
  },
  sitelink: { en: "SiteLink", ja: "SiteLink" },
  sitelinkOn: {
    en: "SiteLink on: the two data centers exchange traffic between Direct Connect locations over the AWS backbone, without entering a Region. $0.50 per SiteLink VIF-hour plus per-GB transfer; needs private VIFs on a DXGW or transit VIFs.",
    ja: "SiteLink 有効: 2 つのデータセンター間の通信が、リージョンに入らず DX ロケーション間の AWS バックボーンを直接通ります。SiteLink VIF 1 本あたり $0.50/時 + GB 単位の転送料。DXGW 上のプライベート VIF かトランジット VIF が必要。",
  },
  sitelinkOff: {
    en: "SiteLink off: a DXGW never forwards VIF-to-VIF or VPC-to-VPC. The two data centers cannot use AWS as a transit between them.",
    ja: "SiteLink 無効: DXGW は VIF 間・VPC 間の転送を一切しません。2 つのデータセンターは AWS を中継路として使えません。",
  },
  supernetTitle: { en: "The supernet caveat", ja: "スーパーネットの落とし穴" },
  supernet: {
    en: "If on-premises advertises a supernet (e.g. 10.0.0.0/8 or 0.0.0.0/0) covering several VPCs whose VGWs share a DXGW and the same VIF, those VPCs can reach each other via the DX endpoint. Use security groups, specific routes, or separate DXGWs if that matters. VPCs behind TGWs on one DXGW can also talk; block with blackhole routes.",
    ja: "オンプレから 10.0.0.0/8 や 0.0.0.0/0 のようなスーパーネットを広告していて、同じ DXGW・同じ VIF を共有する複数 VPC がそれに含まれると、VPC 同士が DX エンドポイント経由で通信できてしまいます。問題になるならセキュリティグループ、具体的な経路の広告、DXGW の分離で対処。同じ DXGW 配下の TGW 同士の VPC も通信可能なので、ブラックホールルートで塞ぎます。",
  },
  quotas: { en: "Quotas", ja: "クォータ" },
};

type Mode = "vgw" | "tgw" | "cwan";

const MODES: Record<Mode, { vif: L; targets: string[]; note: L }> = {
  vgw: {
    vif: { en: "private VIF", ja: "プライベート VIF" },
    targets: ["VGW · us-east-1", "VGW · eu-west-1", "VGW · ap-northeast-1 (acct B)"],
    note: {
      en: "Up to 20 VGWs, any Region, any account (via association proposals). VPC CIDRs must not overlap.",
      ja: "最大 20 VGW、任意のリージョン・任意のアカウント (関連付け提案経由)。VPC CIDR は重複不可。",
    },
  },
  tgw: {
    vif: { en: "transit VIF", ja: "トランジット VIF" },
    targets: ["TGW · us-east-1", "TGW · ap-northeast-1", "TGW · eu-central-1"],
    note: {
      en: "Up to 6 TGWs per DXGW (and 20 DXGWs per TGW). Give TGWs in different Regions unique ASNs. Allowed prefixes: max 200 per TGW, no overlap across TGWs.",
      ja: "DXGW あたり最大 6 TGW (TGW あたり最大 20 DXGW)。リージョンごとの TGW には一意の ASN を。許可されたプレフィックスは TGW あたり最大 200、TGW 間で重複不可。",
    },
  },
  cwan: {
    vif: { en: "transit VIF", ja: "トランジット VIF" },
    targets: ["CNE · us-west-2", "CNE · ap-southeast-2", "segment: prod"],
    note: {
      en: "Native Cloud WAN attachment (GA 2024-11-25): one core network, one segment, managed from Network Manager. No allowed-prefix lists, no DX communities, no static routes; AS_PATH is preserved; up to 5,000 prefixes toward on-premises.",
      ja: "Cloud WAN ネイティブ接続 (2024-11-25 GA): コアネットワーク 1 つ・セグメント 1 つ、Network Manager から管理。許可されたプレフィックスリスト・DX コミュニティ・静的ルートは非対応、AS_PATH は保持、オンプレ向け最大 5,000 プレフィックス。",
    },
  },
};

function ModeDiagram({ mode }: { mode: Mode }) {
  const { t } = useLang();
  const m = MODES[mode];
  return (
    <Scroll>
      <svg
        viewBox="0 0 900 290"
        className="diagram min-w-[640px]"
        role="img"
        aria-label={t(m.note)}
      >
        {[0, 1].map((i) => (
          <g key={i}>
            <rect
              x="10"
              y={50 + i * 110}
              width="120"
              height="50"
              rx="8"
              fill="var(--panel-2)"
              stroke="var(--line)"
            />
            <text
              x="70"
              y={80 + i * 110}
              fontSize="13.8"
              textAnchor="middle"
              fill="var(--ink)"
            >
              DC {i + 1}
            </text>
            <path
              d={`M130 ${75 + i * 110} C230 ${75 + i * 110} 280 130 360 130`}
              stroke="var(--fiber)"
              strokeWidth="3"
              fill="none"
              className="flow"
            />
            <text x="210" y={66 + i * 118} fontSize="11.2" fill="var(--muted)">
              {t(m.vif)}
            </text>
          </g>
        ))}
        <circle
          cx="420"
          cy="130"
          r="60"
          fill="var(--panel)"
          stroke="var(--fiber)"
          strokeWidth="2"
        />
        <text x="420" y="126" fontSize="15" textAnchor="middle" fill="var(--fiber)">
          DXGW
        </text>
        <text x="420" y="142" fontSize="11" textAnchor="middle" fill="var(--muted)">
          {t({ en: "global · ASN 64512", ja: "グローバル · ASN 64512" })}
        </text>
        {m.targets.map((label, i) => {
          const y = 40 + i * 90;
          return (
            <g key={label}>
              <path
                d={`M480 130 C560 130 580 ${y + 25} 640 ${y + 25}`}
                stroke="var(--aws)"
                strokeWidth="2"
                fill="none"
              />
              <rect
                x="640"
                y={y}
                width="250"
                height="50"
                rx="8"
                fill="var(--panel)"
                stroke="var(--aws)"
              />
              <text
                x="765"
                y={y + 30}
                fontSize="12.5"
                textAnchor="middle"
                fill="var(--ink)"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </Scroll>
  );
}

const PRESETS = ["10.0.0.0/15", "10.0.0.0/16", "10.0.0.0/24", "22.0.0.0/24"];

function PrefixLab() {
  const { t } = useLang();
  const [vpc, setVpc] = useState("10.0.0.0/16");
  const [allowed, setAllowed] = useState("10.0.0.0/15");
  const v = parseCidr(vpc);
  const a = parseCidr(allowed);
  const inputCls =
    "w-full rounded-full border border-[var(--line)] bg-[var(--panel-2)] px-3 py-2 font-mono text-sm";

  return (
    <Panel>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-[var(--muted)]">{t(C.vpcCidr)}</span>
          <input
            className={inputCls}
            value={vpc}
            onChange={(e) => setVpc(e.target.value)}
            aria-invalid={!v}
            spellCheck={false}
          />
          {!v && <span className="text-xs text-[var(--bad)]">{t(C.invalid)}</span>}
        </label>
        <div className="text-sm">
          <label>
            <span className="mb-1 block text-[var(--muted)]">{t(C.allowed)}</span>
            <input
              className={inputCls}
              value={allowed}
              onChange={(e) => setAllowed(e.target.value)}
              aria-invalid={!a}
              spellCheck={false}
            />
          </label>
          {!a && <span className="text-xs text-[var(--bad)]">{t(C.invalid)}</span>}
          <span
            role="group"
            aria-label={t(C.presets)}
            className="mt-2 flex flex-wrap gap-1.5"
          >
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAllowed(p)}
                className="min-h-8 rounded-full border-2 border-[var(--line)] px-3 py-1 font-mono text-xs font-bold text-[var(--muted)] hover:border-[var(--fiber)] hover:text-[var(--ink)]"
              >
                {p}
              </button>
            ))}
          </span>
        </div>
      </div>
      <div
        className="mt-6 grid gap-4 sm:grid-cols-2"
        aria-live="polite"
        aria-atomic="true"
      >
        {(["vgw", "tgw"] as Association[]).map((kind) => {
          const got = v && a ? advertised(kind, [v], [a]) : [];
          return (
            <div
              key={kind}
              className="rounded-2xl border border-[var(--line)] bg-[var(--panel-2)] p-4"
            >
              <p className="mb-2 text-xs font-bold text-[var(--muted)]">
                {t(kind === "vgw" ? C.vgwAssoc : C.tgwAssoc)} → {t(C.receives)}
              </p>
              <p className="font-mono text-lg">
                {got.length ? (
                  got.map((g) => (
                    <span key={g} className="text-[var(--ok)]">
                      {g}
                    </span>
                  ))
                ) : (
                  <span className="text-[var(--bad)]">∅ {t(C.nothing)}</span>
                )}
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                {kind === "vgw" ? (
                  <T
                    c={{
                      en: "Filter: the VPC CIDR itself passes only if an allowed prefix is equal or wider.",
                      ja: "フィルター: 許可されたプレフィックスが VPC CIDR と同じかより広いときだけ、VPC CIDR そのものが通る。",
                    }}
                  />
                ) : (
                  <T
                    c={{
                      en: "Advertisement: exactly the list, originated by the DXGW — even space no VPC uses.",
                      ja: "広告: リストそのものを DXGW が発信する。VPC が使っていない空間でも広告される。",
                    }}
                  />
                )}
              </p>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function SiteLinkDiagram() {
  const { t } = useLang();
  const [on, setOn] = useState(false);
  return (
    <Panel>
      <div className="mb-4">
        <Segmented
          label={t(C.sitelink)}
          value={on ? "on" : "off"}
          options={[
            { value: "off", label: "SiteLink off" },
            { value: "on", label: "SiteLink on" },
          ]}
          onChange={(v) => setOn(v === "on")}
        />
      </div>
      <Scroll>
        <svg
          viewBox="0 0 900 230"
          className="diagram min-w-[640px]"
          role="img"
          aria-label={t(on ? C.sitelinkOn : C.sitelinkOff)}
        >
          <rect
            x="10"
            y="20"
            width="130"
            height="50"
            rx="8"
            fill="var(--panel-2)"
            stroke="var(--line)"
          />
          <text x="75" y="50" fontSize="13.8" textAnchor="middle" fill="var(--ink)">
            {t({ en: "DC Tokyo", ja: "東京 DC" })}
          </text>
          <rect
            x="760"
            y="20"
            width="130"
            height="50"
            rx="8"
            fill="var(--panel-2)"
            stroke="var(--line)"
          />
          <text x="825" y="50" fontSize="13.8" textAnchor="middle" fill="var(--ink)">
            {t({ en: "DC London", ja: "ロンドン DC" })}
          </text>
          <rect
            x="180"
            y="20"
            width="140"
            height="50"
            rx="8"
            fill="var(--panel)"
            stroke="var(--fiber)"
          />
          <text x="250" y="50" fontSize="12.5" textAnchor="middle" fill="var(--fiber)">
            {t({ en: "DX loc · Tokyo", ja: "DX ロケーション 東京" })}
          </text>
          <rect
            x="580"
            y="20"
            width="140"
            height="50"
            rx="8"
            fill="var(--panel)"
            stroke="var(--fiber)"
          />
          <text x="650" y="50" fontSize="12.5" textAnchor="middle" fill="var(--fiber)">
            {t({ en: "DX loc · London", ja: "DX ロケーション ロンドン" })}
          </text>
          <line x1="140" x2="180" y1="45" y2="45" stroke="var(--fiber)" strokeWidth="3" />
          <line x1="720" x2="760" y1="45" y2="45" stroke="var(--fiber)" strokeWidth="3" />
          <circle cx="450" cy="170" r="40" fill="var(--panel)" stroke="var(--fiber)" />
          <text x="450" y="174" fontSize="13.8" textAnchor="middle" fill="var(--fiber)">
            DXGW
          </text>
          <path
            d="M250 70 C250 150 370 170 410 170"
            stroke="var(--line)"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M650 70 C650 150 530 170 490 170"
            stroke="var(--line)"
            strokeWidth="2"
            fill="none"
          />
          {on ? (
            <path d="M320 45 H580" stroke="var(--ok)" strokeWidth="4" className="flow" />
          ) : (
            <g>
              <path
                d="M320 45 H580"
                stroke="var(--bad)"
                strokeWidth="2"
                strokeDasharray="3 8"
              />
              <text x="450" y="38" fontSize="20" textAnchor="middle" fill="var(--bad)">
                ✕
              </text>
            </g>
          )}
          <text
            x="450"
            y="70"
            fontSize="12.5"
            textAnchor="middle"
            fill={on ? "var(--ok)" : "var(--bad)"}
          >
            {t(on ? C.slOn : C.slOff)}
          </text>
        </svg>
      </Scroll>
      <p aria-live="polite" className="mt-3 text-sm leading-relaxed">
        {t(on ? C.sitelinkOn : C.sitelinkOff)}
      </p>
    </Panel>
  );
}

const QUOTAS: [L, string][] = [
  [{ en: "VGWs per DXGW", ja: "DXGW あたり VGW" }, "20"],
  [{ en: "TGWs per DXGW", ja: "DXGW あたり TGW" }, "6"],
  [{ en: "DXGWs per TGW", ja: "TGW あたり DXGW" }, "20"],
  [
    {
      en: "Private/transit VIFs per DXGW",
      ja: "DXGW あたりプライベート/トランジット VIF",
    },
    "30",
  ],
  [{ en: "DXGWs per account", ja: "アカウントあたり DXGW" }, "200"],
  [{ en: "Allowed prefixes per TGW", ja: "TGW あたり許可されたプレフィックス" }, "200"],
  [
    {
      en: "Inbound prefix pool per DXGW (2026)",
      ja: "DXGW あたり受信プレフィックス枠 (2026)",
    },
    "10,000",
  ],
  [{ en: "DXGW price", ja: "DXGW の料金" }, "$0"],
];

export function Gateway() {
  const { t } = useLang();
  const [mode, setMode] = useState<Mode>("vgw");
  return (
    <Section
      id="gateway"
      index="05"
      kicker={C.kicker}
      title={C.title}
      lead={C.lead}
      layers={["aws", "routing"]}
    >
      <div className="mb-8 max-w-3xl">
        <HikariSays mood="thinking">
          <T
            c={{
              en: "A DX gateway is directory assistance, not a road. It tells each side which numbers the other side has, but your traffic never flows through it, and by design it won't link two parties on the same side — no VPC-to-VPC, no VIF-to-VIF. And “allowed prefixes” changes job depending on who is behind it: a checkpoint for a VGW, a signboard for a Transit Gateway.",
              ja: "DX ゲートウェイは道路じゃなくて番号案内 (104) みたいなもの。両側に「相手側にはどんな番号 (経路) があるか」を教えるけど、通信そのものは通らないし、同じ側どうしをつなぐこともしない (VPC 間も VIF 間もダメ)。そして「許可されたプレフィックス」は相手によって役割が変わる。VGW なら検問所、Transit Gateway なら看板。",
            }}
          />
        </HikariSays>
      </div>
      <h3 className="mb-2 text-xl font-semibold">{t(C.modes)}</h3>
      <p className="mb-4 text-sm text-[var(--muted)]">{t(C.modesNote)}</p>
      <div className="mb-4">
        <Segmented
          label={t(C.modes)}
          value={mode}
          options={[
            { value: "vgw", label: "VGW" },
            { value: "tgw", label: "Transit Gateway" },
            { value: "cwan", label: "Cloud WAN" },
          ]}
          onChange={setMode}
        />
      </div>
      <Panel className="p-3 sm:p-4">
        <ModeDiagram mode={mode} />
        <p aria-live="polite" className="mt-3 px-2 text-sm leading-relaxed">
          {t(MODES[mode].note)}
        </p>
      </Panel>

      <h3 className="mt-14 mb-2 text-xl font-semibold">{t(C.prefixLab)}</h3>
      <p className="mb-4 text-sm text-[var(--muted)]">{t(C.prefixLead)}</p>
      <PrefixLab />

      <h3 className="mt-14 mb-4 text-xl font-semibold">{t(C.transitTitle)}</h3>
      <SiteLinkDiagram />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Callout tone="warn" title={C.supernetTitle}>
          <T c={C.supernet} />
        </Callout>
        <div>
          <h4 className="mb-2 font-semibold">{t(C.quotas)}</h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            {QUOTAS.map(([k, v]) => (
              <div
                key={k.en}
                className="flex items-center justify-between gap-2 border-b border-[var(--line)] py-1"
              >
                <dt className="text-[var(--muted)]">{t(k)}</dt>
                <dd>
                  <Tag color="var(--fiber)">{v}</Tag>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}
