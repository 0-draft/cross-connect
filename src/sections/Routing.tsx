import { useState } from "react";
import type { L } from "../i18n/lang";
import { useLang } from "../i18n/useLang";
import { Callout, Panel, Scroll, Section, T, Tag } from "../components/ui";
import {
  type Decision,
  type LocalPrefCommunity,
  type Path,
  isAsymmetric,
  selectPath,
} from "../lib/routing";
import { Hikari, HikariSays } from "../components/Hikari";

const C = {
  kicker: { en: "BGP & routing", ja: "BGP とルーティング" },
  title: {
    en: "How AWS picks the way back to you",
    ja: "AWS はどの道を通って戻ってくるのか",
  },
  lead: {
    en: "Every VIF is an eBGP session, so every design question — active/active, active/passive, DX with VPN backup — comes down to path selection. You control the AWS → on-premises direction with what you advertise; the on-premises → AWS direction is your own router's decision.",
    ja: "VIF はすべて eBGP セッションです。Active/Active か Active/Passive か、VPN をバックアップにするか — 設計上の問いはすべて経路選択に帰着します。AWS → オンプレ方向は「自社が何を広告するか」で制御し、オンプレ → AWS 方向は自社ルーター自身が決めます。",
  },
  lab: { en: "Path selection lab", ja: "経路選択ラボ" },
  labLead: {
    en: "A VPC sends traffic to 10.1.0.0/16 on-premises. You advertise it over two DX VIFs and a Site-to-Site VPN on the same virtual private gateway. Change what you advertise and watch AWS re-decide.",
    ja: "VPC からオンプレの 10.1.0.0/16 宛てに通信します。その経路を 2 本の DX VIF と、同じ VGW の Site-to-Site VPN で広告しています。広告内容を変えて、AWS の判断が変わる様子を見てください。",
  },
  order: { en: "Decision order", ja: "判定の順序" },
  up: { en: "up", ja: "稼働" },
  prefix: { en: "prefix", ja: "プレフィックス" },
  community: { en: "community", ja: "コミュニティ" },
  prepend: { en: "AS_PATH prepend", ja: "AS_PATH プリペンド" },
  home: { en: "location in VPC's Region", ja: "VPC と同じリージョンのロケーション" },
  winner: { en: "Traffic goes via", ja: "トラフィックの経路" },
  outbound: {
    en: "Your router sends outbound traffic via",
    ja: "自社ルーターが行きの通信に使う経路",
  },
  guess: {
    en: "About the remote-Region path: AWS only says an untagged path from another Region's location gets “a lower value” than 7224:7200. This lab places it between 7224:7100 and 7224:7200; how it compares with an explicit 7224:7100 is not documented.",
    ja: "別リージョンのロケーション経由の経路について: タグなしの場合 AWS は「7224:7200 より低い値」としか説明していません。このラボでは 7224:7100 と 7224:7200 の間に置いています。明示的な 7224:7100 との大小は公開されていません。",
  },
  onlyOne: {
    en: "Only one path is up, so there is nothing to compare.",
    ja: "稼働している経路が 1 本だけなので、比較するまでもありません。",
  },
  nothingUp: {
    en: "Every path is down: the VPC cannot reach 10.1.0.0/16.",
    ja: "すべての経路が停止中。VPC から 10.1.0.0/16 に届きません。",
  },
  asymTitle: { en: "Asymmetric!", ja: "非対称ルーティング!" },
  asym: {
    en: "Packets leave over one link and come back over another. A stateful firewall that sees only one direction will drop them. Make both sides agree: communities toward AWS, local preference on your router.",
    ja: "行きと帰りで別の回線を通っています。片方向しか見えないステートフル FW は通信を落とします。AWS 向けにはコミュニティ、自社ルーターにはローカルプリファレンスで、両方の向きをそろえましょう。",
  },
  sym: {
    en: "Both directions use the same path.",
    ja: "行きも帰りも同じ経路。",
  },
  ecmp: {
    en: "Return traffic is spread over every tied path, including yours. Stateful firewalls must see all of them.",
    ja: "帰りの通信は同点の経路すべてに分散されます (行きの経路も含む)。ステートフル FW はそのすべてを見られる必要があります。",
  },
  legendBack: { en: "AWS → you (AWS decides)", ja: "帰り: AWS → 自社 (AWS が決める)" },
  legendOut: { en: "you → AWS (your router)", ja: "行き: 自社 → AWS (自社ルーター)" },
  twoWays: {
    en: "There are two directions and two deciders. AWS picks the way back to you from what you advertise (communities, prefix length, AS_PATH). Your own router picks the way to AWS with its local preference. Change one and forget the other, and traffic goes out one door and comes back through another.",
    ja: "向きは 2 つ、決める人も 2 人。帰り (AWS → 自社) は、自社が広告した内容 (コミュニティ・プレフィックス長・AS_PATH) を見て AWS が決めます。行き (自社 → AWS) は自社ルーターがローカルプリファレンスで決めます。片方だけ変えると、出ていくドアと戻ってくるドアが別々になります。",
  },
  none: { en: "No path — unreachable", ja: "経路なし — 到達不可" },
  commTitle: { en: "BGP communities cheat sheet", ja: "BGP コミュニティ早見表" },
  medTitle: { en: "What this lab leaves out", ja: "このラボで省略しているもの" },
  med: {
    en: "MED is compared after AS_PATH (AWS does not recommend relying on it). On a Transit Gateway the order is static > prefix-list > VPC > DXGW-propagated > Connect > Private IP VPN > VPN, and a VGW does not ECMP across VPN tunnels. With SiteLink enabled, Regions stop preferring their own locations and pick the shortest AS_PATH.",
    ja: "MED は AS_PATH の後に比較されます (AWS は MED に頼ることを推奨していません)。Transit Gateway では、静的 > プレフィックスリスト > VPC > DXGW 伝播 > Connect > Private IP VPN > VPN の順で、VGW は VPN トンネル間で ECMP しません。SiteLink を有効にすると、リージョンは自リージョンのロケーション優先をやめ、最短 AS_PATH を選びます。",
  },
};

