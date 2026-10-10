import { useState } from "react";
import type { L } from "../i18n/lang";
import { useLang } from "../i18n/useLang";
import { Panel, Section, T } from "../components/ui";
import { HikariSays } from "../components/Hikari";
import { Term } from "../components/Term";
import { CAUSE, TRAPS, type Trap } from "../content/traps";
import { NAV } from "../content/nav";
import { OnRampLink } from "../components/OnRampLink";

const C = {
  kicker: { en: "Start here", ja: "まずはここから" },
  title: {
    en: "Why Direct Connect feels so hard",
    ja: "Direct Connect がむずかしく感じるわけ",
  },
  lead: {
    en: "We read re:Post questions, Knowledge Center articles, study guides and Japanese community write-ups to find exactly where people get stuck. It comes down to four things — and every stop on this route is built to untangle one of them.",
    ja: "re:Post の質問、Knowledge Center、資格の勉強記録、日本のコミュニティ記事を読み込んで、みんながどこでつまずくのかを洗い出しました。原因は大きく 4 つ。このサイトの各ステップは、そのどれかをほどくために作っています。",
  },
  stack: {
    en: "Cause 1, up close: four worlds in one feature",
    ja: "原因 1 をくわしく: ひとつの機能に 4 つの世界",
  },
  belief: { en: "Common belief", ja: "よくある思い込み" },
  showTraps: { en: "Show these traps", ja: "該当する例を見る" },
  stackHint: {
    en: "Tap any word for a plain-language definition and its official console name.",
    ja: "単語をタップすると、やさしい説明と AWS コンソール上の正式名が出ます。",
  },
  owners: {
    en: "Cause 4, up close: who owns what",
    ja: "原因 4 をくわしく: だれが何を持っているか",
  },
  traps: {
    en: "The traps, and where we defuse them",
    ja: "つまずきポイントと、その解き方",
  },
  goto: { en: "Stop", ja: "ステップ" },
  roads: {
    en: "Direct Connect is one road into AWS, not the only one. The internet, Site-to-Site VPN, SD-WAN, and the hubs and DNS that tie them together are mapped on our sibling site, ",
    ja: "Direct Connect は AWS への道のひとつにすぎません。インターネット、Site-to-Site VPN、SD-WAN、それらをまとめるハブや DNS は、姉妹サイトの ",
  },
  roadsEnd: {
    en: ". This site stays on the DX road.",
    ja: " で道路地図として整理しています。このサイトは DX の道に絞って解説します。",
  },
  notThat: {
    en: "One more thing: in Japan “DX” usually means digital transformation. Here it means Direct Connect — the fiber, not the buzzword.",
    ja: "最初にひとつだけ。ここでの「DX」はデジタルトランスフォーメーションではなく Direct Connect のこと。バズワードじゃなくて、ファイバーの話だよ。",
  },
};

interface Row {
  layer: L;
  color: string;
  soft: string;
  terms: string[];
}

const STACK: Row[] = [
  {
    layer: { en: "AWS resources", ja: "AWS のリソース" },
    color: "var(--ok)",
    soft: "var(--ok-soft)",
    terms: ["vif", "dxgw", "vgw", "tgw", "allowed-prefixes", "sitelink"],
  },
  {
    layer: { en: "L3 · routing", ja: "L3 ルーティング" },
    color: "var(--aws)",
    soft: "var(--aws-soft)",
    terms: ["bgp", "community", "region"],
  },
  {
    layer: { en: "L2 · link", ja: "L2 リンク" },
    color: "var(--violet)",
    soft: "var(--violet-soft)",
    terms: ["lag", "macsec", "hosted-vif"],
  },
  {
    layer: { en: "L1 · physical", ja: "L1 物理" },
    color: "var(--fiber)",
    soft: "var(--fiber-soft)",
    terms: [
      "location",
      "cross-connect",
      "loa-cfa",
      "connection",
      "dedicated",
      "hosted-connection",
    ],
  },
];

