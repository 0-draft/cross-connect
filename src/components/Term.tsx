import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { GLOSSARY_BY_ID } from "../content/glossary";
import { useLang } from "../i18n/useLang";

/**
 * An inline glossary toggletip. Acronyms are the first wall people hit with
 * Direct Connect, so any term can be tapped for a plain-language definition,
 * its official console name in both languages, and what it is not.
 */
export function Term({ id, children }: { id: string; children?: ReactNode }) {
  const { lang, t } = useLang();
  const e = GLOSSARY_BY_ID[id];
  const [open, setOpen] = useState(false);
  const tipId = useId();
  const ref = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);

  // Keep the tip inside the viewport: terms near the right edge would
  // otherwise push the page sideways on phones.
  useLayoutEffect(() => {
    if (!open || !tipRef.current) return;
    const r = tipRef.current.getBoundingClientRect();
    const margin = 16;
    // Undo any shift left over from the previous opening before measuring.
    const left = r.left - shift;
    const over = r.right - shift - (window.innerWidth - margin);
    setShift(over > 0 ? Math.max(-over, margin - left) : 0);
    // Measure only when opening; the shift itself must not retrigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (ev: PointerEvent) => {
      if (ref.current && !ref.current.contains(ev.target as Node)) setOpen(false);
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!e) {
    // A typo in a term id must not blank the whole page in production.
    if (import.meta.env.DEV) throw new Error(`unknown glossary term: ${id}`);
    return <>{children ?? id}</>;
  }
  const other = e.notTo ? GLOSSARY_BY_ID[e.notTo.id] : undefined;

  return (
    <span ref={ref} className="relative inline">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={tipId}
        onClick={() => setOpen((o) => !o)}
        className="cursor-help rounded-sm font-[inherit] underline decoration-[var(--fiber)] decoration-dotted decoration-2 underline-offset-4 hover:bg-[var(--fiber-soft)]"
      >
        {children ?? (lang === "ja" ? e.ja : e.en)}
      </button>
      {open && (
        <span
          id={tipId}
          ref={tipRef}
          role="note"
          style={{ transform: `translateX(${shift}px)` }}
          className="sticker absolute top-full left-0 z-30 mt-2 block w-[min(20rem,80vw)] rounded-2xl border-2 border-[var(--fiber-soft)] bg-[var(--panel)] p-4 text-left text-sm leading-relaxed font-normal text-[var(--ink)]"
        >
          <span className="block font-display text-base font-semibold">{e.en}</span>
          <span className="mb-2 block text-xs text-[var(--muted)]">
            {lang === "ja" ? "AWS 日本語ドキュメント: " : "AWS Japanese docs: "}
            {e.ja}
          </span>
          <span className="block">{t(e.def)}</span>
          {e.notTo && other && (
            <span className="mt-2 block rounded-xl bg-[var(--panel-2)] px-3 py-2 text-xs">
              <strong>
                {lang === "ja"
                  ? `「${other.ja}」とは違う: `
                  : `Not the same as ${other.en}: `}
              </strong>
              {t(e.notTo.why)}
            </span>
          )}
          <a
            href={`#${e.see}`}
            onClick={() => setOpen(false)}
            className="mt-2 inline-block text-xs font-bold text-[var(--fiber)] underline"
          >
            {lang === "ja" ? "くわしく見る" : "Read more"}
          </a>
        </span>
      )}
    </span>
  );
}
