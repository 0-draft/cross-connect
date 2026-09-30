import type { L } from "../i18n/lang";

export const UI = {
  navLabel: { en: "Sections", ja: "セクション" },
  language: { en: "Language", ja: "言語" },
  route: { en: "All stops", ja: "もくじ" },
  clickHint: {
    en: "Click any part of the diagram.",
    ja: "図の各パーツをクリックすると解説が出ます。",
  },
  asOf: {
    en: "Facts verified against AWS documentation as of 2026-09-30.",
    ja: "記載内容は 2026-09-30 時点の AWS 公式ドキュメントで確認済み。",
  },
  sources: { en: "Sources", ja: "出典" },
  up: { en: "up", ja: "稼働" },
  down: { en: "down", ja: "停止" },
} satisfies Record<string, L>;
