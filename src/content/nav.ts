import type { L } from "../i18n/lang";

export const NAV: { id: string; label: L }[] = [
  { id: "overview", label: { en: "Overview", ja: "概要" } },
  { id: "connections", label: { en: "Connections", ja: "接続" } },
  { id: "lag-macsec", label: { en: "LAG & MACsec", ja: "LAG・MACsec" } },
  { id: "vifs", label: { en: "VIFs", ja: "VIF" } },
  { id: "gateway", label: { en: "DX gateway", ja: "DX ゲートウェイ" } },
  { id: "routing", label: { en: "BGP", ja: "BGP" } },
  { id: "resiliency", label: { en: "Resiliency", ja: "冗長性" } },
  { id: "security", label: { en: "Security", ja: "セキュリティ" } },
  { id: "operations", label: { en: "Operations", ja: "運用" } },
  { id: "pricing", label: { en: "Pricing", ja: "料金" } },
  { id: "patterns", label: { en: "Patterns", ja: "設計" } },
  { id: "timeline", label: { en: "Timeline", ja: "年表" } },
];
