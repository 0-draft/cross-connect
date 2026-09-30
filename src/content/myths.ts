import type { L } from "../i18n/lang";

export interface Myth {
  claim: L;
  truth: boolean;
  why: L;
}

/** Each claim is something people actually believe; see docs/13-why-dx-is-hard.md. */
export const MYTHS: Myth[] = [
  {
    claim: {
      en: "Traffic over Direct Connect is encrypted.",
      ja: "Direct Connect の通信は暗号化されている。",
    },
    truth: false,
    why: {
      en: "Not by default. Add MACsec (one hop, dedicated 10/100/400G) or IPsec/TLS.",
      ja: "デフォルトでは平文。MACsec (1 区間、専用 10/100/400G) か IPsec / TLS を足す。",
    },
  },
  {
    claim: {
      en: "A LAG of four ports makes the connection redundant.",
      ja: "4 本で LAG を組めば冗長化になる。",
    },
    truth: false,
    why: {
      en: "All LAG members sit on one AWS device in one building. Redundancy needs separate devices and locations.",
      ja: "LAG のメンバーは全部同じ AWS 機器・同じ建物。冗長化には別機器・別ロケーションが必要。",
    },
  },
  {
    claim: {
      en: "Two VPCs on the same DX gateway can reach each other through it.",
      ja: "同じ DX ゲートウェイにつながる VPC 同士は、そこ経由で通信できる。",
    },
    truth: false,
    why: {
      en: "A DX gateway does not forward VPC-to-VPC or VIF-to-VIF. (Beware: a supernet from on-prem can hairpin it through your router.)",
      ja: "DX ゲートウェイは VPC 間・VIF 間を転送しない。(ただしオンプレからスーパーネットを広告すると自社ルーター経由で折り返せてしまう点に注意)",
    },
  },
  {
    claim: {
      en: "A public VIF gives you internet access.",
      ja: "パブリック VIF でインターネットに出られる。",
    },
    truth: false,
    why: {
      en: "It reaches AWS public prefixes only (S3, public endpoints…), not the rest of the internet.",
      ja: "届くのは AWS のパブリックプレフィックス (S3 やパブリックエンドポイント) だけ。インターネット全体ではない。",
    },
  },
  {
    claim: {
      en: "One DX location in Tokyo can reach a VPC in Frankfurt.",
      ja: "東京の DX ロケーションからフランクフルトの VPC に届く。",
    },
    truth: true,
    why: {
      en: "Yes, through a Direct Connect gateway (any public Region except China). You pay the Frankfurt data-transfer rate.",
      ja: "届く。Direct Connect ゲートウェイ経由なら中国以外のどのパブリックリージョンにも。データ転送はフランクフルト側の料金。",
    },
  },
  {
    claim: {
      en: "For the same prefix, AWS prefers Direct Connect over a Site-to-Site VPN.",
      ja: "同じプレフィックスなら、AWS は VPN より Direct Connect を優先する。",
    },
    truth: true,
    why: {
      en: "True — but only for the same prefix. A more specific route over the VPN wins.",
      ja: "正しい。ただし同じプレフィックスの場合だけ。VPN 側がより細かい経路を広告すると VPN が勝つ。",
    },
  },
  {
    claim: {
      en: "AS_PATH prepending always moves AWS's return traffic to your other link.",
      ja: "AS_PATH プリペンドすれば、AWS からの戻り通信は必ずもう一方に移る。",
    },
    truth: false,
    why: {
      en: "Local preference (communities, or the home-Region preference) is compared first. Across Regions, prepending is ignored.",
      ja: "先に比較されるのはローカルプリファレンス (コミュニティやホームリージョン優先)。リージョンをまたぐとプリペンドは効かない。",
    },
  },
  {
    claim: {
      en: "“Allowed prefixes” on a Transit Gateway association are advertised to your router as written.",
      ja: "TGW 関連付けの「許可されたプレフィックス」は、書いたとおりにオンプレへ広告される。",
    },
    truth: true,
    why: {
      en: "Yes — on a TGW it is the advertisement. On a VGW it is only a filter on the VPC CIDR.",
      ja: "その通り。TGW では広告そのもの。VGW では VPC CIDR に対するフィルターにすぎない。",
    },
  },
  {
    claim: {
      en: "A hosted connection and a hosted VIF are the same thing.",
      ja: "ホスト接続とホスト VIF は同じもの。",
    },
    truth: false,
    why: {
      en: "A hosted connection has its own policed capacity; a hosted VIF is only a VIF on someone else's connection.",
      ja: "ホスト接続は AWS がポリシングする専用帯域を持つ。ホスト VIF は他人の接続上の VIF にすぎない。",
    },
  },
  {
    claim: {
      en: "AWS installs the fiber between your cage and its router.",
      ja: "自社ケージと AWS ルーターの間のファイバーは AWS が敷設する。",
    },
    truth: false,
    why: {
      en: "The colocation facility does, using the LOA-CFA you download from AWS and hand over.",
      ja: "敷設するのはデータセンター事業者。AWS からダウンロードした LOA-CFA を渡して依頼する。",
    },
  },
];
