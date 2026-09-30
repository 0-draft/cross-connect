import { useState } from "react";
import type { L } from "../i18n/lang";
import { useLang } from "../i18n/useLang";
import { HikariSays } from "../components/Hikari";
import { useNarrow } from "../components/useNarrow";
import { Callout, Panel, Scroll, Section, Segmented, T, Tag } from "../components/ui";
import {
  type MacsecMode,
  type PortSpeed,
  PORT_SPEEDS,
  lagState,
  macsecCiphers,
  macsecOutcome,
  maxMembers,
} from "../lib/lag";

const C = {
  kicker: { en: "LAG & MACsec", ja: "LAG と MACsec" },
  title: {
    en: "Bundle the fibers, then encrypt them",
    ja: "ファイバーを束ねて、暗号化する",
  },
  lead: {
    en: "A link aggregation group (LAG) bundles same-speed dedicated connections on one AWS device into one logical link with LACP. MACsec (IEEE 802.1AE) encrypts the link between your router and that device at Layer 2.",
    ja: "LAG (Link Aggregation Group) は同一 AWS 機器上の同速度の専用接続を LACP で 1 本の論理リンクに束ねます。MACsec (IEEE 802.1AE) は自社ルーターとその機器の間のリンクをレイヤー 2 で暗号化します。",
  },
  lagLab: { en: "LAG lab", ja: "LAG ラボ" },
  speed: { en: "Port speed", ja: "ポート速度" },
  members: { en: "Members", ja: "メンバー数" },
  minLinks: { en: "Minimum links", ja: "最小リンク数 (minimum links)" },
  clickMember: {
    en: "Tap a member to cut or restore it.",
    ja: "メンバーをタップすると切断 / 復旧します。",
  },
  lagUp: { en: "LAG operational", ja: "LAG 稼働中" },
  lagDown: {
    en: "LAG down — traffic moves to your other path",
    ja: "LAG ダウン — 別経路へ切り替わる",
  },
  minWhyTitle: {
    en: "Why would I want the LAG to go down?",
    ja: "なぜわざと LAG を落とすのか",
  },
  minWhy: {
    en: "With 4 × 10G carrying 35 Gbps, losing two members leaves 20 Gbps and heavy drops. Setting minimum links to 3 takes the whole LAG down instead, so BGP withdraws its routes and traffic shifts to a redundant LAG or location that can actually carry it. New LAGs default to 0.",
    ja: "4 × 10G で 35 Gbps 流している状態で 2 本失うと残りは 20 Gbps、大量のドロップが起きます。最小リンク数を 3 にしておけば LAG ごと落ち、BGP が経路を取り下げて、実際に捌ける冗長側の LAG / ロケーションにトラフィックが移ります。新規 LAG のデフォルトは 0 です。",
  },
  rules: { en: "LAG rules", ja: "LAG のルール" },
  macLab: { en: "MACsec: what gets encrypted", ja: "MACsec: 何が暗号化されるのか" },
  mode: { en: "Encryption mode", ja: "暗号化モード" },
  session: { en: "MKA session", ja: "MKA セッション" },
  sessionUp: { en: "established", ja: "確立" },
  sessionDown: { en: "failed", ja: "失敗" },
  keys: { en: "Keys", ja: "鍵" },
  ciphers: { en: "Cipher suites by speed", ja: "速度別の暗号スイート" },
  notE2eTitle: {
    en: "Hop-by-hop, not end-to-end",
    ja: "区間暗号であってエンドツーエンドではない",
  },
  notE2e: {
    en: "MACsec protects the cross connect between your MACsec-capable port and the AWS device. Any carrier circuit in between must be transparent to MACsec. AWS separately encrypts traffic at the physical layer between Direct Connect locations and Regions. For end-to-end protection add IPsec or TLS.",
    ja: "MACsec が守るのは、MACsec 対応ポートと AWS 機器の間のクロスコネクト区間です。途中にキャリア回線を挟むなら MACsec を透過できる必要があります。DX ロケーションとリージョン間は AWS が別途物理層で暗号化しています。エンドツーエンドで守るなら IPsec か TLS を重ねます。",
  },
};

const OUTCOME: Record<string, { label: L; color: string }> = {
  encrypted: {
    label: { en: "Frames encrypted", ja: "フレームは暗号化" },
    color: "var(--ok)",
  },
  cleartext: {
    label: { en: "Frames flow in CLEARTEXT", ja: "フレームは平文で流れる" },
    color: "var(--fiber)",
  },
  dropped: {
    label: { en: "Nothing is sent (outage)", ja: "何も送信されない (通信断)" },
    color: "var(--bad)",
  },
};

