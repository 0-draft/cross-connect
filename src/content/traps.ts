import type { L } from "../i18n/lang";

export interface Trap {
  cause: "layers" | "words" | "context" | "invisible";
  title: L;
  wrong: L;
  stop: string;
  stopNo: number;
}

export const CAUSE: Record<Trap["cause"], { label: L; color: string }> = {
  layers: { label: { en: "Four worlds", ja: "4 つの世界" }, color: "var(--fiber)" },
  words: { label: { en: "Two meanings", ja: "言葉が二重" }, color: "var(--violet)" },
  context: {
    label: { en: "Depends on context", ja: "状況で挙動が変わる" },
    color: "var(--aws)",
  },
  invisible: {
    label: { en: "Can't see or touch", ja: "見えない・触れない" },
    color: "var(--ok)",
  },
};

export const TRAPS: Trap[] = [
  {
    cause: "layers",
    title: {
      en: "“AWS gives me the whole line”",
      ja: "「AWS が回線を全部用意してくれる」",
    },
    wrong: {
      en: "AWS only covers the building → AWS. Getting from your office to the building is your job (and your carrier's).",
      ja: "AWS が担当するのはロケーション → AWS だけ。自社からロケーションまでは自分 (とキャリア) の仕事。",
    },
    stop: "overview",
    stopNo: 1,
  },
  {
    cause: "layers",
    title: {
      en: "Connection, VIF, gateway — which is which?",
      ja: "接続・VIF・ゲートウェイ、どれがどれ?",
    },
    wrong: {
      en: "A connection is a fiber, a VIF is a VLAN + BGP session on it, a gateway is where the VIF lands in AWS. Even community answers mix them up.",
      ja: "接続はファイバー、VIF はその上の VLAN + BGP、ゲートウェイは VIF が AWS 側で着地する先。コミュニティの回答でも混同されがち。",
    },
    stop: "vifs",
    stopNo: 4,
  },
  {
    cause: "invisible",
    title: {
      en: "What is an LOA-CFA, and who plugs it in?",
      ja: "LOA-CFA って何? 誰がつなぐの?",
    },
    wrong: {
      en: "It is not a setting; it is a signed work permit. The facility installs the cross connect, not AWS.",
      ja: "設定値ではなく、署名付きの工事許可証。クロスコネクトを敷設するのは AWS ではなく施設事業者。",
    },
    stop: "connections",
    stopNo: 2,
  },
  {
    cause: "words",
    title: { en: "Hosted connection vs hosted VIF", ja: "ホスト接続とホスト VIF" },
    wrong: {
      en: "Same word, different things: one has its own capacity, the other is just a VIF on someone else's port.",
      ja: "同じ「ホスト」でも別物。片方は専用帯域を持ち、もう片方は他人のポート上の VIF にすぎない。",
    },
    stop: "connections",
    stopNo: 2,
  },
  {
    cause: "context",
    title: {
      en: "Allowed prefixes: filter or advertisement?",
      ja: "許可されたプレフィックスはフィルター? 広告?",
    },
    wrong: {
      en: "Both. It filters on a VGW association and advertises verbatim on a TGW association.",
      ja: "両方。VGW 関連付けではフィルター、TGW 関連付けではそのまま広告になる。",
    },
    stop: "gateway",
    stopNo: 5,
  },
  {
    cause: "context",
    title: {
      en: "“VPCs can talk through the DX gateway”",
      ja: "「DX ゲートウェイ経由で VPC 同士が通信できる」",
    },
    wrong: {
      en: "They can't. A DX gateway is a route reflector, not a router. Site-to-site needs SiteLink.",
      ja: "できない。DX ゲートウェイはルーターではなくルートリフレクター。拠点間には SiteLink が必要。",
    },
    stop: "gateway",
    stopNo: 5,
  },
  {
    cause: "context",
    title: { en: "“Why is my traffic on the VPN?”", ja: "「なぜか VPN 側に流れている」" },
    wrong: {
      en: "A more specific prefix beats everything, including the DX-over-VPN preference.",
      ja: "より細かいプレフィックスは何よりも優先される。「DX は VPN より優先」よりも先。",
    },
    stop: "routing",
    stopNo: 6,
  },
  {
    cause: "context",
    title: { en: "Two directions, two deciders", ja: "行きと帰りで決める人が違う" },
    wrong: {
      en: "AWS picks the way back from what you advertise; your router picks the way out. Fix only one and a stateful firewall drops the flow.",
      ja: "帰りは広告内容を見て AWS が、行きは自社ルーターが決める。片方だけ直すとステートフル FW が通信を落とす。",
    },
    stop: "routing",
    stopNo: 6,
  },
  {
    cause: "context",
    title: {
      en: "“AS_PATH prepend always works”",
      ja: "「AS_PATH プリペンドで必ず切り替わる」",
    },
    wrong: {
      en: "Across Regions it is ignored: AWS prefers locations in its own Region before it even looks at AS_PATH.",
      ja: "リージョンをまたぐと効かない。AWS は AS_PATH を見る前に自リージョンのロケーションを優先する。",
    },
    stop: "routing",
    stopNo: 6,
  },
  {
    cause: "words",
    title: { en: "“A LAG makes it redundant”", ja: "「LAG にすれば冗長化できる」" },
    wrong: {
      en: "A LAG is one device in one building. The FAQ says it plainly: more bandwidth, not more resilience.",
      ja: "LAG は同じ機器・同じ建物。FAQ にもはっきり「帯域は増えるが冗長性は増えない」とある。",
    },
    stop: "lag-macsec",
    stopNo: 3,
  },
  {
    cause: "words",
    title: {
      en: "“Closed network means encrypted”",
      ja: "「閉域だから暗号化されている」",
    },
    wrong: {
      en: "DX is plaintext by default. MACsec covers one hop on dedicated ports; IPsec or TLS goes end to end.",
      ja: "DX はデフォルトで平文。MACsec は専用ポートの 1 区間だけ、端から端までなら IPsec か TLS。",
    },
    stop: "security",
    stopNo: 8,
  },
  {
    cause: "invisible",
    title: { en: "“It says UP, so it's fine”", ja: "「UP と出ているから大丈夫」" },
    wrong: {
      en: "Links can show UP while dropping packets, and BGP state had no CloudWatch metric until 2026.",
      ja: "UP 表示のままパケットを落とすことがある。BGP の状態は 2026 年まで CloudWatch で見られなかった。",
    },
    stop: "operations",
    stopNo: 9,
  },
];
