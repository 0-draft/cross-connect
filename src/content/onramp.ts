import type { Lang } from "../i18n/lang";

/**
 * On-ramp, the sibling site: every road from a corporate network into AWS
 * (internet, VPN, DX, SD-WAN, hubs, path selection, PrivateLink, DNS…).
 * It reads `?lang=` the same way this site does.
 */
export const ON_RAMP = "https://0-draft.github.io/on-ramp/";

export function onRampUrl(lang: Lang, section?: string): string {
  return `${ON_RAMP}${lang === "ja" ? "?lang=ja" : ""}${section ? `#${section}` : ""}`;
}
