import type { ReactNode } from "react";
import type { L } from "../i18n/lang";
import { useLang } from "../i18n/useLang";

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
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="relative py-14 pl-11 sm:py-20 sm:pl-16"
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
      className={`sticker rounded-3xl border-2 border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6 ${className}`}
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
  return <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">{children}</div>;
}

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
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex flex-wrap gap-1 rounded-full border-2 border-[var(--line)] bg-[var(--panel-2)] p-1"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors ${
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
