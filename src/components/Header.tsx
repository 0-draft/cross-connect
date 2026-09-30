import { useEffect, useRef, useState } from "react";
import { useLang } from "../i18n/useLang";
import { Hikari } from "./Hikari";
import { NAV } from "../content/nav";
import { UI } from "../content/ui";

/** The route map: every stop on one card, instead of a nav bar that overflows. */
function RouteMenu() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="route-menu"
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border-2 border-[var(--line)] bg-[var(--panel)] px-4 py-1.5 text-sm font-bold whitespace-nowrap hover:border-[var(--fiber)]"
      >
        {t(UI.route)}
      </button>
      {open && (
        <nav
          id="route-menu"
          aria-label={t(UI.navLabel)}
          className="sticker fixed inset-x-4 top-16 rounded-3xl border-2 border-[var(--line)] bg-[var(--panel)] p-3 sm:absolute sm:inset-x-auto sm:top-full sm:right-0 sm:mt-2 sm:w-[22rem]"
        >
          <ol className="grid grid-flow-col grid-rows-8 gap-1">
            {NAV.map((n, i) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  onClick={() => setOpen(false)}
                  className="flex min-h-9 items-center gap-2 rounded-2xl px-2 py-1.5 text-sm hover:bg-[var(--fiber-soft)]"
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[var(--fiber)] text-xs font-bold text-[var(--fiber)]"
                    aria-hidden="true"
                  >
                    {i === 0 ? "?" : i}
                  </span>
                  {t(n.label)}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </div>
  );
}

export function Header() {
  const { lang, setLang, t } = useLang();
  return (
    <header className="sticky top-0 z-20 border-b-2 border-[var(--line)] bg-[var(--bg)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <a
          href="#top"
          className="flex shrink-0 items-center gap-2 font-display text-lg font-semibold"
        >
          <Hikari size={30} />
          cross-connect
        </a>
        <div className="ml-auto flex items-center gap-2">
          <RouteMenu />
          <div
            role="group"
            aria-label={t(UI.language)}
            className="flex shrink-0 rounded-full border-2 border-[var(--line)] bg-[var(--panel)] p-0.5 text-xs"
          >
            {(["en", "ja"] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={lang === l}
                onClick={() => setLang(l)}
                className={`rounded-full px-3 py-1 ${
                  lang === l
                    ? "bg-[var(--fiber)] font-bold text-[var(--on-accent)]"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {l === "en" ? "EN" : "日本語"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
