import { useLang } from "../i18n/useLang";
import { UI } from "../content/ui";

const C = {
  eyebrow: { en: "AWS Direct Connect, drawn", ja: "図解 AWS Direct Connect" },
  title: {
    en: "Everything between your router and a VPC.",
    ja: "自社ルーターから VPC までの、すべて。",
  },
  lead: {
    en: "Connections, cross connects, LOA-CFAs, virtual interfaces, Direct Connect gateways, BGP communities, resiliency models, MACsec and the bill — explained with diagrams you can click, break and reroute.",
    ja: "接続、クロスコネクト、LOA-CFA、仮想インターフェース、Direct Connect ゲートウェイ、BGP コミュニティ、冗長化モデル、MACsec、そして請求額まで。クリックして、壊して、経路を切り替えられる図で解説します。",
  },
  start: { en: "Start with the path", ja: "経路から見る" },
  lab: { en: "Jump to the BGP lab", ja: "BGP ラボへ" },
};

export function Hero() {
  const { t } = useLang();
  return (
    <div className="relative pt-16 pb-8 sm:pt-24">
      <p className="mb-4 font-mono text-sm text-[var(--fiber)]">{t(C.eyebrow)}</p>
      <h1 className="max-w-4xl text-4xl leading-[1.1] font-bold tracking-tight sm:text-6xl">
        {t(C.title)}
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
        {t(C.lead)}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="#overview"
          className="rounded-lg bg-[var(--fiber)] px-5 py-2.5 font-semibold text-black hover:brightness-110"
        >
          {t(C.start)}
        </a>
        <a
          href="#routing"
          className="rounded-lg border border-[var(--line)] px-5 py-2.5 font-semibold hover:border-[var(--ink)]"
        >
          {t(C.lab)}
        </a>
      </div>
      <p className="mt-8 font-mono text-xs text-[var(--muted)]">{t(UI.asOf)}</p>
      <svg
        viewBox="0 0 1200 60"
        className="mt-10 w-full"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path
          d="M0 30 C200 30 250 10 400 10 S600 50 800 50 S1000 30 1200 30"
          stroke="var(--fiber)"
          strokeWidth="2.5"
          fill="none"
          className="flow"
        />
        <path
          d="M0 36 C200 36 250 16 400 16 S600 56 800 56 S1000 36 1200 36"
          stroke="var(--aws)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
      </svg>
    </div>
  );
}
