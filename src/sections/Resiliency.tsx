import { useState } from "react";
import type { L } from "../i18n/lang";
import { useLang } from "../i18n/useLang";
import { useNarrow } from "../components/useNarrow";
import { HikariSays } from "../components/Hikari";
import { Callout, Panel, Scroll, Section, Segmented, T, Tag } from "../components/ui";
import {
  MODELS,
  type ModelId,
  evaluate,
  survivesAnyConnectionLoss,
  survivesAnyLocationLoss,
  survivesLocationPlusConnection,
} from "../lib/resiliency";

const C = {
  kicker: { en: "Resiliency", ja: "冗長性" },
  title: {
    en: "A fiber, an optic, a port, a building — any of them can fail",
    ja: "ファイバー、光モジュール、ポート、建物 — どれもいつかは落ちる",
  },
  lead: {
    en: "A single connection is a single point of failure, and AWS also takes Direct Connect devices down for planned maintenance. The Resiliency Toolkit orders connections in one of four shapes; only two of them are recommended for production.",
    ja: "接続 1 本は単一障害点で、AWS は計画メンテナンスで Direct Connect 機器を停止することもあります。Resiliency Toolkit は接続を 4 つの形のいずれかで発注します。本番向けに推奨されるのはそのうち 2 つだけです。",
  },
  lab: { en: "Failure lab", ja: "障害シミュレーター" },
  labHint: {
    en: "Tap a connection to cut it, or a location to take the whole building down.",
    ja: "接続をタップで切断、ロケーションをタップで建物ごと停止します。",
  },
  reset: { en: "Reset", ja: "リセット" },
  model: { en: "Model", ja: "モデル" },
  connected: { en: "Connected", ja: "接続維持" },
  disconnected: { en: "Disconnected", ja: "切断" },
  capacity: { en: "capacity left", ja: "残キャパシティ" },
  survives: { en: "Survives", ja: "耐えられる障害" },
  connLoss: { en: "any 1 connection / device", ja: "任意の接続 / 機器 1 つ" },
  locLoss: { en: "a whole location", ja: "ロケーション丸ごと" },
  both: { en: "a location + 1 more connection", ja: "ロケーション + さらに接続 1 つ" },
  slaTitle: { en: "SLA fine print", ja: "SLA の注意点" },
  sla: {
    en: "99.99% needs ≥ 4 connections in ≥ 2 locations (≥ 2 per location) on unique AWS devices, Enterprise Support and a Well-Architected Review; 99.9% needs ≥ 2 connections in ≥ 2 locations and Enterprise Support. 'Unavailable' means no traffic for 120 consecutive seconds. Hosted connections and hosted VIFs are not covered. Buildings that together form one DX location (e.g. Equinix DC2/DC11, or sub-locations in one building) do not give location-level diversity.",
    ja: "99.99% には 2 拠点以上に計 4 本以上 (拠点あたり 2 本以上)・全接続が別々の AWS 機器・Enterprise Support・Well-Architected レビューが必要。99.9% には 2 拠点以上に 2 本以上と Enterprise Support が必要。「利用不可」は 120 秒連続で通信できない状態。ホスト接続とホスト VIF は対象外。複数の建物で 1 つの DX ロケーションを成す場合 (例: Equinix DC2/DC11、同じ建物内のサブロケーション) はロケーション冗長になりません。",
  },
  detect: { en: "Detecting failure fast", ja: "障害を素早く検知する" },
  test: { en: "Prove it before it happens", ja: "本番障害の前に試す" },
};

const MODEL_INFO: Record<ModelId, { name: L; sla: string; shape: L }> = {
  maximum: {
    name: { en: "Maximum", ja: "Maximum" },
    sla: "99.99%",
    shape: { en: "2+ locations × 2+ connections", ja: "2 拠点以上 × 各 2 本以上" },
  },
  high: {
    name: { en: "High", ja: "High" },
    sla: "99.9%",
    shape: { en: "1 connection in each of 2+ locations", ja: "2 拠点以上に各 1 本" },
  },
  dev: {
    name: { en: "Dev / Test", ja: "開発 / テスト" },
    sla: "—",
    shape: {
      en: "2 connections, separate devices, 1 location",
      ja: "1 拠点に別機器で 2 本",
    },
  },
  single: {
    name: { en: "Classic (single)", ja: "Classic (単一)" },
    sla: "95%",
    shape: { en: "1 connection", ja: "1 本" },
  },
};

