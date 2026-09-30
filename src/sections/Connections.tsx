import { useState } from "react";
import type { L } from "../i18n/lang";
import { useLang } from "../i18n/useLang";
import { HikariSays } from "../components/Hikari";
import { useNarrow } from "../components/useNarrow";
import { Callout, Panel, Scroll, Section, T, Tag } from "../components/ui";

const C = {
  kicker: { en: "Connections", ja: "接続" },
  title: {
    en: "Dedicated port or a slice of a partner's",
    ja: "専用ポートか、パートナー回線の一部か",
  },
  lead: {
    en: "A connection is the physical layer. Either AWS gives you a whole port on its router (dedicated), or a Direct Connect Delivery Partner carves a policed slice out of its own interconnect and hands it to your account (hosted).",
    ja: "接続 (Connection) は物理レイヤーです。AWS ルーターのポートを丸ごと借りる「専用接続」か、Direct Connect Delivery Partner が自社の相互接続から帯域を切り出して自社アカウントに渡す「ホスト接続」かのどちらかです。",
  },
  speeds: { en: "Available speeds (log scale)", ja: "提供帯域 (対数スケール)" },
  dedicated: { en: "Dedicated", ja: "専用接続" },
  hosted: { en: "Hosted", ja: "ホスト接続" },
  ordering: { en: "Ordering a dedicated connection", ja: "専用接続の発注フロー" },
  physical: { en: "Physical and link requirements", ja: "物理・リンク要件" },
  mtu: { en: "MTU per VIF type", ja: "VIF 種別ごとの MTU" },
  hvTitle: {
    en: "Hosted connection ≠ hosted VIF",
    ja: "ホスト接続 ≠ ホスト仮想インターフェイス",
  },
  hv: {
    en: "A hosted connection has its own AWS-policed capacity and one VIF. A hosted VIF is just a VIF on someone else's connection with no capacity of its own, so it can be oversubscribed. AWS no longer accepts new partner integrations built on hosted VIFs; use hosted VIFs only to share your own dedicated connection with another of your accounts.",
    ja: "ホスト接続は AWS が上限を制御する専用帯域と VIF 1 本を持ちます。ホスト仮想インターフェイスは他人の接続上に作られた VIF にすぎず、帯域の割り当てがないため他の利用者と帯域を奪い合うことがあります。AWS はホスト VIF ベースの新規パートナー統合を受け付けていません。自社の専用接続を自社の別アカウントに共有する用途に限りましょう。",
  },
  flatTitle: { en: "Hosted connection or hosted VIF?", ja: "ホスト接続? ホスト VIF?" },
  flat: {
    en: "Think of flats. A hosted connection is renting a whole flat: the space (bandwidth) is yours, guaranteed. A hosted VIF is renting a room in someone else's flat: you share the kitchen with whoever else lives there.",
    ja: "部屋探しにたとえると、ホスト接続は「部屋を丸ごと借りる」。広さ (帯域) は自分専用で保証される。ホスト VIF は「他人の家の一部屋を借りる」。キッチン (帯域) は同居人とシェアだよ。",
  },
  carrierTitle: { en: "Buying through a carrier?", ja: "キャリア経由で使うなら" },
  carrier: {
    en: "Many “closed network to AWS” services from carriers have Direct Connect inside. The carrier owns everything up to the AWS port (often a hosted connection), so a failure can be theirs or AWS's. Ask them which pieces they run, and what bandwidth you really get.",
    ja: "キャリアの「AWS 閉域接続」サービスの多くは、中身が Direct Connect。AWS ポートまではキャリアの担当 (ホスト接続のことが多い) だから、障害がキャリア側か AWS 側かは切り分けが必要。どこまでがキャリアの担当か、実際にどれだけの帯域が使えるのかを確認しよう。",
  },
  jpTitle: { en: "If you are in Japan", ja: "日本で使うなら" },
  jp: {
    en: "Japan has five DX locations: Equinix TY2, AT Tokyo CC1 and NEC Inzai around Tokyo, Equinix OS1 and Telehouse OSAKA2 in Osaka (all 1G, 10G and 100G). Watch out: OS1 is associated with the Tokyo Region, OSAKA2 with the Osaka Region, which changes AWS's default path preference. Many companies reach DX through a carrier's closed-network service; DX is still inside it, and the carrier owns everything up to the AWS port.",
    ja: "国内の DX ロケーションは 5 つ。東京近郊の Equinix TY2・AT東京 CC1・NEC 印西、大阪の Equinix OS1・Telehouse OSAKA2 (いずれも 1G / 10G / 100G)。注意: OS1 の関連リージョンは東京、OSAKA2 は大阪で、AWS がデフォルトで優先する経路が変わります。キャリアの閉域網サービス経由で使う会社も多いですが、その中身も DX で、AWS ポートまではキャリアの担当範囲です。",
  },
  jumboTitle: {
    en: "Jumbo frames take the connection down briefly",
    ja: "ジャンボフレーム有効化で一瞬切れる",
  },
  jumbo: {
    en: "Enabling jumbo MTU can update the underlying connection and interrupt every VIF on it for up to 30 seconds. If the same route is also learned with MTU 1500 (another VIF, or a VPN), 1500 is used.",
    ja: "ジャンボ MTU を有効にすると下位の接続が更新され、その接続上の全 VIF が最大 30 秒中断することがあります。同じ経路を MTU 1500 の別 VIF や VPN からも学習している場合は 1500 が使われます。",
  },
};

