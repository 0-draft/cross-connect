import { useLang } from "../i18n/useLang";
import { NAV } from "../content/nav";
import { UI } from "../content/ui";

export function Header() {
  const { lang, setLang, t } = useLang();
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--bg)]/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
        <a
          href="#top"
          className="flex shrink-0 items-center gap-2 font-mono text-sm font-semibold"
        >
          <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
            <path
              d="M5 22 C12 22 12 10 19 10 L27 10"
              stroke="var(--fiber)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="5" cy="22" r="3" fill="var(--fiber)" />
            <circle cx="27" cy="10" r="3" fill="var(--aws)" />
          </svg>
          cross-connect
        </a>
        <nav aria-label={t(UI.navLabel)} className="hidden min-w-0 flex-1 xl:block">
          <ul className="flex gap-3.5 overflow-x-auto text-[0.8rem] text-[var(--muted)]">
            {NAV.map((n) => (
              <li key={n.id} className="shrink-0">
                <a href={`#${n.id}`} className="hover:text-[var(--ink)]">
                  {t(n.label)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div
          role="group"
          aria-label={t(UI.language)}
          className="ml-auto flex shrink-0 rounded-md border border-[var(--line)] p-0.5 font-mono text-xs"
        >
          {(["en", "ja"] as const).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={lang === l}
              onClick={() => setLang(l)}
              className={`rounded px-2.5 py-1 ${
                lang === l
                  ? "bg-[var(--fiber)] font-semibold text-black"
                  : "text-[var(--muted)] hover:text-[var(--ink)]"
              }`}
            >
              {l === "en" ? "EN" : "日本語"}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
