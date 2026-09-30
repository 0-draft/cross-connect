import { useState } from "react";
import type { L } from "../i18n/lang";
import { useLang } from "../i18n/useLang";
import { Panel, Section, T } from "../components/ui";
import { HikariSays } from "../components/Hikari";
import { Term } from "../components/Term";
import { CAUSE, TRAPS, type Trap } from "../content/traps";

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
  stack: { en: "Four worlds in one feature", ja: "ひとつの機能に 4 つの世界" },
  stackHint: {
    en: "Tap any word for a plain-language definition and its official console name.",
    ja: "単語をタップすると、やさしい説明と AWS コンソール上の正式名が出ます。",
  },
  owners: { en: "…owned by different companies", ja: "…しかも持ち主がバラバラ" },
  traps: {
    en: "The traps, and where we defuse them",
    ja: "つまずきポイントと、その解き方",
  },
  goto: { en: "Go to stop", ja: "ステップ" },
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

function Traps() {
  const { t } = useLang();
  const [filter, setFilter] = useState<Trap["cause"] | null>(null);
  const shown = TRAPS.filter((x) => !filter || x.cause === filter);
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(Object.keys(CAUSE) as Trap["cause"][]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={filter === k}
            onClick={() => setFilter((f) => (f === k ? null : k))}
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
              {t(C.goto)} {x.stopNo}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WhyHard() {
  const { t } = useLang();
  return (
    <Section id="why" index="?" kicker={C.kicker} title={C.title} lead={C.lead}>
      <div className="mb-8 max-w-2xl">
        <HikariSays>
          <T c={C.notThat} />
        </HikariSays>
      </div>
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <Stack />
        <Owners />
      </div>
      <h3 className="mt-14 mb-4 font-display text-2xl font-semibold">{t(C.traps)}</h3>
      <Traps />
    </Section>
  );
}
