import type { L } from "../i18n/lang";

export type Kind = "connection" | "routing" | "security" | "ops" | "billing";

export const KIND_COLOR: Record<Kind, string> = {
  connection: "var(--fiber)",
  routing: "var(--aws)",
  security: "var(--ok)",
  ops: "var(--violet)",
  billing: "var(--bad)",
};

export const KIND_LABEL: Record<Kind, L> = {
  connection: { en: "Connection", ja: "接続" },
  routing: { en: "Routing", ja: "ルーティング" },
  security: { en: "Security", ja: "セキュリティ" },
  ops: { en: "Operations", ja: "運用" },
  billing: { en: "Billing", ja: "課金" },
};

export const EVENTS: { date: string; kind: Kind; text: L }[] = [
  {
    date: "2011-08-03",
    kind: "connection",
    text: {
      en: "Direct Connect launches: 1G and 10G ports at Equinix Ashburn for US East",
      ja: "Direct Connect 提供開始: Equinix Ashburn で 1G / 10G ポート (US East)",
    },
  },
  {
    date: "2012-01-10",
    kind: "connection",
    text: {
      en: "Locations for Ireland, Singapore, Tokyo and N. California",
      ja: "アイルランド・シンガポール・東京・北カリフォルニア向けロケーション",
    },
  },
  {
    date: "2013-10-22",
    kind: "connection",
    text: {
      en: "Hosted connections: sub-1G capacity through partners",
      ja: "ホスト接続: パートナー経由の 1G 未満の帯域",
    },
  },
  {
    date: "2016-12-01",
    kind: "routing",
    text: { en: "IPv6 BGP peering on VIFs", ja: "VIF で IPv6 BGP ピアリング" },
  },
  {
    date: "2017-02-13",
    kind: "connection",
    text: { en: "Link aggregation groups (LAG)", ja: "LAG (リンクアグリゲーション)" },
  },
  {
    date: "2017-11-01",
    kind: "routing",
    text: {
      en: "Direct Connect gateway: one DX reaches VPCs in any Region",
      ja: "Direct Connect ゲートウェイ: 1 本の DX で任意リージョンの VPC へ",
    },
  },
  {
    date: "2018-02-06",
    kind: "routing",
    text: {
      en: "Local preference communities 7224:7100/7200/7300",
      ja: "ローカルプリファレンスコミュニティ 7224:7100/7200/7300",
    },
  },
  {
    date: "2018-10-11",
    kind: "connection",
    text: { en: "Jumbo frames (MTU 9001)", ja: "ジャンボフレーム (MTU 9001)" },
  },
  {
    date: "2019-04",
    kind: "routing",
    text: {
      en: "Transit VIF and Transit Gateway support",
      ja: "トランジット VIF と Transit Gateway 対応",
    },
  },
  {
    date: "2019-10-07",
    kind: "ops",
    text: {
      en: "Resiliency Toolkit (connection wizard with SLA models)",
      ja: "Resiliency Toolkit (SLA モデル付き接続ウィザード)",
    },
  },
  {
    date: "2020-06-03",
    kind: "ops",
    text: {
      en: "Failover testing for BGP sessions",
      ja: "BGP セッションのフェイルオーバーテスト",
    },
  },
  {
    date: "2021-02",
    kind: "connection",
    text: {
      en: "Native 100 Gbps dedicated connections",
      ja: "ネイティブ 100 Gbps 専用接続",
    },
  },
  {
    date: "2021-03-31",
    kind: "security",
    text: {
      en: "MACsec on 10G and 100G dedicated connections",
      ja: "10G / 100G 専用接続で MACsec",
    },
  },
  {
    date: "2021-12-01",
    kind: "routing",
    text: {
      en: "SiteLink: site-to-site over the AWS backbone",
      ja: "SiteLink: AWS バックボーン経由の拠点間通信",
    },
  },
  {
    date: "2022-06-22",
    kind: "security",
    text: {
      en: "Private IP VPN over a transit VIF",
      ja: "トランジット VIF 上の Private IP VPN",
    },
  },
  {
    date: "2022-08-08",
    kind: "routing",
    text: {
      en: "Transit VIFs on hosted connections of any speed, including below 1G",
      ja: "1G 未満を含む全速度のホスト接続でトランジット VIF が使えるように",
    },
  },
  {
    date: "2023-12",
    kind: "ops",
    text: {
      en: "CloudWatch Network Monitor (now Network Synthetic Monitor)",
      ja: "CloudWatch Network Monitor (現 Network Synthetic Monitor)",
    },
  },
  {
    date: "2024-04-24",
    kind: "connection",
    text: { en: "Hosted connections up to 25 Gbps", ja: "ホスト接続が最大 25 Gbps に" },
  },
  {
    date: "2024-07-01",
    kind: "connection",
    text: {
      en: "Native 400 Gbps dedicated connections",
      ja: "ネイティブ 400 Gbps 専用接続",
    },
  },
  {
    date: "2024-11-25",
    kind: "routing",
    text: {
      en: "Cloud WAN native Direct Connect gateway attachment",
      ja: "Cloud WAN のネイティブ DX ゲートウェイ接続",
    },
  },
  {
    date: "2025-07-28",
    kind: "security",
    text: { en: "MACsec on partner interconnects", ja: "パートナー相互接続で MACsec" },
  },
  {
    date: "2025-09-12",
    kind: "routing",
    text: { en: "4-byte ASNs on all VIF types", ja: "全 VIF 種別で 4 バイト ASN" },
  },
  {
    date: "2025-11-30",
    kind: "connection",
    text: {
      en: "AWS Interconnect – multicloud preview",
      ja: "AWS Interconnect – multicloud プレビュー",
    },
  },
  {
    date: "2025-12",
    kind: "ops",
    text: {
      en: "Fault Injection Service can disrupt DX BGP",
      ja: "Fault Injection Service で DX の BGP 断を注入可能に",
    },
  },
  {
    date: "2026-03",
    kind: "ops",
    text: {
      en: "CloudFormation support for DX resources",
      ja: "DX リソースの CloudFormation 対応",
    },
  },
  {
    date: "2026-03-30",
    kind: "ops",
    text: {
      en: "CloudWatch BGP status and prefix metrics",
      ja: "CloudWatch の BGP 状態・プレフィックス数メトリクス",
    },
  },
  {
    date: "2026-04-13",
    kind: "connection",
    text: {
      en: "AWS Interconnect – multicloud GA",
      ja: "AWS Interconnect – multicloud GA",
    },
  },
  {
    date: "2026-06-01",
    kind: "connection",
    text: {
      en: "VIF rate limiters: cap a VIF from 50 Mbps up to the connection or LAG capacity",
      ja: "VIF レートリミッター: VIF ごとに 50 Mbps から接続 / LAG の容量まで上限を設定",
    },
  },
  {
    date: "2026-07-30",
    kind: "routing",
    text: {
      en: "BGP route visibility (ListVirtualInterfaceRoutes)",
      ja: "BGP 経路の可視化 (ListVirtualInterfaceRoutes)",
    },
  },
  {
    date: "2026-08-20",
    kind: "routing",
    text: {
      en: "Inbound prefix controls: up to 1,000 per VIF per family",
      ja: "受信プレフィックス制御: VIF・ファミリーごと最大 1,000",
    },
  },
  {
    date: "2026-09-15",
    kind: "billing",
    text: {
      en: "Flat-rate pricing and port-pairs for 10G / 100G",
      ja: "10G / 100G の定額料金とポートペア",
    },
  },
];