const OWNERS: { who: L; owns: L; color: string }[] = [
  {
    who: { en: "You", ja: "自社" },
    owns: { en: "Router, ASN, prefixes, the order", ja: "ルーター、ASN、経路、発注" },
    color: "var(--fiber)",
  },
  {
    who: { en: "Carrier / partner", ja: "キャリア / パートナー" },
    owns: {
      en: "The circuit to the building, hosted connections",
      ja: "建物までの回線、ホスト接続",
    },
    color: "var(--violet)",
  },
  {
    who: { en: "Colocation facility", ja: "データセンター事業者" },
    owns: {
      en: "The cross connect, installed with your LOA-CFA",
      ja: "LOA-CFA を使って敷設するクロスコネクト",
    },
    color: "var(--sun)",
  },
  {
    who: { en: "AWS", ja: "AWS" },
    owns: {
      en: "The port, the backbone, VIFs and gateways",
      ja: "ポート、バックボーン、VIF、ゲートウェイ",
    },
    color: "var(--aws)",
  },
];

function Stack() {
  const { t } = useLang();
  return (
    <Panel>
      <p className="mb-1 font-display text-xl font-semibold">{t(C.stack)}</p>
      <p className="mb-4 text-sm text-[var(--muted)]">{t(C.stackHint)}</p>
      <div className="space-y-2">
        {STACK.map((r) => (
          <div
            key={r.layer.en}
            className="flex flex-col gap-2 rounded-2xl border-2 px-4 py-3 sm:flex-row sm:items-center"
            style={{ borderColor: r.color, background: r.soft }}
          >
            <span className="w-36 shrink-0 font-bold" style={{ color: r.color }}>
              {t(r.layer)}
            </span>
            <span className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
              {r.terms.map((id) => (
                <Term key={id} id={id} />
              ))}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Owners() {
  const { t } = useLang();
  return (
    <Panel>
      <p className="mb-4 font-display text-xl font-semibold">{t(C.owners)}</p>
      <ul className="space-y-3">
        {OWNERS.map((o) => (
          <li key={o.who.en} className="flex items-start gap-3">
            <span
              className="mt-1 h-4 w-4 shrink-0 rounded-full"
              style={{ background: o.color }}
              aria-hidden="true"
            />
            <span>
              <span className="block font-bold">{t(o.who)}</span>
              <span className="text-sm text-[var(--muted)]">{t(o.owns)}</span>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Traps({
  filter,
  setFilter,
}: {
  filter: Trap["cause"] | null;
  setFilter: (f: Trap["cause"] | null) => void;
}) {
  const { t } = useLang();
  const shown = TRAPS.filter((x) => !filter || x.cause === filter);
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(Object.keys(CAUSE) as Trap["cause"][]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={filter === k}
            onClick={() => setFilter(filter === k ? null : k)}
            className="rounded-full border-2 px-3 py-1 text-sm font-bold transition-colors"
            style={{
              borderColor: CAUSE[k].color,
              background: filter === k ? CAUSE[k].color : "transparent",
              color: filter === k ? "var(--on-accent)" : CAUSE[k].color,
            }}
          >
            {t(CAUSE[k].label)}
          </button>
        ))}
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((x) => (
          <li
            key={x.title.en}
            className="sticker flex flex-col rounded-3xl border-2 border-[var(--line)] bg-[var(--panel)] p-5"
          >
            <span
              className="mb-2 self-start rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={{ background: CAUSE[x.cause].color, color: "var(--on-accent)" }}
            >
              {t(CAUSE[x.cause].label)}
            </span>
            {/^[“「]/.test(t(x.title)) && (
              <p className="text-xs font-bold text-[var(--bad)]">✕ {t(C.belief)}</p>
            )}
            <p className="mb-2 font-display text-lg leading-snug font-semibold">
              {t(x.title)}
            </p>
            <p className="mb-4 text-sm leading-relaxed text-[var(--muted)]">
              {t(x.wrong)}
            </p>
            <a
              href={`#${x.stop}`}
              className="mt-auto self-start rounded-full bg-[var(--fiber-soft)] px-3 py-1 text-sm font-bold text-[var(--fiber)] hover:brightness-95"
            >
              {t(C.goto)} {x.stopNo}:{" "}
              {t(NAV.find((n) => n.id === x.stop)?.label ?? C.goto)}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const CAUSE_TEXT: Record<Trap["cause"], L> = {
  layers: {
    en: "Fiber and optics, VLANs, BGP and AWS gateways all show up at once — and most people are fluent in one or two of them.",
    ja: "ファイバーと光、VLAN、BGP、AWS のゲートウェイが一度に出てくる。全部に詳しい人はほとんどいない。",
  },
  words: {
    en: "“Hosted”, “location”, “closed network”, even “DX” mean two different things depending on who says them.",
    ja: "「ホスト」「ロケーション」「閉域」、そして「DX」さえも、言う人によって意味が変わる。",
  },
  context: {
    en: "Allowed prefixes, AS_PATH prepending and MTU behave differently depending on what they are attached to.",
    ja: "許可されたプレフィックス、AS_PATH プリペンド、MTU は、何につながっているかで挙動が変わる。",
  },
  invisible: {
    en: "No free-tier lab, four companies own pieces of the path, and until 2026 BGP state wasn't even in CloudWatch.",
    ja: "無料で試せる環境はなく、経路の持ち主は 4 社にまたがり、2026 年までは BGP の状態すら CloudWatch で見えなかった。",
  },
};

function Causes({ onPick }: { onPick: (c: Trap["cause"]) => void }) {
  const { t } = useLang();
  return (
    <ol className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {(Object.keys(CAUSE) as Trap["cause"][]).map((k, i) => (
        <li
          key={k}
          className="flex flex-col rounded-3xl border-2 p-5"
          style={{ borderColor: CAUSE[k].color }}
        >
          <span
            className="mb-3 flex h-9 w-9 items-center justify-center rounded-full font-display text-lg font-bold"
            style={{ background: CAUSE[k].color, color: "var(--on-accent)" }}
            aria-hidden="true"
          >
            {i + 1}
          </span>
          <p className="mb-2 font-display text-lg font-semibold">{t(CAUSE[k].label)}</p>
          <p className="mb-4 text-sm leading-relaxed text-[var(--muted)]">
            {t(CAUSE_TEXT[k])}
          </p>
          <button
            type="button"
            onClick={() => onPick(k)}
            className="mt-auto min-h-8 self-start rounded-full border-2 px-3 py-1 text-sm font-bold"
            style={{ borderColor: CAUSE[k].color, color: CAUSE[k].color }}
          >
            {t(C.showTraps)} ({TRAPS.filter((x) => x.cause === k).length})
          </button>
        </li>
      ))}
    </ol>
  );
}

export function WhyHard() {
  const { t } = useLang();
  const [filter, setFilter] = useState<Trap["cause"] | null>(null);
  const pick = (c: Trap["cause"]) => {
    setFilter(c);
    document.getElementById("traps")?.scrollIntoView();
  };
  return (
    <Section id="why" index="?" kicker={C.kicker} title={C.title} lead={C.lead}>
      <div className="mb-8 max-w-2xl">
        <HikariSays>
          <T c={C.notThat} />
        </HikariSays>
      </div>
      <p className="mb-8 max-w-3xl text-sm leading-relaxed text-[var(--muted)]">
        <T c={C.roads} />
        <OnRampLink>On-ramp</OnRampLink>
        <T c={C.roadsEnd} />
      </p>
      <Causes onPick={pick} />
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Stack />
        <Owners />
      </div>
      <h3 id="traps" className="mt-14 mb-4 font-display text-2xl font-semibold">
        {t(C.traps)}
      </h3>
      <Traps filter={filter} setFilter={setFilter} />
    </Section>
  );
}
