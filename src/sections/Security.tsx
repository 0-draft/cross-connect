import { useState } from "react";
import type { L } from "../i18n/lang";
import { useLang } from "../i18n/useLang";
import { Callout, Panel, Scroll, Section, T } from "../components/ui";

const C = {
  kicker: { en: "Security", ja: "セキュリティ" },
  title: {
    en: "Private is not the same as encrypted",
    ja: "「専用」は「暗号化」ではない",
  },
  lead: {
    en: "AWS states plainly that Direct Connect does not encrypt your traffic in transit by default. The cross connect, a partner's network and the DX device all carry your frames in clear text until you add a layer that encrypts.",
    ja: "AWS は「Direct Connect はデフォルトでは転送中のトラフィックを暗号化しない」と明言しています。クロスコネクトも、パートナー網も、DX 機器も、暗号化レイヤーを足さない限りフレームを平文のまま運びます。",
  },
  layers: { en: "Which segment each layer protects", ja: "各レイヤーが守る区間" },
  pickTitle: { en: "MACsec or IPsec?", ja: "MACsec か IPsec か" },
  publicTitle: {
    en: "A public VIF widens your exposure",
    ja: "パブリック VIF は露出面を広げる",
  },
  public: {
    en: "You receive every AWS public prefix in every public Region — including addresses used by other AWS customers — and the prefixes you advertise are reachable from any AWS public IP. Put a firewall on it, filter with 7224:8100/8200 and scope your own prefixes with 7224:9100/9200. If you only need a few services, a private VIF plus PrivateLink endpoints is a smaller surface. (S3/DynamoDB gateway endpoints do not accept traffic arriving over DX.)",
    ja: "全パブリックリージョンの AWS パブリックプレフィックスを受け取ります (他の AWS 顧客が使うアドレスも含む)。そしてお客様が広告したプレフィックスには、任意の AWS パブリック IP から到達できます。ファイアウォールを置き、7224:8100/8200 でフィルタし、自プレフィックスは 7224:9100/9200 でスコープを絞りましょう。使うサービスが少ないなら、プライベート VIF + PrivateLink エンドポイントの方が攻撃面は小さくなります (S3 / DynamoDB のゲートウェイエンドポイントは DX 経由の通信を受け付けません)。",
  },
  checklist: { en: "Checklist", ja: "チェックリスト" },
};

type Layer = "macsec" | "ipsec" | "tls";

const LAYERS: Record<
  Layer,
  { label: string; color: string; from: number; to: number; body: L }
> = {
  macsec: {
    label: "MACsec · L2",
    color: "var(--ok)",
    from: 150,
    to: 450,
    body: {
      en: "Your router ↔ AWS DX device. Near line rate, no extra charge. Dedicated 10/100/400G at (M) locations, LAGs and partner interconnects. Protects everything on the link, including ARP and BGP.",
      ja: "お客様ルーター ↔ AWS DX 機器。ほぼラインレート、追加料金なし。(M) 表記拠点の専用 10/100/400G、LAG、パートナー相互接続で利用可。ARP や BGP を含むリンク上のすべてを保護。",
    },
  },
  ipsec: {
    label: "IPsec · L3",
    color: "var(--violet)",
    from: 150,
    to: 790,
    body: {
      en: "Your router ↔ Transit Gateway (Private IP VPN over a transit VIF, since 2022-06, no public IPs) or ↔ VGW/TGW public endpoints over a public VIF. Works on any connection, including 1G and hosted. Per-tunnel throughput limits apply.",
      ja: "お客様ルーター ↔ Transit Gateway (トランジット VIF 上の Private IP VPN、2022-06〜、パブリック IP 不要)、またはパブリック VIF 経由で VGW / TGW のパブリックエンドポイント。1G やホスト型を含むあらゆる接続で使えるが、トンネルあたりのスループット上限あり。",
    },
  },
  tls: {
    label: "TLS · L7",
    color: "var(--aws)",
    from: 60,
    to: 890,
    body: {
      en: "Application ↔ application. Always recommended for sensitive data, whatever the network does underneath.",
      ja: "アプリケーション ↔ アプリケーション。下のネットワークが何であれ、機密データには常に推奨。",
    },
  },
};

