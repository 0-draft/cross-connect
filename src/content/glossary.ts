import type { L } from "../i18n/lang";

export interface Entry {
  id: string;
  /** Name as it appears in English docs and the console. */
  en: string;
  /** Name as it appears in the AWS Japanese docs and console. */
  ja: string;
  def: L;
  /** The term this one is most often mixed up with, and the difference. */
  notTo?: { id: string; why: L };
  /** Section that explains it in depth. */
  see: string;
}

export const GLOSSARY: Entry[] = [
  {
    id: "dx",
    en: "Direct Connect (DX)",
    ja: "AWS Direct Connect (DX)",
    def: {
      en: "AWS's service for linking your network to AWS over a fiber in a colocation facility. In Japanese, 'DX' also means digital transformation — not this one.",
      ja: "コロケーション施設内の光ファイバーで自社ネットワークと AWS をつなぐ AWS のサービス。日本語の「DX」(デジタルトランスフォーメーション) とは別物。",
    },
    see: "overview",
  },
  {
    id: "location",
    en: "Direct Connect location",
    ja: "Direct Connect ロケーション",
    def: {
      en: "A third-party data center (Equinix, AT Tokyo…) where AWS has routers. Like an airport: you still need your own bus (a carrier circuit) to get there.",
      ja: "AWS がルーターを置いている第三者のデータセンター (Equinix、AT東京など)。空港のようなもので、そこまでのバス (キャリア回線) は自分で用意する。",
    },
    notTo: {
      id: "region",
      why: {
        en: "A location has an associated Region, but through a DX gateway it reaches VPCs in any Region (except China).",
        ja: "ロケーションには関連リージョンがあるが、DX ゲートウェイ経由なら (中国を除く) どのリージョンの VPC にも届く。",
      },
    },
    see: "overview",
  },
  {
    id: "region",
    en: "AWS Region",
    ja: "AWS リージョン",
    def: {
      en: "Where your VPCs live. Each DX location is associated with one Region, and a Region prefers paths through its own associated locations by default. It is a preference, not a limit on reach.",
      ja: "VPC が存在する場所。各 DX ロケーションは 1 つのリージョンに関連付けられ、リージョンはデフォルトで自分に関連付いたロケーション経由の経路を優先する。あくまで優先度で、到達範囲の制限ではない。",
    },
    see: "routing",
  },
  {
    id: "cross-connect",
    en: "Cross connect",
    ja: "クロスコネクト",
    def: {
      en: "The short fiber patch inside the building between your (or your carrier's) port and AWS's port. The facility installs it, not AWS.",
      ja: "建物内で自社 (またはキャリア) のポートと AWS のポートをつなぐ短いファイバー。敷設するのは AWS ではなく施設事業者。",
    },
    see: "connections",
  },
  {
    id: "loa-cfa",
    en: "LOA-CFA",
    ja: "LOA-CFA",
    def: {
      en: "Letter of Authorization – Connecting Facility Assignment. Not a config value: a signed work permit that tells the facility which AWS port to patch into. Expires after 90 days.",
      ja: "Letter of Authorization – Connecting Facility Assignment。設定値ではなく、どの AWS ポートに挿すかを施設に示す署名付きの「工事の許可証」。90 日で失効。",
    },
    see: "connections",
  },
  {
    id: "connection",
    en: "Connection",
    ja: "接続",
    def: {
      en: "The physical port: one fiber at one speed. Nothing flows over it until you add a virtual interface.",
      ja: "物理ポートそのもの。1 本のファイバー、1 つの速度。VIF を作るまで何も流れない。",
    },
    notTo: {
      id: "vif",
      why: {
        en: "A connection is the road; VIFs are the lanes painted on it.",
        ja: "接続は道路、VIF はその上に引いた車線。",
      },
    },
    see: "connections",
  },
  {
    id: "dedicated",
    en: "Dedicated connection",
    ja: "専用接続",
    def: {
      en: "A whole port on an AWS router (1/10/100/400 Gbps) ordered by you. Vendors sometimes call this 占有型; that is a marketing label, not an AWS term.",
      ja: "AWS ルーターのポートを丸ごと使う接続 (1/10/100/400 Gbps)。自社が発注する。ベンダーが「占有型」と呼ぶことがあるが AWS の用語ではない。",
    },
    see: "connections",
  },
  {
    id: "hosted-connection",
    en: "Hosted connection",
    ja: "ホスト接続",
    def: {
      en: "A slice of a partner's port (50 Mbps–25 Gbps) with its own AWS-policed capacity, handed to your account with exactly one VIF. Like renting a whole flat.",
      ja: "パートナーのポートから切り出された帯域 (50 Mbps〜25 Gbps)。AWS が上限を制御する専用帯域があり、VIF はちょうど 1 本。部屋を丸ごと借りるイメージ。",
    },
    notTo: {
      id: "hosted-vif",
      why: {
        en: "A hosted VIF has no capacity of its own; it is only a VIF on someone else's connection — renting a room in someone else's flat.",
        ja: "ホスト VIF は帯域を持たず、他人の接続上の VIF にすぎない。他人の家の一部屋を借りるイメージ。",
      },
    },
    see: "connections",
  },
  {
    id: "hosted-vif",
    en: "Hosted VIF",
    ja: "ホスト仮想インターフェイス",
    def: {
      en: "A VIF that another account creates on its own connection and you accept. It shares that connection's bandwidth and can be oversubscribed.",
      ja: "他のアカウントが自分の接続上に作成し、自社側で承認する VIF。その接続の帯域を共有するため、他の利用者と帯域を奪い合うことがある。",
    },
    see: "connections",
  },
  {
    id: "vif",
    en: "Virtual interface (VIF)",
    ja: "仮想インターフェイス (VIF)",
    def: {
      en: "One 802.1Q VLAN plus one BGP session on a connection. Private, public and transit VIFs each reach a different kind of destination.",
      ja: "接続上の 802.1Q VLAN 1 本と BGP セッション 1 本の組。プライベート・パブリック・トランジットで到達先の種類が違う。",
    },
    see: "vifs",
  },
  {
    id: "dxgw",
    en: "Direct Connect gateway",
    ja: "Direct Connect ゲートウェイ",
    def: {
      en: "A global, free route reflector outside the data path. It tells each side what the other side has; by design it does not forward VPC-to-VPC or VIF-to-VIF (a supernet you advertise can still hairpin traffic through your router).",
      ja: "データ経路の外にある、グローバルで無料のルートリフレクター。両側に相手側の経路を教える。設計上 VPC 間・VIF 間の転送はしない (ただし自社が広告したスーパーネット経由で自社ルーターを折り返すことはある)。",
    },
    notTo: {
      id: "tgw",
      why: {
        en: "A Transit Gateway is a real router that forwards between attachments; a DX gateway is not.",
        ja: "Transit Gateway はアタッチメント間を転送する本物のルーター。DX ゲートウェイは違う。",
      },
    },
    see: "gateway",
  },
  {
    id: "vgw",
    en: "Virtual private gateway (VGW)",
    ja: "仮想プライベートゲートウェイ",
    def: {
      en: "The VPN/DX endpoint attached to one VPC. A private VIF lands on it directly or through a DX gateway.",
      ja: "1 つの VPC にアタッチされる VPN / DX の終端。プライベート VIF は直接、または DX ゲートウェイ経由でここに着く。",
    },
    see: "gateway",
  },
  {
    id: "tgw",
    en: "Transit Gateway (TGW)",
    ja: "Transit Gateway",
    def: {
      en: "A regional router hub for many VPCs. From DX it is reached natively through a transit VIF and a DX gateway (or with a Site-to-Site VPN over a public VIF).",
      ja: "多数の VPC をつなぐリージョン単位のルーターハブ。DX からはトランジット VIF + DX ゲートウェイ経由で直接つながる (パブリック VIF 上の Site-to-Site VPN でも可)。",
    },
    see: "gateway",
  },
  {
    id: "allowed-prefixes",
    en: "Allowed prefixes",
    ja: "許可されたプレフィックス",
    def: {
      en: "On a VGW association: a checkpoint that lets a VPC CIDR through only if an entry is equal or wider. On a TGW association: a signboard — exactly the list is advertised to you.",
      ja: "VGW 関連付けでは「検問所」: 同じか広いエントリがあるときだけ VPC CIDR を通す。TGW 関連付けでは「看板」: リストがそのまま広告される。ドキュメントでは「許可されるプレフィックス」表記もある。",
    },
    see: "gateway",
  },
  {
    id: "sitelink",
    en: "SiteLink",
    ja: "SiteLink",
    def: {
      en: "A per-VIF switch that lets your own sites talk to each other between DX locations over the AWS backbone, without entering a Region.",
      ja: "VIF ごとの設定で、自社拠点同士を DX ロケーション間の AWS バックボーン経由で直接つなぐ。リージョンには入らない。",
    },
    see: "gateway",
  },
  {
    id: "lag",
    en: "Link aggregation group (LAG)",
    ja: "リンク集約グループ (LAG)",
    def: {
      en: "Several same-speed dedicated connections on one AWS device bundled with LACP. More bandwidth, not more resilience: one device, one building.",
      ja: "同じ AWS 機器上の同速度の専用接続を LACP で束ねたもの。帯域は増えるが冗長性は増えない (機器 1 台・建物 1 つ)。",
    },
    see: "lag-macsec",
  },
  {
    id: "macsec",
    en: "MACsec",
    ja: "MACsec",
    def: {
      en: "IEEE 802.1AE Layer 2 encryption on the link between your router and the AWS device. Hop-by-hop, not end-to-end. Dedicated 10/100/400G only.",
      ja: "自社ルーターと AWS 機器の間のリンクを暗号化する IEEE 802.1AE (L2)。区間暗号でありエンドツーエンドではない。専用 10/100/400G のみ。",
    },
    see: "lag-macsec",
  },
  {
    id: "bgp",
    en: "BGP",
    ja: "BGP",
    def: {
      en: "The routing protocol every VIF runs. You tell AWS your prefixes, AWS tells you its prefixes, and attributes like communities and AS_PATH decide the path.",
      ja: "すべての VIF で動くルーティングプロトコル。自社の経路を AWS に、AWS の経路を自社に伝え、コミュニティや AS_PATH などの属性で経路が決まる。",
    },
    see: "routing",
  },
  {
    id: "community",
    en: "BGP community",
    ja: "BGP コミュニティ",
    def: {
      en: "A tag on a route. 7224:7100/7200/7300 set how much AWS prefers a path back to you; 7224:9100/9200/9300 set how far your public prefixes spread.",
      ja: "経路に付けるタグ。7224:7100/7200/7300 は AWS からの戻り経路の優先度、7224:9100/9200/9300 は自社パブリックプレフィックスの広がる範囲を決める。",
    },
    see: "routing",
  },
  {
    id: "resiliency-toolkit",
    en: "Resiliency Toolkit",
    ja: "Resiliency Toolkit",
    def: {
      en: "The console wizard that orders connections in a Maximum (99.99%), High (99.9%) or Development-and-test shape, and runs failover tests.",
      ja: "Maximum (99.99%)・High (99.9%)・開発とテストのいずれかの形で接続を発注し、フェイルオーバーテストも行えるコンソールのウィザード。",
    },
    see: "resiliency",
  },
];

export const GLOSSARY_BY_ID: Record<string, Entry> = Object.fromEntries(
  GLOSSARY.map((e) => [e.id, e]),
);
