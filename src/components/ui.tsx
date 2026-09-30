import { useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import type { L } from "../i18n/lang";
import { useLang } from "../i18n/useLang";
import { TRAPS } from "../content/traps";

/** Renders a bilingual string in the current language. */
export function T({ c }: { c: L }) {
  const { t } = useLang();
  return <>{t(c)}</>;
}

export type Layer = "physical" | "link" | "routing" | "aws" | "money" | "ops";

const LAYER: Record<Layer, { label: L; color: string }> = {
  physical: {
    label: { en: "L1 · fiber & optics", ja: "L1 物理 (ファイバー・光)" },
    color: "var(--fiber)",
  },
  link: {
    label: { en: "L2 · VLAN, LACP, MACsec", ja: "L2 (VLAN・LACP・MACsec)" },
    color: "var(--violet)",
  },
  routing: { label: { en: "L3 · BGP", ja: "L3 (BGP)" }, color: "var(--aws)" },
  aws: { label: { en: "AWS resources", ja: "AWS のリソース" }, color: "var(--ok)" },
  money: { label: { en: "Billing", ja: "お金" }, color: "var(--bad)" },
  ops: { label: { en: "Operations", ja: "運用" }, color: "var(--muted)" },
};

export function LayerChip({ layer }: { layer: Layer }) {
  const { t } = useLang();
  const l = LAYER[layer];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border-2 px-2.5 py-0.5 text-xs font-bold"
      style={{ borderColor: l.color, color: l.color }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: l.color }}
        aria-hidden="true"
      />
      {t(l.label)}
    </span>
  );
}

/**
 * A stop on Hikari's route. The page is one long fibre (drawn by <Route>)
 * and each section hangs off it as a numbered station, because the sections
 * really are a sequence: from your router, through AWS, to the bill.
 */
export function Section({
  id,
  index,
  kicker,
  title,
  lead,
  layers = [],
  children,
}: {
  id: string;
  index: string;
  kicker: L;
  title: L;
  lead: L;
  layers?: Layer[];
  children: ReactNode;
}) {
  const { t } = useLang();
  const solves = TRAPS.filter((x) => x.stop === id);
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="relative py-14 pl-10 sm:py-20 sm:pl-16"
    >
      <span
        aria-hidden="true"
        className="absolute top-14 left-0 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-[var(--fiber)] bg-[var(--panel)] font-display text-sm font-bold text-[var(--fiber)] sm:top-20 sm:h-11 sm:w-11 sm:text-base"
      >
        {/^\d+$/.test(index) ? Number(index) : index}
      </span>
      <div className="mb-10 max-w-3xl">
        <p className="mb-2 flex flex-wrap items-center gap-2 text-sm font-bold text-[var(--fiber)]">
          <span className="sr-only">{index}.</span>
          {t(kicker)}
        </p>
        <h2
          id={`${id}-title`}
          className="mb-4 text-3xl leading-tight font-semibold sm:text-[2.6rem]"
        >
          {t(title)}
        </h2>
        <p className="text-lg leading-relaxed text-[var(--muted)]">{t(lead)}</p>
        {solves.length > 0 && (
          <div className="mt-4 rounded-2xl bg-[var(--panel-2)] px-4 py-3">
            <p className="mb-1.5 text-xs font-bold text-[var(--muted)]">
              {t({
                en: "Untangles these traps",
                ja: "このステップでほどける、つまずきポイント",
              })}
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {solves.map((x) => (
                <li key={x.title.en}>
                  <a
                    href="#traps"
                    className="inline-block rounded-full border-2 border-[var(--fiber-soft)] bg-[var(--panel)] px-2.5 py-0.5 text-xs font-bold hover:border-[var(--fiber)]"
                  >
                    {t(x.title)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {layers.length > 0 && (
          <p className="mt-4 flex flex-wrap gap-2">
            {layers.map((l) => (
              <LayerChip key={l} layer={l} />
            ))}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`sticker rounded-3xl border-2 border-[var(--line)] bg-[var(--panel)] p-4 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warn";
  title: L;
  children: ReactNode;
}) {
  const color = tone === "warn" ? "var(--bad)" : "var(--aws)";
  const soft = tone === "warn" ? "var(--bad-soft)" : "var(--aws-soft)";
  return (
    <aside
      className="rounded-2xl border-2 px-5 py-4"
      style={{ borderColor: color, background: soft }}
    >
      <p className="mb-1 font-bold" style={{ color }}>
        {tone === "warn" ? "⚠︎ " : "💡 "}
        <T c={title} />
      </p>
      <div className="text-[0.95rem] leading-relaxed">{children}</div>
    </aside>
  );
}

export function Tag({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-block rounded-full border-2 px-2 py-0.5 text-xs leading-tight font-bold"
      style={{ borderColor: color ?? "var(--line)", color: color ?? "var(--muted)" }}
    >
      {children}
    </span>
  );
}

/** Horizontally scrollable wrapper for wide diagrams and tables. */
export function Scroll({ children }: { children: ReactNode }) {
  const { t, lang } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);

  // Only promise a swipe when there is actually something off-screen.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollWidth > el.clientWidth + 1);
    check();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(check);
    ro.observe(el);
    // Content can widen without the container resizing (language switch,
    // late web fonts, a lab changing state).
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [lang]);

  return (
    <div>
      <div ref={ref} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {children}
      </div>
      {overflows && (
        <p className="mt-1 text-center text-xs text-[var(--muted)]" aria-hidden="true">
          {t({ en: "← swipe to see more →", ja: "← 横にスワイプできます →" })}
        </p>
      )}
    </div>
  );
}

/**
 * A single-choice toggle with the WAI-ARIA radio group keyboard model: one
 * Tab stop (the checked option), arrow keys move and select.
 */
export function Segmented<V extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: V;
  options: { value: V; label: string }[];
  onChange: (v: V) => void;
}) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const i = options.findIndex((o) => o.value === value);
    const next = (i + step + options.length) % options.length;
    onChange(options[next].value);
    const buttons = e.currentTarget.querySelectorAll<HTMLButtonElement>("[role=radio]");
    buttons[next]?.focus();
  };
  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="flex w-full gap-1 rounded-2xl border-2 border-[var(--line)] bg-[var(--panel-2)] p-1 sm:inline-flex sm:w-auto sm:flex-wrap sm:rounded-full"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          tabIndex={value === o.value ? 0 : -1}
          onClick={() => onChange(o.value)}
          className={`min-h-9 flex-1 rounded-xl px-2 py-1.5 text-sm leading-tight font-bold transition-colors sm:flex-none sm:rounded-full sm:px-3.5 ${
            value === o.value
              ? "bg-[var(--fiber)] text-[var(--on-accent)]"
              : "text-[var(--muted)] hover:bg-[var(--panel)] hover:text-[var(--ink)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
