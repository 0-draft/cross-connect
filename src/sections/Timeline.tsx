import { useState } from "react";
import { useLang } from "../i18n/useLang";
import { Section } from "../components/ui";
import { EVENTS, KIND_COLOR, KIND_LABEL, type Kind } from "../content/timeline";

const C = {
  kicker: { en: "Timeline", ja: "年表" },
  title: { en: "Fifteen years of one cable", ja: "一本のケーブルの 15 年" },
  lead: {
    en: "From two port speeds in one Virginia data center in 2011 to 400G ports, a global gateway, native BGP telemetry and flat-rate billing in 2026 — across more than 150 locations.",
    ja: "2011 年、バージニアの 1 つのデータセンターで 2 種類のポート速度から始まり、2026 年には 400G ポート、グローバルゲートウェイ、BGP テレメトリ、定額料金へ — ロケーションは 150 超。",
  },
  all: { en: "All", ja: "すべて" },
};

export function Timeline() {
  const { t } = useLang();
  const [filter, setFilter] = useState<Kind | "all">("all");
  const shown = EVENTS.filter((e) => filter === "all" || e.kind === filter);
  return (
    <Section id="timeline" index="12" kicker={C.kicker} title={C.title} lead={C.lead}>
      <div className="mb-6 flex flex-wrap gap-1.5" role="group" aria-label={t(C.kicker)}>
        {(["all", ...Object.keys(KIND_LABEL)] as (Kind | "all")[]).map((k) => (
          <button
            key={k}
            type="button"
            aria-pressed={filter === k}
            onClick={() => setFilter(k)}
            className="rounded-full border px-3 py-1 text-xs"
            style={{
              borderColor:
                filter === k
                  ? k === "all"
                    ? "var(--ink)"
                    : KIND_COLOR[k]
                  : "var(--line)",
              color: k === "all" ? "var(--ink)" : KIND_COLOR[k],
            }}
          >
            {k === "all" ? t(C.all) : t(KIND_LABEL[k])}
          </button>
        ))}
      </div>
      <ol className="relative border-l-2 border-[var(--line)] pl-6">
        {shown.map((e) => (
          <li key={e.date + e.text.en} className="relative mb-5">
            <span
              className="absolute top-1.5 -left-[1.95rem] h-3 w-3 rounded-full ring-4 ring-[var(--bg)]"
              style={{ background: KIND_COLOR[e.kind] }}
              aria-hidden="true"
            />
            <time className="font-mono text-xs text-[var(--muted)]">{e.date}</time>
            <p className="mt-0.5">{t(e.text)}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