const DEDICATED = [1000, 10000, 100000, 400000];
const HOSTED = [50, 100, 200, 300, 400, 500, 1000, 2000, 5000, 10000, 25000];

function fmt(mbps: number): string {
  return mbps >= 1000 ? `${mbps / 1000}G` : `${mbps}M`;
}

function SpeedLadder() {
  const { t } = useLang();
  const narrow = useNarrow();
  const min = Math.log10(50);
  const max = Math.log10(400000);
  const x = (m: number) => 60 + ((Math.log10(m) - min) / (max - min)) * 900;
  const rows: [L, number[], string][] = [
    [C.dedicated, DEDICATED, "var(--fiber)"],
    [C.hosted, HOSTED, "var(--aws)"],
  ];
  if (narrow)
    return (
      <Panel>
        <p className="mb-3 text-xs font-bold text-[var(--muted)]">
          {t({ en: "Available speeds", ja: "提供帯域" })}
        </p>
        {rows.map(([label, speeds, color]) => (
          <div key={label.en} className="mb-3">
            <p className="mb-1.5 text-sm font-bold" style={{ color }}>
              {t(label)}
            </p>
            <p className="flex flex-wrap gap-1.5">
              {speeds.map((sp) => (
                <span
                  key={sp}
                  className="rounded-full border-2 px-2.5 py-0.5 font-mono text-xs font-bold"
                  style={{ borderColor: color, color }}
                >
                  {fmt(sp)}
                </span>
              ))}
            </p>
          </div>
        ))}
        <p className="text-xs text-[var(--muted)]">
          {t({
            en: "400G: US locations only. 25G hosted: only where 100G ports exist.",
            ja: "400G は米国のロケーションのみ。ホスト接続 25G は 100G ポートがある拠点のみ。",
          })}
        </p>
      </Panel>
    );
  return (
    <Panel>
      <p className="mb-2 text-xs font-bold text-[var(--muted)]">{t(C.speeds)}</p>
      <Scroll>
        <svg
          viewBox="0 0 1000 170"
          className="diagram min-w-[640px]"
          role="img"
          aria-label={t(C.speeds)}
        >
          {rows.map(([label, speeds, color], r) => {
            const y = 50 + r * 70;
            return (
              <g key={label.en}>
                <text x="0" y={y - 18} fontSize="15" fill={color}>
                  {t(label)}
                </text>
                <line x1="60" x2="960" y1={y} y2={y} stroke="var(--line)" />
                {speeds.map((s, i) => (
                  <g key={s}>
                    <circle cx={x(s)} cy={y} r="6" fill={color} />
                    <text
                      x={x(s)}
                      y={i % 2 && speeds.length > 4 ? y - 12 : y + 22}
                      fontSize="12.5"
                      textAnchor="middle"
                      fill="var(--muted)"
                    >
                      {fmt(s)}
                    </text>
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
      </Scroll>
    </Panel>
  );
}

const TYPE_ROWS: { k: L; d: L; h: L }[] = [
  {
    k: { en: "Speeds", ja: "帯域" },
    d: {
      en: "1, 10, 100, 400 Gbps (400G since 2024-07, US sites only)",
      ja: "1/10/100/400 Gbps (400G は 2024-07〜、米国拠点のみ)",
    },
    h: {
      en: "50 Mbps – 25 Gbps (25G since 2024-04, at 100G-capable sites)",
      ja: "50 Mbps〜25 Gbps (25G は 2024-04〜、100G 対応拠点のみ)",
    },
  },
  {
    k: { en: "Ordered by", ja: "発注者" },
    d: { en: "You, in the console / CLI / API", ja: "自社 (コンソール / CLI / API)" },
    h: {
      en: "A Delivery Partner; you Accept it",
      ja: "パートナーが作成し、自社が承認 (Accept)",
    },
  },
  {
    k: { en: "VIFs", ja: "VIF 数" },
    d: {
      en: "Up to 51: 50 private/public + up to 4 transit",
      ja: "最大 51 (プライベート/パブリック 50 + トランジット最大 4)",
    },
    h: { en: "Exactly 1", ja: "1 本のみ" },
  },
  {
    k: { en: "Change speed", ja: "帯域変更" },
    d: { en: "No — order a new connection", ja: "不可 (新しい接続を発注)" },
    h: {
      en: "Only the partner can, if it supports it",
      ja: "パートナーのみ (対応していれば)",
    },
  },
  {
    k: { en: "LAG / MACsec", ja: "LAG / MACsec" },
    d: {
      en: "Yes (MACsec on 10/100/400G at (M) sites)",
      ja: "可 (MACsec は (M) 表記拠点の 10/100/400G)",
    },
    h: {
      en: "No (the partner's interconnect can use MACsec)",
      ja: "不可 (パートナー側の相互接続は MACsec 可)",
    },
  },
  {
    k: { en: "Billing starts", ja: "課金開始" },
    d: {
      en: "Port active, or 90 days after the LOA-CFA — whichever is first",
      ja: "ポート稼働時、または LOA-CFA 発行 90 日後の早い方",
    },
    h: { en: "When you accept it", ja: "承認した時点" },
  },
];

type Who = "you" | "aws" | "colo";
const WHO: Record<Who, { label: L; color: string }> = {
  you: { label: { en: "You do this", ja: "自社が行う" }, color: "var(--fiber)" },
  aws: { label: { en: "AWS does this", ja: "AWS が行う" }, color: "var(--aws)" },
  colo: {
    label: { en: "The facility / carrier does this", ja: "施設事業者 / キャリアが行う" },
    color: "var(--violet)",
  },
};

const STEPS: { title: L; body: L; when: L; who: Who }[] = [
  {
    who: "you",
    title: { en: "Request", ja: "リクエスト" },
    when: { en: "Day 0", ja: "0 日目" },
    body: {
      en: "Pick a location (and sub-location/floor if offered), a port speed and your circuit provider in the Connection wizard (Resiliency Toolkit) or Classic, or with create-connection.",
      ja: "Connection wizard (Resiliency Toolkit) か Classic、または create-connection で、ロケーション (フロアがあればサブロケーション)・ポート速度・回線事業者を指定します。",
    },
  },
  {
    who: "aws",
    title: { en: "Port provisioning", ja: "ポート払い出し" },
    when: { en: "≤ 72 business hours", ja: "最大 72 営業時間" },
    body: {
      en: "AWS reviews the request and allocates a port. If AWS emails you for more information, reply within 7 days or the request is deleted.",
      ja: "AWS が審査してポートを割り当てます。追加情報を求めるメールが来たら 7 日以内に返信しないとリクエストは削除されます。",
    },
  },
  {
    who: "aws",
    title: { en: "LOA-CFA", ja: "LOA-CFA" },
    when: { en: "Download", ja: "ダウンロード" },
    body: {
      en: "The Letter of Authorization and Connecting Facility Assignment: a signed, watermarked PDF naming the patch panel and ports AWS reserved for you. It authorizes someone to plug a fiber into AWS's port.",
      ja: "Letter of Authorization and Connecting Facility Assignment。AWS が確保したパッチパネルとポートが記載された、署名・透かし入り PDF。AWS のポートにファイバーを挿す権限を与える書類です。",
    },
  },
  {
    who: "colo",
    title: { en: "Cross connect", ja: "クロスコネクト" },
    when: { en: "Within 90 days", ja: "90 日以内" },
    body: {
      en: "Hand the LOA-CFA to the colocation provider (you must be their customer) or to your network provider, who orders the cross connect. The LOA's authority expires after 90 days; download it again to renew.",
      ja: "LOA-CFA をコロケーション事業者 (その顧客である必要あり) または回線事業者に渡してクロスコネクトを発注。LOA の効力は 90 日で切れるので、過ぎたら再ダウンロードします。",
    },
  },
  {
    who: "aws",
    title: { en: "Link up & billing", ja: "リンクアップと課金" },
    when: { en: "Day 90 at the latest", ja: "遅くとも 90 日目" },
    body: {
      en: "Billing starts when the port goes active or 90 days after the LOA was issued, whichever comes first. If it is still down after that, AWS warns that the port will be deleted in 10 days.",
      ja: "ポート稼働時または LOA 発行から 90 日後の早い方で課金開始。その後も未開通なら、10 日後にポートを削除するという通知が届きます。",
    },
  },
  {
    who: "you",
    title: { en: "VIF + BGP", ja: "VIF + BGP" },
    when: { en: "Minutes", ja: "数分" },
    body: {
      en: "Create virtual interfaces (VLAN, ASN, peer IPs, MTU), download the router configuration AWS generates for your vendor, and bring BGP up.",
      ja: "VIF (VLAN・ASN・ピア IP・MTU) を作成し、AWS が機器ベンダー別に生成するルーター設定をダウンロードして BGP を確立します。",
    },
  },
];

function Ordering() {
  const { t } = useLang();
  const [i, setI] = useState(0);
  return (
    <Panel>
      <ol className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {STEPS.map((s, n) => (
          <li key={s.title.en}>
            <button
              type="button"
              aria-current={i === n ? "step" : undefined}
              onClick={() => setI(n)}
              className={`w-full rounded-2xl border px-2 py-2 text-left transition-colors ${
                i === n
                  ? "border-[var(--fiber)] bg-[var(--panel-2)]"
                  : n < i
                    ? "border-[var(--line)] opacity-70"
                    : "border-[var(--line)] opacity-50 hover:opacity-80"
              }`}
            >
              <span className="block font-mono text-[0.65rem] text-[var(--fiber)]">
                {String(n + 1).padStart(2, "0")}
              </span>
              <span className="block text-xs font-semibold sm:text-sm">{t(s.title)}</span>
            </button>
          </li>
        ))}
      </ol>
      <div aria-live="polite">
        <span className="flex flex-wrap gap-2">
          <Tag color="var(--fiber)">{t(STEPS[i].when)}</Tag>
          <Tag color={WHO[STEPS[i].who].color}>{t(WHO[STEPS[i].who].label)}</Tag>
        </span>
        <p className="mt-2 leading-relaxed">{t(STEPS[i].body)}</p>
      </div>
    </Panel>
  );
}

const PHYS: [L, L][] = [
  [
    { en: "Fiber", ja: "ファイバー" },
    { en: "Single-mode", ja: "シングルモード" },
  ],
  [
    { en: "Optics", ja: "光モジュール" },
    {
      en: "1G 1000BASE-LX · 10G 10GBASE-LR (1310 nm) · 100G 100GBASE-LR4 · 400G 400GBASE-LR4",
      ja: "1G 1000BASE-LX・10G 10GBASE-LR (1310 nm)・100G 100GBASE-LR4・400G 400GBASE-LR4",
    },
  ],
  [
    { en: "Auto-negotiation", ja: "オートネゴシエーション" },
    {
      en: "Depends on the AWS endpoint: usually off above 1G with speed and full duplex set by hand. Check your connection's details",
      ja: "AWS 側機器次第。1G 超では通常オフにして速度と全二重を固定。接続ごとに確認を",
    },
  ],
  [
    { en: "VLANs", ja: "VLAN" },
    {
      en: "802.1Q end to end, IDs 1–4094, fixed after VIF creation",
      ja: "経路上すべてで 802.1Q 対応、ID 1〜4094、VIF 作成後は変更不可",
    },
  ],
  [
    { en: "Routing", ja: "ルーティング" },
    {
      en: "BGP with MD5 (required); asynchronous BFD is on at the AWS side, enable it on yours",
      ja: "MD5 認証付き BGP 必須。非同期 BFD は AWS 側で有効済み、自社側で設定すれば効く",
    },
  ],
  [
    { en: "Light levels", ja: "光レベル" },
    {
      en: "1/10G: −14.4 to 2.50 dBm · 100G: Tx −4.3 to 4.5, Rx −10.6 to 4.5 dBm",
      ja: "1/10G: −14.4〜2.50 dBm・100G: 送信 −4.3〜4.5、受信 −10.6〜4.5 dBm",
    },
  ],
];

const MTU: [string, string, string, string][] = [
  ["Private VIF", "1500", "9001", "var(--ok)"],
  ["Transit VIF", "1500", "8500", "var(--aws)"],
  ["Public VIF", "1500", "—", "var(--violet)"],
];

export function Connections() {
  const { t } = useLang();
  return (
    <Section
      id="connections"
      index="02"
      kicker={C.kicker}
      title={C.title}
      lead={C.lead}
      layers={["physical"]}
    >
      <div className="mb-8 max-w-3xl">
        <HikariSays mood="thinking">
          <T
            c={{
              en: "The LOA-CFA is not a setting you type anywhere. It is a signed work permit: “you may plug a fiber into AWS port X on patch panel Y.” You hand it to the building's staff (or your carrier), and they install the cross connect — not AWS.",
              ja: "LOA-CFA はどこかに入力する設定値じゃないよ。「パッチパネル Y の AWS ポート X にファイバーを挿してよし」という署名入りの工事許可証。これを施設 (またはキャリア) に渡すと、AWS ではなく施設の人がクロスコネクトを敷設してくれる。",
            }}
          />
        </HikariSays>
      </div>
      <SpeedLadder />
      <div className="mt-6">
        <Scroll>
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-left font-mono text-xs">
                <th className="py-2 pr-4" />
                <th className="py-2 pr-4 text-[var(--fiber)]">{t(C.dedicated)}</th>
                <th className="py-2 text-[var(--aws)]">{t(C.hosted)}</th>
              </tr>
            </thead>
            <tbody>
              {TYPE_ROWS.map((r) => (
                <tr key={r.k.en} className="border-b border-[var(--line)] align-top">
                  <th
                    scope="row"
                    className="py-3 pr-4 text-left font-medium whitespace-nowrap"
                  >
                    {t(r.k)}
                  </th>
                  <td className="py-3 pr-4">{t(r.d)}</td>
                  <td className="py-3">{t(r.h)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Scroll>
      </div>
      <div className="mt-6 grid max-w-5xl gap-6 lg:grid-cols-2">
        <HikariSays mood="thinking" title={C.flatTitle}>
          <T c={C.flat} />
        </HikariSays>
        <HikariSays mood="happy" title={C.carrierTitle}>
          <T c={C.carrier} />
        </HikariSays>
      </div>
      <div className="mt-6 max-w-3xl space-y-6">
        <Callout title={C.hvTitle}>
          <T c={C.hv} />
        </Callout>
        <Callout title={C.jpTitle}>
          <T c={C.jp} />
        </Callout>
      </div>

      <h3 className="mt-14 mb-4 text-xl font-semibold">{t(C.ordering)}</h3>
      <Ordering />

      <div className="mt-14 grid gap-8 lg:grid-cols-[3fr_2fr]">
        <div>
          <h3 className="mb-4 text-xl font-semibold">{t(C.physical)}</h3>
          <dl className="divide-y divide-[var(--line)] border-y border-[var(--line)] text-sm">
            {PHYS.map(([k, v]) => (
              <div key={k.en} className="grid grid-cols-[8rem_1fr] gap-4 py-3">
                <dt className="font-medium">{t(k)}</dt>
                <dd className="text-[var(--muted)]">{t(v)}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h3 className="mb-4 text-xl font-semibold">{t(C.mtu)}</h3>
          <table className="mb-4 w-full border-collapse font-mono text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-left text-xs text-[var(--muted)]">
                <th className="py-2">VIF</th>
                <th className="py-2">std</th>
                <th className="py-2">jumbo</th>
              </tr>
            </thead>
            <tbody>
              {MTU.map(([v, s, j, color]) => (
                <tr key={v} className="border-b border-[var(--line)]">
                  <td className="py-2" style={{ color }}>
                    {v}
                  </td>
                  <td className="py-2">{s}</td>
                  <td className="py-2 font-semibold">{j}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Callout tone="warn" title={C.jumboTitle}>
            <T c={C.jumbo} />
          </Callout>
        </div>
      </div>
    </Section>
  );
}