const STEPS: { id: Decision; label: L }[] = [
  { id: "longest-prefix", label: { en: "Longest prefix match", ja: "最長一致" } },
  {
    id: "path-type",
    label: { en: "DX BGP > VPN static > VPN BGP", ja: "DX BGP > VPN 静的 > VPN BGP" },
  },
  {
    id: "local-preference",
    label: {
      en: "Local preference (7224:7x00, or home Region)",
      ja: "ローカルプリファレンス (7224:7x00 またはホームリージョン)",
    },
  },
  { id: "as-path", label: { en: "Shortest AS_PATH", ja: "最短 AS_PATH" } },
  {
    id: "ecmp",
    label: { en: "Tie → ECMP (load-balance)", ja: "同点 → ECMP (負荷分散)" },
  },
];

const INITIAL: Path[] = [
  {
    id: "DX-A",
    kind: "dx",
    up: true,
    prefixLength: 16,
    community: null,
    prepend: 0,
    homeRegion: true,
  },
  {
    id: "DX-B",
    kind: "dx",
    up: true,
    prefixLength: 16,
    community: null,
    prepend: 0,
    homeRegion: true,
  },
  {
    id: "VPN",
    kind: "vpn-bgp",
    up: true,
    prefixLength: 16,
    community: null,
    prepend: 0,
    homeRegion: true,
  },
];

const PRESETS: { name: L; paths: Path[] }[] = [
  { name: { en: "Active / active", ja: "Active / Active" }, paths: INITIAL },
  {
    name: { en: "Active / passive (communities)", ja: "Active / Passive (コミュニティ)" },
    paths: INITIAL.map((p) =>
      p.id === "DX-A"
        ? { ...p, community: "7224:7300" }
        : p.id === "DX-B"
          ? { ...p, community: "7224:7100" }
          : p,
    ),
  },
  {
    name: { en: "Active / passive (prepend)", ja: "Active / Passive (プリペンド)" },
    paths: INITIAL.map((p) => (p.id === "DX-B" ? { ...p, prepend: 3 } : p)),
  },
  {
    name: { en: "VPN wins with a /24", ja: "/24 で VPN が勝つ" },
    paths: INITIAL.map((p) => (p.id === "VPN" ? { ...p, prefixLength: 24 } : p)),
  },
  {
    name: { en: "Remote-Region location", ja: "別リージョンのロケーション" },
    paths: INITIAL.map((p) => (p.id === "DX-B" ? { ...p, homeRegion: false } : p)),
  },
];

const COMMS: LocalPrefCommunity[] = [null, "7224:7100", "7224:7200", "7224:7300"];