function FailureLab() {
  const { t } = useLang();
  const narrow = useNarrow();
  const [id, setId] = useState<ModelId>("maximum");
  const [cutConns, setCutConns] = useState<string[]>([]);
  const [cutLocs, setCutLocs] = useState<string[]>([]);
  const model = MODELS[id];
  const out = evaluate(model, { connections: cutConns, locations: cutLocs });
  const info = MODEL_INFO[id];

  const pick = (m: ModelId) => {
    setId(m);
    setCutConns([]);
    setCutLocs([]);
  };
  const flip = (list: string[], v: string) =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

  const perLoc = model.locations.map((l) =>
    model.connections.filter((c) => c.location === l),
  );
  // Phones get a narrower drawing instead of a shrunken one.
  const W = narrow ? 360 : 900;
  const gap = narrow ? 14 : 40;
  const locW = narrow ? (model.locations.length > 1 ? 166 : 200) : 260;
  const totalW = model.locations.length * locW + (model.locations.length - 1) * gap;
  const x0 = (W - totalW) / 2;
  const boxW = narrow ? 260 : 300;
  const devW = narrow ? 62 : 84;

  return (
    <Panel>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Segmented
          label={t(C.model)}
          value={id}
          options={(Object.keys(MODELS) as ModelId[]).map((m) => ({
            value: m,
            label: t(MODEL_INFO[m].name),
          }))}
          onChange={pick}
        />
        <button
          type="button"
          onClick={() => pick(id)}
          className="rounded-full border border-[var(--line)] px-3 py-1.5 text-sm text-[var(--muted)] hover:text-[var(--ink)]"
        >
          {t(C.reset)}
        </button>
      </div>
      <p className="mb-2 text-xs text-[var(--muted)]">{t(C.labHint)}</p>
      <Scroll>
        <svg
          viewBox={`0 0 ${W} 330`}
          className={`diagram ${narrow ? "w-full" : "min-w-[640px]"}`}
          role="group"
          aria-label={t(C.lab)}
        >
          <rect
            x={(W - boxW) / 2}
            y="10"
            width={boxW}
            height="46"
            rx="8"
            fill="var(--panel-2)"
            stroke="var(--line)"
          />
          <text
            x={W / 2}
            y="38"
            fontSize={narrow ? 14 : 15}
            textAnchor="middle"
            fill="var(--ink)"
          >
            {t({ en: "your data center(s)", ja: "自社データセンター" })}
          </text>
          <rect
            x={(W - boxW) / 2}
            y="274"
            width={boxW}
            height="46"
            rx="8"
            fill="var(--panel-2)"
            stroke="var(--aws)"
          />
          <text
            x={W / 2}
            y="302"
            fontSize={narrow ? 12.5 : 15}
            textAnchor="middle"
            fill="var(--aws)"
          >
            {t({
              en: "AWS Region · VPCs in 2+ AZs",
              ja: "AWS リージョン · VPC は 2 AZ 以上",
            })}
          </text>
          {model.locations.map((loc, li) => {
            const lx = x0 + li * (locW + gap);
            const dead = cutLocs.includes(loc);
            const conns = perLoc[li];
            return (
              <g key={loc}>
                <g
                  role="button"
                  tabIndex={0}
                  aria-pressed={dead}
                  aria-label={t({
                    en: `DX location ${li + 1} failed`,
                    ja: `DX ロケーション ${li + 1} を停止`,
                  })}
                  className="cursor-pointer"
                  onClick={() => setCutLocs((l) => flip(l, loc))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setCutLocs((l) => flip(l, loc));
                    }
                  }}
                >
                  <rect
                    x={lx}
                    y="100"
                    width={locW}
                    height="130"
                    rx="10"
                    fill={
                      dead
                        ? "color-mix(in srgb, var(--bad) 12%, transparent)"
                        : "var(--panel)"
                    }
                    stroke={dead ? "var(--bad)" : "var(--line)"}
                    strokeDasharray="5 4"
                  />
                </g>
                {conns.map((c, ci) => {
                  const cx = lx + ((ci + 1) * locW) / (conns.length + 1);
                  const cut = cutConns.includes(c.id);
                  const alive = out.surviving.includes(c.id);
                  const color = alive ? "var(--ok)" : "var(--bad)";
                  return (
                    <g
                      key={c.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={cut}
                      aria-label={t({
                        en: `Cut connection ${c.id.split("-")[1]} at location ${li + 1}`,
                        ja: `ロケーション ${li + 1} の接続 ${c.id.split("-")[1]} を切断`,
                      })}
                      className="cursor-pointer"
                      onClick={() => setCutConns((l) => flip(l, c.id))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setCutConns((l) => flip(l, c.id));
                        }
                      }}
                    >
                      <rect
                        x={cx - 20}
                        y="56"
                        width="40"
                        height="218"
                        fill="transparent"
                      />
                      <line
                        x1={cx}
                        x2={cx}
                        y1="56"
                        y2="274"
                        stroke={color}
                        strokeWidth="3"
                        strokeDasharray={alive ? undefined : "3 6"}
                        className={alive ? "flow" : undefined}
                      />
                      <rect
                        x={cx - devW / 2}
                        y="150"
                        width={devW}
                        height="36"
                        rx="6"
                        fill="var(--panel-2)"
                        stroke={color}
                      />
                      <text
                        x={cx}
                        y="166"
                        fontSize="11.2"
                        textAnchor="middle"
                        fill="var(--ink)"
                      >
                        {narrow ? "AWS" : t({ en: "AWS device", ja: "AWS 機器" })}
                      </text>
                      <text
                        x={cx}
                        y="179"
                        fontSize="11.2"
                        textAnchor="middle"
                        fill={color}
                      >
                        {alive ? "●" : "✕"} {c.id.split("-")[1]}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
          {model.locations.map((loc, li) => {
            const dead = cutLocs.includes(loc);
            return (
              <g key={`label-${loc}`}>
                <text
                  paintOrder="stroke"
                  stroke="var(--panel)"
                  strokeWidth="6"

                  x={x0 + li * (locW + gap) + 12}
                  y="120"
                  fontSize="13.8"
                  pointerEvents="none"
                  fill={dead ? "var(--bad)" : "var(--muted)"}
                >
                  {t({ en: `DX location ${li + 1}`, ja: `DX ロケーション ${li + 1}` })}{" "}
                  {dead ? "🔥" : ""}
                </text>
              </g>
            );
          })}
        </svg>
      </Scroll>
      <div aria-live="polite" className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr]">
        <div>
          <p
            className="font-mono text-lg font-semibold"
            style={{ color: out.connected ? "var(--ok)" : "var(--bad)" }}
          >
            ● {t(out.connected ? C.connected : C.disconnected)}
          </p>
          <p className="font-mono text-sm text-[var(--muted)]">
            {Math.round(out.capacity * 100)}% {t(C.capacity)}
          </p>
          <p className="mt-2 flex flex-wrap gap-2">
            <Tag color="var(--fiber)">SLA {info.sla}</Tag>
            <Tag>{t(info.shape)}</Tag>
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-1 text-sm font-bold text-[var(--muted)]">{t(C.survives)}</p>
          <ul className="space-y-0.5">
            {(
              [
                [C.connLoss, survivesAnyConnectionLoss(model)],
                [C.locLoss, survivesAnyLocationLoss(model)],
                [C.both, survivesLocationPlusConnection(model)],
              ] as [L, boolean][]
            ).map(([label, ok]) => (
              <li key={label.en} style={{ color: ok ? "var(--ok)" : "var(--bad)" }}>
                {ok ? "✓" : "✕"} <span className="text-[var(--ink)]">{t(label)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  );
}

const DETECT: [string, L][] = [
  [
    "BGP hold",
    {
      en: "Default hold timer 90 s (minimum 3 s). Without BFD, a silent failure can blackhole traffic for up to 90 seconds.",
      ja: "デフォルトのホールドタイマーは 90 秒 (最小 3 秒)。BFD なしだと、無言の障害で最大 90 秒トラフィックが消えます。",
    },
  ],
  [
    "BFD",
    {
      en: "Asynchronous BFD is already on at the AWS side: 300 ms × 3 → detection in about 0.9 s once you enable it on your router. AWS advises not to combine BFD with BGP graceful restart.",
      ja: "非同期 BFD は AWS 側で有効済み。300 ms × 3 で、自社ルーター側で有効にすれば約 0.9 秒で検知。AWS は BFD と BGP グレースフルリスタートの併用を推奨していません。",
    },
  ],
  [
    "VPN backup",
    {
      en: "For the same prefix, DX routes beat VPN routes, so a VPN on the same gateway is a cheap standby. Mind the bandwidth: 1.25 Gbps per tunnel (5 Gbps Large Bandwidth Tunnels on TGW / Cloud WAN since 2025-11).",
      ja: "同一プレフィックスなら DX が VPN に勝つので、同じゲートウェイ上の VPN は安価な待機系になります。帯域に注意: トンネルあたり 1.25 Gbps (TGW / Cloud WAN では 2025-11 から 5 Gbps の Large Bandwidth Tunnel)。",
    },
  ],
];

const TEST: [string, L][] = [
  [
    "Failover test",
    {
      en: "The Resiliency Toolkit's failover test (since 2020-06): AWS shuts down the BGP session of a VIF you pick for 180 minutes by default (up to 72 h). Works on private, public and transit VIFs; the VIF shows 'testing'.",
      ja: "Resiliency Toolkit のフェイルオーバーテスト (2020-06〜): 指定した VIF の BGP セッションを AWS が停止。デフォルト 180 分 (最大 72 時間)。プライベート/パブリック/トランジット VIF 対応、状態は 'testing' になります。",
    },
  ],
  [
    "AWS FIS",
    {
      en: "Since 2025-12 AWS Fault Injection Service can disrupt DX BGP sessions as part of a wider chaos experiment.",
      ja: "2025-12 から AWS Fault Injection Service でも DX の BGP セッション断を、より大きなカオス実験の一部として注入できます。",
    },
  ],
  [
    "Maintenance",
    {
      en: "Planned maintenance is announced 14 days ahead (reminders at 7 and 1 days) with a window of typically 4 hours (AWS may extend it with a new notice); emergency work usually has a 2-hour window. AWS never schedules planned work that takes down all your redundant connections at once.",
      ja: "計画メンテは 14 日前に通知 (7 日前・1 日前にリマインド)、通常 4 時間枠 (延長時は別途通知)。緊急メンテは通常 2 時間枠。冗長接続すべてを同時に落とす計画メンテは組まれません。",
    },
  ],
];

export function Resiliency() {
  const { t } = useLang();
  return (
    <Section
      id="resiliency"
      index="07"
      kicker={C.kicker}
      title={C.title}
      lead={C.lead}
      layers={["physical", "ops"]}
    >
      <div className="mb-8 max-w-3xl">
        <HikariSays mood="worried">
          <T
            c={{
              en: "On 2021-09-02, devices inside AWS's network between the Direct Connect locations and the Tokyo Region misforwarded traffic for about six hours. Every location into Tokyo was hit, so spreading connections over buildings didn't help, while Site-to-Site VPN and DX to other Regions kept working. Lesson: keep a backup of a different kind, and watch for loss, not just link state.",
              ja: "2021-09-02 の東京リージョンの Direct Connect 障害では、DX ロケーションと東京リージョンの間にある AWS 内部の機器が約 6 時間、正しく転送できなくなったの。東京に向かう通信はどのロケーションでも影響を受けたから、建物を分けるだけでは防げなかった。一方で Site-to-Site VPN や他リージョンへの DX は無事だったよ。教訓は、種類の違う予備経路を持つことと、リンクの状態だけじゃなくパケットロスも見張ること。",
            }}
          />
        </HikariSays>
      </div>
      <FailureLab />
      <div className="mt-6 max-w-3xl">
        <Callout tone="warn" title={C.slaTitle}>
          <T c={C.sla} />
        </Callout>
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {(
          [
            [C.detect, DETECT],
            [C.test, TEST],
          ] as [L, [string, L][]][]
        ).map(([title, items]) => (
          <div key={title.en}>
            <h3 className="mb-4 text-xl font-semibold">{t(title)}</h3>
            <dl className="space-y-4 text-sm">
              {items.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-sm font-bold text-[var(--fiber)]">{k}</dt>
                  <dd className="mt-1 leading-relaxed">{t(v)}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </Section>
  );
}