const LAG_RULES: L[] = [
  {
    en: "Dedicated connections only, all the same speed",
    ja: "専用接続のみ、全メンバー同速度",
  },
  {
    en: "Max 4 members below 100G, 2 at 100G / 400G (up to 800 Gbps)",
    ja: "最大メンバー数は 100G 未満で 4、100G / 400G で 2 (最大 800 Gbps)",
  },
  {
    en: "All members on the same AWS device — no multi-chassis LAG",
    ja: "全メンバーが同一 AWS 機器に収容 — マルチシャーシ LAG 不可",
  },
  {
    en: "Active/active, VIFs defined once on the LAG (max 51)",
    ja: "Active/Active、VIF は LAG に対して定義 (最大 51)",
  },
  { en: "10 LAGs per Region (adjustable)", ja: "リージョンあたり 10 LAG (引き上げ可)" },
];

function LagLab() {
  const { t } = useLang();
  const narrow = useNarrow();
  const [speed, setSpeed] = useState<PortSpeed>(10);
  const [cut, setCut] = useState<number[]>([]);
  const [minLinks, setMinLinks] = useState(0);
  const n = maxMembers(speed);
  const up = n - cut.filter((c) => c < n).length;
  const state = lagState(speed, up, minLinks);

  const changeSpeed = (s: PortSpeed) => {
    setSpeed(s);
    setCut([]);
    setMinLinks((m) => Math.min(m, maxMembers(s)));
  };
  const toggle = (i: number) =>
    setCut((c) => (c.includes(i) ? c.filter((x) => x !== i) : [...c, i]));

  // Phones get a narrower drawing instead of a shrunken one.
  const W = narrow ? 360 : 760;
  const bw = narrow ? 104 : 150;
  const rx0 = narrow ? 8 : 20;
  const ax0 = W - rx0 - bw;
  const mid = (rx0 + bw + ax0) / 2;
  const rowH = 40;
  const top = 70;
  const h = top + n * rowH + 30;

  return (
    <Panel>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <Segmented
          label={t(C.speed)}
          value={String(speed)}
          options={PORT_SPEEDS.map((s) => ({ value: String(s), label: `${s}G` }))}
          onChange={(v) => changeSpeed(Number(v) as PortSpeed)}
        />
        <label className="flex items-center gap-2 text-sm">
          {t(C.minLinks)}
          <select
            value={minLinks}
            onChange={(e) => setMinLinks(Number(e.target.value))}
            className="rounded-full border border-[var(--line)] bg-[var(--panel-2)] px-2 py-1 font-mono"
          >
            {Array.from({ length: n + 1 }, (_, i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mb-2 text-xs text-[var(--muted)]">{t(C.clickMember)}</p>
      <Scroll>
        <svg
          viewBox={`0 0 ${W} ${h}`}
          className={`diagram ${narrow ? "" : "min-w-[560px]"}`}
          role="group"
          aria-label={t(C.lagLab)}
        >
          <rect
            x={rx0}
            y="40"
            width={bw}
            height={n * rowH + 20}
            rx="8"
            fill="var(--panel-2)"
            stroke="var(--line)"
          />
          <text
            x={rx0 + bw / 2}
            y="30"
            fontSize="13.8"
            textAnchor="middle"
            fill="var(--muted)"
          >
            {t({ en: "your router", ja: "自社ルーター" })}
          </text>
          <text
            x={rx0 + bw / 2}
            y={50 + (n * rowH) / 2 + 10}
            fontSize="13.8"
            textAnchor="middle"
            fill="var(--ink)"
          >
            Port-channel
          </text>
          <rect
            x={ax0}
            y="40"
            width={bw}
            height={n * rowH + 20}
            rx="8"
            fill="var(--panel-2)"
            stroke="var(--aws)"
          />
          <text
            x={ax0 + bw / 2}
            y="30"
            fontSize="12.5"
            textAnchor="middle"
            fill="var(--aws)"
          >
            {t({ en: "one AWS device", ja: "AWS 機器 1 台" })}
          </text>
          <text
            x={ax0 + bw / 2}
            y={50 + (n * rowH) / 2 + 10}
            fontSize="13.8"
            textAnchor="middle"
            fill="var(--ink)"
          >
            LAG · VIFs
          </text>
          {Array.from({ length: n }, (_, i) => {
            const y = top + i * rowH;
            const isUp = !cut.includes(i);
            const live = isUp && state.operational;
            return (
              <g
                key={i}
                tabIndex={0}
                role="switch"
                aria-checked={isUp}
                aria-label={t({
                  en: `${speed}G member ${i + 1}`,
                  ja: `${speed}G メンバー ${i + 1}`,
                })}
                onClick={() => toggle(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(i);
                  }
                }}
                className="cursor-pointer"
              >
                <rect
                  x={rx0 + bw}
                  y={y - 14}
                  width={ax0 - rx0 - bw}
                  height="28"
                  fill="transparent"
                />
                <line
                  x1={rx0 + bw}
                  x2={ax0}
                  y1={y}
                  y2={y}
                  stroke={isUp ? (live ? "var(--fiber)" : "var(--muted)") : "var(--bad)"}
                  strokeWidth="3"
                  className={live ? "flow" : undefined}
                  strokeDasharray={isUp ? undefined : "2 8"}
                />
                <text
                  x={mid}
                  y={y - 8}
                  fontSize="12.5"
                  textAnchor="middle"
                  fill="var(--muted)"
                >
                  {speed}G #{i + 1} {isUp ? "" : "✕"}
                </text>
              </g>
            );
          })}
        </svg>
      </Scroll>
      <div
        aria-live="polite"
        className="mt-3 flex flex-wrap items-center gap-3 font-mono text-sm"
      >
        <span style={{ color: state.operational ? "var(--ok)" : "var(--bad)" }}>
          ● {t(state.operational ? C.lagUp : C.lagDown)}
        </span>
        <Tag>
          {up}/{n} up · {state.capacity} / {n * speed} Gbps
        </Tag>
      </div>
    </Panel>
  );
}

function MacsecLab() {
  const { t } = useLang();
  const narrow = useNarrow();
  const [mode, setMode] = useState<MacsecMode>("should_encrypt");
  const [sessionUp, setSessionUp] = useState(true);
  const out = OUTCOME[macsecOutcome(mode, sessionUp)];

  return (
    <Panel>
      <div className="mb-4 flex flex-wrap gap-4">
        <Segmented
          label={t(C.mode)}
          value={mode}
          options={[
            { value: "should_encrypt", label: "should_encrypt" },
            { value: "must_encrypt", label: "must_encrypt" },
          ]}
          onChange={setMode}
        />
        <Segmented
          label={t(C.session)}
          value={sessionUp ? "up" : "down"}
          options={[
            { value: "up", label: `MKA ${t(C.sessionUp)}` },
            { value: "down", label: `MKA ${t(C.sessionDown)}` },
          ]}
          onChange={(v) => setSessionUp(v === "up")}
        />
      </div>
      {narrow ? (
        <svg
          viewBox="0 0 340 380"
          className="diagram w-full"
          role="img"
          aria-label={t(C.macLab)}
        >
          {/* top to bottom: router, DX device, Region; the IPsec bracket on the left */}
          <rect
            x="60"
            y="10"
            width="220"
            height="50"
            rx="10"
            fill="var(--panel-2)"
            stroke="var(--line)"
          />
          <text x="170" y="41" fontSize="15" textAnchor="middle" fill="var(--ink)">
            {t({ en: "your router", ja: "自社ルーター" })}
          </text>
          <line
            x1="170"
            x2="170"
            y1="60"
            y2="170"
            stroke={out.color}
            strokeWidth="5"
            className={out.color === "var(--bad)" ? undefined : "flow"}
          />
          <text x="182" y="105" fontSize="14" fill={out.color}>
            MACsec (L2)
          </text>
          <text x="182" y="125" fontSize="13" fill={out.color}>
            {t(out.label)}
          </text>
          <rect
            x="60"
            y="170"
            width="220"
            height="56"
            rx="10"
            fill="var(--panel-2)"
            stroke="var(--aws)"
          />
          <text x="170" y="195" fontSize="15" textAnchor="middle" fill="var(--aws)">
            {t({ en: "AWS DX device", ja: "AWS DX 機器" })}
          </text>
          <text x="170" y="214" fontSize="12" textAnchor="middle" fill="var(--muted)">
            {t({ en: "DX location", ja: "DX ロケーション" })}
          </text>
          <line x1="170" x2="170" y1="226" y2="316" stroke="var(--aws)" strokeWidth="3" />
          <text x="182" y="262" fontSize="13" fill="var(--muted)">
            {t({ en: "AWS backbone", ja: "AWS バックボーン" })}
          </text>
          <text x="182" y="281" fontSize="12" fill="var(--muted)">
            {t({ en: "encrypted by AWS (L1)", ja: "AWS が物理層で暗号化" })}
          </text>
          <rect
            x="60"
            y="316"
            width="220"
            height="50"
            rx="10"
            fill="var(--panel-2)"
            stroke="var(--aws)"
          />
          <text x="170" y="347" fontSize="15" textAnchor="middle" fill="var(--aws)">
            {t({ en: "AWS Region", ja: "AWS リージョン" })}
          </text>
          <path
            d="M60 35 H30 V341 H60"
            fill="none"
            stroke="var(--violet)"
            strokeDasharray="4 4"
          />
          <text
            x="20"
            y="188"
            fontSize="12"
            textAnchor="middle"
            fill="var(--violet)"
            transform="rotate(-90 20 188)"
          >
            {t({ en: "IPsec / TLS: end-to-end", ja: "IPsec / TLS: 端から端まで" })}
          </text>
        </svg>
      ) : (
        <Scroll>
          <svg
            viewBox="0 55 900 150"
            className="diagram min-w-[640px]"
            role="img"
            aria-label={t(C.macLab)}
          >
            <rect
              x="10"
              y="70"
              width="130"
              height="60"
              rx="8"
              fill="var(--panel-2)"
              stroke="var(--line)"
            />
            <text x="75" y="104" fontSize="13.8" textAnchor="middle" fill="var(--ink)">
              {t({ en: "your router", ja: "自社ルーター" })}
            </text>
            <rect
              x="360"
              y="70"
              width="140"
              height="60"
              rx="8"
              fill="var(--panel-2)"
              stroke="var(--aws)"
            />
            <text x="430" y="98" fontSize="13.8" textAnchor="middle" fill="var(--aws)">
              {t({ en: "AWS DX device", ja: "AWS DX 機器" })}
            </text>
            <text x="430" y="114" fontSize="11.2" textAnchor="middle" fill="var(--muted)">
              {t({ en: "DX location", ja: "DX ロケーション" })}
            </text>
            <rect
              x="740"
              y="70"
              width="150"
              height="60"
              rx="8"
              fill="var(--panel-2)"
              stroke="var(--aws)"
            />
            <text x="815" y="104" fontSize="13.8" textAnchor="middle" fill="var(--aws)">
              {t({ en: "AWS Region", ja: "AWS リージョン" })}
            </text>

            <line
              x1="140"
              x2="360"
              y1="100"
              y2="100"
              stroke={out.color}
              strokeWidth="5"
              className={out.color === "var(--bad)" ? undefined : "flow"}
            />
            <text x="250" y="88" fontSize="12.5" textAnchor="middle" fill={out.color}>
              MACsec (L2)
            </text>
            <text x="250" y="126" fontSize="12.5" textAnchor="middle" fill={out.color}>
              {t(out.label)}
            </text>
            <line
              x1="500"
              x2="740"
              y1="100"
              y2="100"
              stroke="var(--aws)"
              strokeWidth="3"
            />
            <text x="620" y="88" fontSize="12.5" textAnchor="middle" fill="var(--muted)">
              {t({ en: "AWS backbone", ja: "AWS バックボーン" })}
            </text>
            <text x="620" y="126" fontSize="11.2" textAnchor="middle" fill="var(--muted)">
              {t({ en: "AWS physical-layer encryption", ja: "AWS が物理層で暗号化" })}
            </text>

            <path
              d="M75 150 V175 H815 V150"
              fill="none"
              stroke="var(--violet)"
              strokeDasharray="4 4"
            />
            <text
              x="445"
              y="192"
              fontSize="12.5"
              textAnchor="middle"
              fill="var(--violet)"
            >
              {t({
                en: "IPsec / TLS = end-to-end (optional, on top)",
                ja: "IPsec / TLS = エンドツーエンド (上に重ねる)",
              })}
            </text>
          </svg>
        </Scroll>
      )}
    </Panel>
  );
}

const KEYS: [string, L][] = [
  [
    "CKN",
    {
      en: "Connectivity Association Key Name — 64 hex chars you generate; names the key.",
      ja: "Connectivity Association Key Name — 自社で生成する 64 桁の 16 進数。鍵の名前。",
    },
  ],
  [
    "CAK",
    {
      en: "Connectivity Association Key — 64 hex chars (AES-256), pre-shared. Stored by AWS in Secrets Manager. Static CAK mode only.",
      ja: "Connectivity Association Key — 64 桁の 16 進数 (AES-256) の事前共有鍵。AWS は Secrets Manager に保管。静的 CAK モードのみ。",
    },
  ],
  [
    "SAK",
    {
      en: "Secure Association Key — the session key, derived automatically at both ends and rotated by the protocol. Never stored.",
      ja: "Secure Association Key — セッション鍵。両端で自動導出され、プロトコルが自動ローテーション。保存されない。",
    },
  ],
  [
    "×3",
    {
      en: "The keychain holds up to 3 CKN/CAK pairs, so you can rotate without a hit.",
      ja: "キーチェーンは CKN/CAK を最大 3 組保持でき、無瞬断でローテーション可能。",
    },
  ],
];

export function LagMacsec() {
  const { t } = useLang();
  return (
    <Section
      id="lag-macsec"
      index="03"
      kicker={C.kicker}
      title={C.title}
      lead={C.lead}
      layers={["physical", "link"]}
    >
      <div className="mb-8 max-w-3xl">
        <HikariSays mood="thinking">
          <T
            c={{
              en: "A LAG is four lanes merged into one wide road — but it is still one bridge. If the bridge (the AWS device, or the building) goes, every lane goes with it. The Direct Connect FAQ says it outright: a LAG does not make your connectivity more resilient.",
              ja: "LAG は 4 車線を束ねた広い道路。でも橋は 1 本のまま。橋 (AWS 機器や建物) が落ちたら全車線いっしょに止まる。Direct Connect の FAQ にもはっきり「LAG で冗長性は上がらない」と書いてあるよ。",
            }}
          />
        </HikariSays>
      </div>
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div>
          <h3 className="mb-3 text-xl font-semibold">{t(C.lagLab)}</h3>
          <LagLab />
        </div>
        <div className="space-y-4">
          <h3 className="mb-3 text-xl font-semibold">{t(C.rules)}</h3>
          <ul className="space-y-2 text-sm">
            {LAG_RULES.map((r) => (
              <li key={r.en} className="flex gap-2">
                <span className="text-[var(--fiber)]">▸</span>
                <T c={r} />
              </li>
            ))}
          </ul>
          <Callout title={C.minWhyTitle}>
            <T c={C.minWhy} />
          </Callout>
        </div>
      </div>

      <h3 className="mt-14 mb-3 text-xl font-semibold">{t(C.macLab)}</h3>
      <MacsecLab />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h4 className="mb-3 font-semibold">{t(C.keys)}</h4>
          <dl className="space-y-3 text-sm">
            {KEYS.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[3.5rem_1fr] gap-3">
                <dt className="font-mono font-semibold text-[var(--fiber)]">{k}</dt>
                <dd className="text-[var(--muted)]">{t(v)}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">{t(C.ciphers)}</h4>
          <table className="w-full border-collapse font-mono text-sm">
            <tbody>
              {PORT_SPEEDS.map((s) => {
                const cs = macsecCiphers(s);
                return (
                  <tr key={s} className="border-b border-[var(--line)]">
                    <td className="py-2 pr-4">{s}G</td>
                    <td className="py-2">
                      {cs.length ? (
                        cs.join(" / ")
                      ) : (
                        <span className="text-[var(--muted)]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-[var(--muted)]">
            <T
              c={{
                en: "XPN (64-bit packet numbers) is mandatory at 100G+, otherwise the 32-bit counter would force a rekey every few minutes. SCI must be on; dot1q-in-clear is not supported. Hosted connections cannot use MACsec.",
                ja: "100G 以上では XPN (64 ビットのパケット番号) が必須。32 ビットだと数分ごとに鍵更新が必要になるため。SCI は必須、dot1q-in-clear は非対応。ホスト接続では MACsec 不可。",
              }}
            />
          </p>
        </div>
      </div>
      <div className="mt-6 max-w-3xl">
        <Callout tone="warn" title={C.notE2eTitle}>
          <T c={C.notE2e} />
        </Callout>
      </div>
    </Section>
  );
}
