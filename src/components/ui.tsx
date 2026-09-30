import type { ReactNode } from "react";
import type { L } from "../i18n/lang";
import { useLang } from "../i18n/useLang";

/** Renders a bilingual string in the current language. */
export function T({ c }: { c: L }) {
  const { t } = useLang();
  return <>{t(c)}</>;
}

export function Section({
  id,
  index,
  kicker,
  title,
  lead,
  children,
}: {
  id: string;
  index: string;
  kicker: L;
  title: L;
  lead: L;
  children: ReactNode;
}) {
  const { t } = useLang();
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="py-16 sm:py-24">
      <div className="mb-10 max-w-3xl">
        <p className="mb-3 font-mono text-xs tracking-[0.2em] text-[var(--fiber)] uppercase">
          {index} / {t(kicker)}
        </p>
        <h2
          id={`${id}-title`}
          className="mb-4 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl"
        >
          {t(title)}
        </h2>
        <p className="text-lg leading-relaxed text-[var(--muted)]">{t(lead)}</p>
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
      className={`rounded-xl border border-[var(--line)] bg-[var(--panel)] p-5 sm:p-6 ${className}`}
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
  return (
    <aside
      className="rounded-lg border-l-4 bg-[var(--panel-2)] px-5 py-4"
      style={{ borderColor: color }}
    >
      <p className="mb-1 font-mono text-xs tracking-wider uppercase" style={{ color }}>
        <T c={title} />
      </p>
      <div className="text-[0.95rem] leading-relaxed">{children}</div>
    </aside>
  );
}

export function Tag({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-block rounded border px-1.5 py-0.5 font-mono text-[0.7rem] leading-none"
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
      className="inline-flex flex-wrap gap-1 rounded-lg border border-[var(--line)] bg-[var(--panel-2)] p-1"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
            value === o.value
              ? "bg-[var(--panel)] font-semibold text-[var(--ink)] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--ink)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