function PathRow({
  p,
  win,
  onChange,
}: {
  p: Path;
  win: boolean;
  onChange: (p: Path) => void;
}) {
  const { t } = useLang();
  const isDx = p.kind === "dx";
  const sel =
    "rounded-full border border-[var(--line)] bg-[var(--panel-2)] px-1.5 py-1 font-mono text-xs";
  return (
    <div
      className={`rounded-2xl border p-3 transition-colors ${
        win ? "border-[var(--ok)] bg-[var(--panel-2)]" : "border-[var(--line)]"
      } ${p.up ? "" : "opacity-60"}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className="font-mono text-sm font-semibold"
          style={{ color: isDx ? "var(--fiber)" : "var(--violet)" }}
        >
          {p.id} {isDx ? "· private VIF" : "· Site-to-Site VPN (BGP)"}
        </span>
        <label className="flex min-h-8 items-center gap-1.5 text-xs">
          <input
            type="checkbox"
            className="size-5 accent-[var(--fiber)]"
            checked={p.up}
            onChange={(e) => onChange({ ...p, up: e.target.checked })}
          />
          {t(C.up)}
        </label>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--muted)]">
        <label className="flex min-h-8 items-center gap-1.5">
          {t(C.prefix)}
          <select
            className={sel}
            value={p.prefixLength}
            onChange={(e) => onChange({ ...p, prefixLength: Number(e.target.value) })}
          >
            <option value={16}>10.1.0.0/16</option>
            <option value={24}>10.1.0.0/24</option>
          </select>
        </label>
        {isDx && (
          <>
            <label className="flex min-h-8 items-center gap-1.5">
              {t(C.community)}
              <select
                className={sel}
                value={p.community ?? ""}
                onChange={(e) =>
                  onChange({
                    ...p,
                    community: (e.target.value || null) as LocalPrefCommunity,
                  })
                }
              >
                {COMMS.map((c) => (
                  <option key={c ?? "none"} value={c ?? ""}>
                    {c ?? "—"}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-h-8 items-center gap-1.5">
              <input
                type="checkbox"
                className="size-5 accent-[var(--fiber)]"
                checked={p.homeRegion}
                onChange={(e) => onChange({ ...p, homeRegion: e.target.checked })}
              />
              {t(C.home)}
            </label>
          </>
        )}
        <label className="flex min-h-8 items-center gap-1.5">
          {t(C.prepend)}
          <select
            className={sel}
            value={p.prepend}
            onChange={(e) => onChange({ ...p, prepend: Number(e.target.value) })}
          >
            {[0, 1, 2, 3].map((n) => (
              <option key={n} value={n}>
                ×{n}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

function PathLab() {
  const { t } = useLang();
  const [paths, setPaths] = useState<Path[]>(INITIAL);
  const [outbound, setOutbound] = useState<string>("DX-A");
  const sel = selectPath(paths);
  const outPath = paths.find((p) => p.id === outbound && p.up) ? outbound : null;
  const asym = isAsymmetric(sel.winners, outPath);
  const update = (np: Path) => setPaths((ps) => ps.map((p) => (p.id === np.id ? np : p)));
  const ys: Record<string, number> = { "DX-A": 50, "DX-B": 130, VPN: 210 };
  const stepIndex = STEPS.findIndex((s) => s.id === sel.decidedBy);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((pr) => (
            <button
              key={pr.name.en}
              type="button"
              onClick={() => setPaths(pr.paths)}
              className="rounded-full border border-[var(--line)] px-3 py-1 text-xs hover:border-[var(--fiber)]"
            >
              {t(pr.name)}
            </button>
          ))}
        </div>
        {paths.map((p) => (
          <PathRow key={p.id} p={p} win={sel.winners.includes(p.id)} onChange={update} />
        ))}
      </div>
      <Panel className="p-3 sm:p-4">
        <Scroll>
          <svg
            viewBox="0 0 520 270"
            className="diagram min-w-[420px]"
            role="img"
            aria-label={t(C.lab)}
          >
            <rect
              x="10"
              y="100"
              width="100"
              height="60"
              rx="8"
              fill="var(--panel-2)"
              stroke="var(--aws)"
            />
            <text x="60" y="126" fontSize="13.8" textAnchor="middle" fill="var(--aws)">
              VPC
            </text>
            <text x="60" y="142" fontSize="11.2" textAnchor="middle" fill="var(--muted)">
              {t({ en: "via VGW", ja: "VGW 経由" })}
            </text>
            <rect
              x="410"
              y="100"
              width="100"
              height="60"
              rx="8"
              fill="var(--panel-2)"
              stroke="var(--line)"
            />
            <text x="460" y="126" fontSize="13.8" textAnchor="middle" fill="var(--ink)">
              {t({ en: "on-prem", ja: "オンプレ" })}
            </text>
            <text x="460" y="142" fontSize="11.2" textAnchor="middle" fill="var(--muted)">
              10.1.0.0/16
            </text>
            {paths.map((p) => {
              const y = ys[p.id];
              const win = sel.winners.includes(p.id);
              const color = !p.up ? "var(--bad)" : win ? "var(--ok)" : "var(--muted)";
              return (
                <g key={p.id}>
                  <path
                    d={`M110 130 C170 130 170 ${y} 230 ${y} H300 C350 ${y} 350 130 410 130`}
                    stroke={color}
                    strokeWidth={win ? 4 : 2}
                    fill="none"
                    strokeDasharray={p.up ? undefined : "3 6"}
                    className={win ? "flow" : undefined}
                    opacity={win || !p.up ? 1 : 0.5}
                  />
                  {outPath === p.id && (
                    <path
                      d={`M410 ${140} C350 ${140} 350 ${y + 10} 300 ${y + 10} H230 C170 ${y + 10} 170 140 110 140`}
                      stroke="var(--violet)"
                      strokeWidth="2.5"
                      strokeDasharray="2 5"
                      fill="none"
                    />
                  )}
                  <rect
                    x="225"
                    y={y - 14}
                    width="80"
                    height="28"
                    rx="6"
                    fill="var(--panel)"
                    stroke={color}
                  />
                  <text
                    x="265"
                    y={y + 4}
                    fontSize="13.8"
                    textAnchor="middle"
                    fill={color}
                  >
                    {p.id}
                  </text>
                </g>
              );
            })}
            <g fontSize="12">
              <line
                x1="20"
                x2="44"
                y1="250"
                y2="250"
                stroke="var(--ok)"
                strokeWidth="4"
              />
              <text x="50" y="254" fill="var(--ink)">
                {t(C.legendBack)}
              </text>
              <line
                x1="270"
                x2="294"
                y1="250"
                y2="250"
                stroke="var(--violet)"
                strokeWidth="2.5"
                strokeDasharray="2 5"
              />
              <text x="300" y="254" fill="var(--ink)">
                {t(C.legendOut)}
              </text>
            </g>
          </svg>
        </Scroll>
        <div className="mt-3 px-1">
          <p aria-live="polite" className="text-sm">
            {t(C.winner)}:{" "}
            {sel.winners.length ? (
              <span className="font-mono font-semibold text-[var(--ok)]">
                {sel.winners.join(" + ")}
              </span>
            ) : (
              <span className="font-semibold text-[var(--bad)]">{t(C.none)}</span>
            )}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <label htmlFor="outbound" className="text-[var(--muted)]">
              {t(C.outbound)}
            </label>
            <select
              id="outbound"
              value={outbound}
              onChange={(e) => setOutbound(e.target.value)}
              className="rounded-full border-2 border-[var(--line)] bg-[var(--panel-2)] px-3 py-1 font-mono text-xs"
            >
              {paths.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id}
                </option>
              ))}
            </select>
          </div>
          {asym ? (
            <div className="mt-3 flex items-start gap-2 rounded-2xl bg-[var(--bad-soft)] p-3 text-sm">
              <Hikari mood="worried" size={40} className="shrink-0" />
              <p>
                <strong className="text-[var(--bad)]">{t(C.asymTitle)}</strong>{" "}
                {t(C.asym)}
              </p>
            </div>
          ) : (
            sel.winners.length > 0 &&
            outPath && (
              <p className="mt-3 flex items-center gap-2 text-sm text-[var(--ok)]">
                <Hikari mood="happy" size={32} />
                {t(sel.winners.length > 1 ? C.ecmp : C.sym)}
              </p>
            )
          )}
          <p className="mt-3 mb-1 text-sm font-bold text-[var(--muted)]">{t(C.order)}</p>
          <ol className="space-y-1 text-sm">
            {STEPS.map((s, i) => (
              <li
                key={s.id}
                className={
                  i === stepIndex
                    ? "font-semibold text-[var(--fiber)]"
                    : i < stepIndex
                      ? "text-[var(--muted)]"
                      : "text-[var(--muted)] opacity-60"
                }
              >
                {i + 1}. {t(s.label)} {i === stepIndex && "◀"}
              </li>
            ))}
          </ol>
          {paths.some(
            (p) => p.kind === "dx" && p.up && !p.homeRegion && !p.community,
          ) && (
            <p className="mt-2 rounded-2xl bg-[var(--panel-2)] px-3 py-2 text-xs text-[var(--muted)]">
              {t(C.guess)}
            </p>
          )}
          {stepIndex === -1 && (
            <p className="mt-2 text-xs text-[var(--muted)]">
              {t(sel.winners.length ? C.onlyOne : C.nothingUp)}
            </p>
          )}
        </div>
      </Panel>
    </div>
  );
}

const COMM_ROWS: [string, L, L][] = [
  [
    "7224:7100",
    { en: "Low local preference", ja: "ローカルプリファレンス 低" },
    { en: "you → private/transit VIF", ja: "自社 → プライベート/トランジット VIF" },
  ],
  [
    "7224:7200",
    {
      en: "Medium (implicit for same-Region locations)",
      ja: "中 (同一リージョンのロケーションの暗黙値)",
    },
    { en: "you → private/transit VIF", ja: "自社 → プライベート/トランジット VIF" },
  ],
  [
    "7224:7300",
    { en: "High local preference", ja: "ローカルプリファレンス 高" },
    { en: "you → private/transit VIF", ja: "自社 → プライベート/トランジット VIF" },
  ],
  [
    "7224:9100",
    {
      en: "Propagate your prefix to the local Region only",
      ja: "自プレフィックスをローカルリージョンのみに伝播",
    },
    { en: "you → public VIF", ja: "自社 → パブリック VIF" },
  ],
  [
    "7224:9200",
    { en: "…to all Regions on the continent", ja: "…同じ大陸の全リージョンに伝播" },
    { en: "you → public VIF", ja: "自社 → パブリック VIF" },
  ],
  [
    "7224:9300",
    { en: "…globally (same as no tag)", ja: "…全世界 (タグなしと同じ)" },
    { en: "you → public VIF", ja: "自社 → パブリック VIF" },
  ],
  [
    "7224:8100",
    {
      en: "AWS prefix from the same Region as the location",
      ja: "ロケーションと同じリージョン由来の AWS プレフィックス",
    },
    { en: "AWS → you, public VIF", ja: "AWS → 自社、パブリック VIF" },
  ],
  [
    "7224:8200",
    { en: "AWS prefix from the same continent", ja: "同じ大陸由来の AWS プレフィックス" },
    { en: "AWS → you, public VIF", ja: "AWS → 自社、パブリック VIF" },
  ],
  [
    "NO_EXPORT",
    {
      en: "On every route AWS sends over a public VIF",
      ja: "パブリック VIF で AWS が送る全経路に付与",
    },
    { en: "AWS → you, public VIF", ja: "AWS → 自社、パブリック VIF" },
  ],
];

export function Routing() {
  const { t } = useLang();
  return (
    <Section
      id="routing"
      index="06"
      kicker={C.kicker}
      title={C.title}
      lead={C.lead}
      layers={["routing"]}
    >
      <h3 className="mb-2 text-xl font-semibold">{t(C.lab)}</h3>
      <p className="mb-5 max-w-3xl text-sm text-[var(--muted)]">{t(C.labLead)}</p>
      <div className="mb-6 max-w-3xl">
        <HikariSays mood="thinking">
          <T c={C.twoWays} />
        </HikariSays>
      </div>
      <PathLab />
      <div className="mt-6 max-w-3xl">
        <Callout title={C.medTitle}>
          <T c={C.med} />
        </Callout>
      </div>

      <h3 className="mt-14 mb-4 text-xl font-semibold">{t(C.commTitle)}</h3>
      <Scroll>
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <tbody>
            {COMM_ROWS.map(([c, meaning, dir]) => (
              <tr key={c} className="border-b border-[var(--line)]">
                <td className="py-2.5 pr-4 font-mono whitespace-nowrap text-[var(--fiber)]">
                  {c}
                </td>
                <td className="py-2.5 pr-4">{t(meaning)}</td>
                <td className="py-2.5 text-right">
                  <Tag>{t(dir)}</Tag>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
      <p className="mt-4 max-w-3xl text-sm text-[var(--muted)]">
        <T
          c={{
            en: "On a public VIF AWS advertises with an AS_PATH of at least 3, prefers the home Region for identical prefixes, and replaces a private customer ASN with 7224 — so prepending with a private ASN has no effect outside AWS. Communities 7224:1–7224:65535 are reserved.",
            ja: "パブリック VIF では、AWS は AS_PATH 長 3 以上で広告し、同一プレフィックスならホームリージョンを優先します。自社のプライベート ASN は 7224 に置き換えられるため、プライベート ASN でのプリペンドは AWS の外では効きません。7224:1〜7224:65535 は予約済みです。",
          }}
        />
      </p>
    </Section>
  );
}
