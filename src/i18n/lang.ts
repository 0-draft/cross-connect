export const LANGS = ["en", "ja"] as const;
export type Lang = (typeof LANGS)[number];

/** A piece of copy in every supported language. */
export type L = Record<Lang, string>;

export const DEFAULT_LANG: Lang = "en";
const STORAGE_KEY = "cross-connect:lang";

export function isLang(v: unknown): v is Lang {
  return typeof v === "string" && (LANGS as readonly string[]).includes(v);
}

/**
 * Resolve the initial language: an explicit `?lang=` wins, then the viewer's
 * saved choice, then English. The browser locale is deliberately ignored so
 * that a shared link renders the same page for everyone.
 */
export function resolveInitialLang(search: string, stored: string | null): Lang {
  const q = new URLSearchParams(search).get("lang");
  if (isLang(q)) return q;
  if (isLang(stored)) return stored;
  return DEFAULT_LANG;
}

export function readStoredLang(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Private mode or blocked storage: the toggle still works for this visit.
  }
}