function LayerDiagram() {
  const { t } = useLang();
  const [focus, setFocus] = useState<Layer>("macsec");
  const nodes: [number, string][] = [
    [60, "app"],
    [150, "router"],
    [450, "DX device"],
    [790, "TGW / VGW"],
    [890, "workload"],
  ];
  return (
    <Panel>
      <Scroll>
        <svg
          viewBox="0 0 950 250"
          className="diagram min-w-[680px]"
          role="group"
          aria-label={t(C.layers)}
        >
          <line x1="60" x2="890" y1="40" y2="40" stroke="var(--line)" strokeWidth="2" />
          <line x1="150" x2="450" y1="40" y2="40" stroke="var(--fiber)" strokeWidth="3" />
          <text x="300" y="30" fontSize="11.2" textAnchor="middle" fill="var(--fiber)">
            cross connect / carrier
          </text>
          <line x1="450" x2="790" y1="40" y2="40" stroke="var(--aws)" strokeWidth="3" />
          <text x="620" y="30" fontSize="11.2" textAnchor="middle" fill="var(--aws)">
            AWS backbone (AWS physical-layer encryption)
          </text>
          {nodes.map(([x, label]) => (
            <g key={label}>
              <circle
                cx={x}
                cy="40"
                r="7"
                fill="var(--panel)"
                stroke="var(--ink)"
                strokeWidth="2"
              />
              <text x={x} y="66" fontSize="12.5" textAnchor="middle" fill="var(--muted)">
                {label}
              </text>
            </g>
          ))}
          {(Object.keys(LAYERS) as Layer[]).map((k, i) => {
            const l = LAYERS[k];
            const y = 95 + i * 50;
            const on = focus === k;
            return (
              <g
                key={k}
                role="button"
                tabIndex={0}
                aria-pressed={on}
                aria-label={l.label}
                className="cursor-pointer"
                onClick={() => setFocus(k)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setFocus(k);
                  }
                }}
                opacity={on ? 1 : 0.45}
              >
                <rect
                  x={l.from}
                  y={y}
                  width={l.to - l.from}
                  height="30"
                  rx="15"
                  fill={l.color}
                  opacity="0.18"
                />
                <rect
                  x={l.from}
                  y={y}
                  width={l.to - l.from}
                  height="30"
                  rx="15"
                  fill="none"
                  stroke={l.color}
                  strokeWidth={on ? 2.5 : 1.5}
                />
                <text
                  x={(l.from + l.to) / 2}
                  y={y + 19}
                  fontSize="13.8"
                  textAnchor="middle"
                  fill={l.color}
                >
                  {l.label}
                </text>
              </g>
            );
          })}
        </svg>
      </Scroll>
      <p aria-live="polite" className="mt-3 text-sm leading-relaxed">
        <span className="font-mono font-semibold" style={{ color: LAYERS[focus].color }}>
          {LAYERS[focus].label}
        </span>{" "}
        — {t(LAYERS[focus].body)}
      </p>
    </Panel>
  );
}

const PICK: [L, string][] = [
  [
    {
      en: "10G+ dedicated, only the last mile is untrusted, need line rate",
      ja: "10G 以上の専用接続、信用できないのは最後の区間だけ、ラインレートが必要",
    },
    "MACsec",
  ],
  [
    { en: "1G dedicated or any hosted connection", ja: "1G 専用接続またはホスト型接続" },
    "IPsec",
  ],
  [
    {
      en: "Compliance demands encryption to the VPC edge",
      ja: "VPC 境界までの暗号化がコンプライアンス要件",
    },
    "Private IP VPN (+ MACsec)",
  ],
  [
    { en: "No public IP addresses allowed", ja: "パブリック IP を使えない" },
    "Private IP VPN",
  ],
  [{ en: "Defense in depth", ja: "多層防御" }, "MACsec + TLS / IPsec + TLS"],
];

const CHECKS: L[] = [
  {
    en: "Decide the encryption requirement explicitly — DX alone does not encrypt.",
    ja: "暗号化要件を明示的に決める — DX 単体は暗号化しない。",
  },
  {
    en: "Use MACsec on 10/100/400G dedicated ports; alarm on ConnectionEncryptionState; consider must_encrypt.",
    ja: "10/100/400G 専用ポートでは MACsec を使い、ConnectionEncryptionState にアラームを設定。must_encrypt も検討。",
  },
  {
    en: "Restrict DXGW allowed prefixes to what each VPC / TGW needs.",
    ja: "DXGW の許可プレフィックスを各 VPC / TGW に必要な範囲に絞る。",
  },
  {
    en: "Centralize DX in a network account; deny directconnect:Create* / Allocate* / Accept* elsewhere with SCPs.",
    ja: "DX はネットワークアカウントに集約し、他アカウントでは SCP で directconnect:Create* / Allocate* / Accept* を拒否。",
  },
  {
    en: "Send CloudTrail centrally; alert on VIF creation and DXGW association changes.",
    ja: "CloudTrail を集中管理し、VIF 作成や DXGW 関連付けの変更を検知・通知。",
  },
  {
    en: "BGP MD5 is mandatory and TTL is 1 (no multihop).",
    ja: "BGP MD5 は必須、TTL は 1 (マルチホップ不可)。",
  },
];

export function Security() {
  const { t } = useLang();
  return (
    <Section id="security" index="08" kicker={C.kicker} title={C.title} lead={C.lead}>
      <h3 className="mb-4 text-xl font-semibold">{t(C.layers)}</h3>
      <LayerDiagram />
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 text-xl font-semibold">{t(C.pickTitle)}</h3>
          <table className="w-full border-collapse text-sm">
            <tbody>
              {PICK.map(([need, pick]) => (
                <tr key={need.en} className="border-b border-[var(--line)] align-top">
                  <td className="py-2.5 pr-4">{t(need)}</td>
                  <td className="py-2.5 font-mono whitespace-nowrap text-[var(--fiber)]">
                    {pick}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h3 className="mb-4 text-xl font-semibold">{t(C.checklist)}</h3>
          <ul className="space-y-2 text-sm">
            {CHECKS.map((c) => (
              <li key={c.en} className="flex gap-2">
                <span className="text-[var(--ok)]">☐</span>
                <T c={c} />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-8 max-w-3xl">
        <Callout tone="warn" title={C.publicTitle}>
          <T c={C.public} />
        </Callout>
      </div>
    </Section>
  );
}
