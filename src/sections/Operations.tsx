import { useState } from "react";
import type { L } from "../i18n/lang";
import { useLang } from "../i18n/useLang";
import { HikariSays } from "../components/Hikari";
import { Panel, Scroll, Section, Tag, T } from "../components/ui";

const C = {
  kicker: { en: "Operations", ja: "運用" },
  title: {
    en: "Watch the light, the session and the prefixes",
    ja: "光・セッション・プレフィックスを見張る",
  },
  lead: {
    en: "Direct Connect publishes CloudWatch metrics in the AWS/DX namespace at 5-minute resolution. Since 2026 you can also see BGP state, prefix counts and the actual routes exchanged without opening a support case.",
    ja: "Direct Connect は AWS/DX 名前空間に 5 分粒度で CloudWatch メトリクスを発行します。2026 年からは、サポートケースを開かなくても BGP 状態・プレフィックス数・実際にやり取りされた経路まで見られます。",
  },
  tree: {
    en: "Troubleshooting, one question at a time",
    ja: "一問ずつ切り分けるトラブルシューティング",
  },
  yes: { en: "Yes", ja: "はい" },
  no: { en: "No", ja: "いいえ" },
  restart: { en: "Start over", ja: "最初から" },
  metrics: { en: "Metrics worth an alarm", ja: "アラームを設定すべきメトリクス" },
};

type NodeId =
  "q1" | "q2" | "q3" | "q4" | "q5" | "l1" | "l2" | "l3" | "rt" | "perf" | "ok";

interface Q {
  q: L;
  yes: NodeId;
  no: NodeId;
}
interface A {
  layer: string;
  title: L;
  steps: L[];
}

const TREE: Record<NodeId, Q | A> = {
  q1: {
    q: {
      en: "Is ConnectionState = 1 (the port is up)?",
      ja: "ConnectionState = 1 (ポートが上がっている) か?",
    },
    yes: "q2",
    no: "l1",
  },
  q2: {
    q: {
      en: "Can you ping the Amazon peer IP on the VIF?",
      ja: "VIF の Amazon 側ピア IP に ping が通るか?",
    },
    yes: "q3",
    no: "l2",
  },
  q3: {
    q: {
      en: "Is the BGP session Established (VirtualInterfaceBgpStatus = 1)?",
      ja: "BGP セッションは Established (VirtualInterfaceBgpStatus = 1) か?",
    },
    yes: "q4",
    no: "l3",
  },
  q4: {
    q: { en: "Does traffic flow in both directions?", ja: "双方向に通信できるか?" },
    yes: "q5",
    no: "rt",
  },
  q5: {
    q: { en: "Is it fast and loss-free?", ja: "速度・ロスは問題ないか?" },
    yes: "ok",
    no: "perf",
  },
  l1: {
    layer: "L1",
    title: { en: "Physical link down", ja: "物理リンクダウン" },
    steps: [
      {
        en: "Cross connect completed? Ports on the completion notice match the LOA-CFA?",
        ja: "クロスコネクトは完了? 完了通知のポートは LOA-CFA と一致?",
      },
      {
        en: "Router on, port enabled, correct optic (LX / LR / LR4) on single-mode fiber?",
        ja: "ルーター電源・ポート有効・光モジュール (LX / LR / LR4) とシングルモードファイバーは正しい?",
      },
      {
        en: "Auto-negotiation set the way your AWS endpoint expects (usually off above 1G, with speed and duplex fixed).",
        ja: "オートネゴは AWS 側機器の想定どおりに (1G 超では通常オフにして速度・二重を固定)。",
      },
      {
        en: "Check ConnectionLightLevelTx/Rx; try rolling the Tx/Rx strands.",
        ja: "ConnectionLightLevelTx/Rx を確認。送受信の芯線を入れ替えてみる。",
      },
      {
        en: "Get a Tx/Rx light report from the colo, then open an AWS Support case.",
        ja: "コロケーション事業者から光レベルのレポートをもらい、AWS サポートに問い合わせ。",
      },
    ],
  },
  l2: {
    layer: "L2",
    title: { en: "Port up, VIF unreachable", ja: "ポートは上がるが VIF に届かない" },
    steps: [
      {
        en: "VLAN ID on your sub-interface matches the VIF, and 802.1Q is trunked through every device in the path.",
        ja: "サブインターフェイスの VLAN ID が VIF と一致し、経路上の全機器で 802.1Q が通っているか。",
      },
      {
        en: "Peer IPs and mask match the VIF configuration.",
        ja: "ピア IP とマスクが VIF の設定と一致しているか。",
      },
      {
        en: "Check the ARP table for the Amazon peer's MAC; clear ARP after changes.",
        ja: "ARP テーブルに Amazon 側 MAC があるか。変更後は ARP をクリア。",
      },
      {
        en: "With MACsec: CKN/CAK match and the MKA session is up?",
        ja: "MACsec 利用時: CKN/CAK は一致し、MKA セッションは確立しているか。",
      },
    ],
  },
  l3: {
    layer: "L3",
    title: { en: "BGP won't come up", ja: "BGP が確立しない" },
    steps: [
      {
        en: "Local and remote ASNs match the VIF (AWS side: VGW / DXGW ASN, or 7224 on a public VIF).",
        ja: "自側 / 対向の ASN が VIF と一致 (AWS 側は VGW / DXGW の ASN、パブリック VIF は 7224)。",
      },
      {
        en: "MD5 key identical on both sides; TCP 179 not filtered; no multihop (TTL 1).",
        ja: "MD5 キーが両端で同一、TCP 179 がフィルタされていない、マルチホップなし (TTL 1)。",
      },
      {
        en: "Advertising more than the prefix limit (100 per family by default) puts the session in Idle.",
        ja: "プレフィックス上限 (デフォルトでファミリーごと 100) を超えるとセッションは Idle になる。",
      },
      {
        en: "Public VIF still in 'verifying'? Prefix / ASN ownership not yet approved.",
        ja: "パブリック VIF が 'verifying' のまま? プレフィックス / ASN の所有確認が未完了。",
      },
    ],
  },
  rt: {
    layer: "RT",
    title: {
      en: "Session up, traffic doesn't flow",
      ja: "セッションは上がるが通信できない",
    },
    steps: [
      {
        en: "Use ListVirtualInterfaceRoutes (2026-07) to see what AWS accepted and advertises.",
        ja: "ListVirtualInterfaceRoutes (2026-07〜) で AWS が受理・広告している経路を確認。",
      },
      {
        en: "DXGW allowed prefixes cover the VPC (VGW) or list the right ranges (TGW).",
        ja: "DXGW の許可されたプレフィックスが VPC を包含 (VGW) / 正しい範囲を列挙 (TGW) しているか。",
      },
      {
        en: "Route propagation enabled in the VPC / TGW route table; ≤ 100 propagated routes per VPC table.",
        ja: "VPC / TGW ルートテーブルで経路伝播が有効か。VPC テーブルの伝播経路は最大 100。",
      },
      {
        en: "Security groups and NACLs allow the on-premises CIDRs; check for asymmetric paths.",
        ja: "セキュリティグループ・NACL がオンプレ CIDR を許可しているか。非対称経路も疑う。",
      },
    ],
  },
  perf: {
    layer: "PERF",
    title: { en: "Slow or lossy", ja: "遅い・ロスがある" },
    steps: [
      {
        en: "ConnectionBps near port speed? ConnectionDiscardsPpsEgress > 0?",
        ja: "ConnectionBps がポート速度に近い? ConnectionDiscardsPpsEgress > 0?",
      },
      {
        en: "ConnectionErrorCount > 0 or light levels drifting → optics / fiber.",
        ja: "ConnectionErrorCount > 0 や光レベルの劣化 → 光モジュール / ファイバー。",
      },
      {
        en: "MTU mismatch (9001 vs 1500) causing fragmentation or black holes.",
        ja: "MTU 不一致 (9001 と 1500) による断片化やブラックホール。",
      },
      {
        en: "Grey failure: Network Synthetic Monitor RTT/loss, Network Health Indicator = 100.",
        ja: "グレー障害: Network Synthetic Monitor の RTT / ロス、Network Health Indicator = 100。",
      },
      {
        en: "VIF rate limiter policing (VirtualInterfacePolicedBps*).",
        ja: "VIF レートリミッターによるポリシング (VirtualInterfacePolicedBps*)。",
      },
    ],
  },
  ok: {
    layer: "OK",
    title: {
      en: "Healthy — now set alarms so it stays that way",
      ja: "正常 — この状態を保つためにアラームを設定",
    },
    steps: [],
  },
};

function Troubleshoot() {
  const { t } = useLang();
  const [trail, setTrail] = useState<NodeId[]>(["q1"]);
  const cur = TREE[trail[trail.length - 1]];
  const go = (n: NodeId) => setTrail((tr) => [...tr, n]);

  return (
    <Panel>
      <ol className="mb-4 flex flex-wrap gap-1.5 font-mono text-xs">
        {trail.map((id, i) => {
          const node = TREE[id];
          return (
            <li key={`${id}-${i}`}>
              <button
                type="button"
                onClick={() => setTrail(trail.slice(0, i + 1))}
                className="min-h-8 rounded-full border-2 border-[var(--line)] px-3 py-1 text-[var(--muted)] hover:text-[var(--ink)]"
              >
                {"q" in node ? `Q${i + 1}` : node.layer}
              </button>
            </li>
          );
        })}
      </ol>
      <div aria-live="polite">
        {"q" in cur ? (
          <div>
            <p className="mb-4 text-lg font-medium">{t(cur.q)}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => go(cur.yes)}
                className="rounded-2xl bg-[var(--ok)] px-5 py-2 font-semibold text-[var(--on-accent)]"
              >
                {t(C.yes)}
              </button>
              <button
                type="button"
                onClick={() => go(cur.no)}
                className="rounded-2xl bg-[var(--bad)] px-5 py-2 font-semibold text-[var(--on-accent)]"
              >
                {t(C.no)}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-3 flex items-center gap-2 text-lg font-semibold">
              <Tag color="var(--fiber)">{cur.layer}</Tag> {t(cur.title)}
            </p>
            {cur.steps.length > 0 && (
              <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
                {cur.steps.map((s) => (
                  <li key={s.en}>{t(s)}</li>
                ))}
              </ol>
            )}
            <button
              type="button"
              onClick={() => setTrail(["q1"])}
              className="mt-4 rounded-full border border-[var(--line)] px-3 py-1.5 text-sm hover:border-[var(--ink)]"
            >
              {t(C.restart)}
            </button>
          </div>
        )}
      </div>
    </Panel>
  );
}

const METRICS: [string, L, L][] = [
  [
    "ConnectionState",
    { en: "Port up (1) / down (0)", ja: "ポート稼働 (1) / 停止 (0)" },
    { en: "< 1 → page", ja: "< 1 → 即時呼び出し" },
  ],
  [
    "VirtualInterfaceBgpStatus",
    {
      en: "BGP up per address family (2026-03)",
      ja: "アドレスファミリーごとの BGP 状態 (2026-03〜)",
    },
    { en: "< 1 → page", ja: "< 1 → 即時呼び出し" },
  ],
  [
    "VirtualInterfaceBgpPrefixesAccepted",
    {
      en: "Prefixes AWS accepted from you (2026-03)",
      ja: "AWS が受理した経路数 (2026-03〜)",
    },
    { en: "sudden drop or near quota", ja: "急減 / 上限接近" },
  ],
  [
    "ConnectionLightLevelRx / Tx",
    {
      en: "Optical power in dBm, per lane on 100G/400G",
      ja: "光パワー (dBm)。100G/400G はレーンごと",
    },
    { en: "outside healthy range", ja: "正常範囲外" },
  ],
  [
    "ConnectionErrorCount",
    {
      en: "MAC-level errors incl. CRC (use Sum)",
      ja: "CRC を含む MAC レベルのエラー (Sum で見る)",
    },
    { en: "Sum > 0", ja: "Sum > 0" },
  ],
  [
    "ConnectionBpsEgress / Ingress",
    { en: "Throughput out of / into AWS", ja: "AWS から出る / 入るスループット" },
    { en: "> 70–80% sustained (size for N+1)", ja: "70〜80% 超が継続 (N+1 で設計)" },
  ],
  [
    "ConnectionDiscardsPpsEgress",
    { en: "Egress drops (congestion)", ja: "送信側ドロップ (輻輳)" },
    { en: "> 0 sustained", ja: "> 0 が継続" },
  ],
  [
    "ConnectionEncryptionState",
    { en: "MACsec up (1) / down (0)", ja: "MACsec 稼働 (1) / 停止 (0)" },
    { en: "< 1 → security alert", ja: "< 1 → セキュリティアラート" },
  ],
  [
    "VirtualInterfacePolicedBps*",
    {
      en: "Traffic dropped by a VIF rate limiter (2026-06)",
      ja: "VIF レートリミッターが落とした量 (2026-06〜)",
    },
    { en: "> 0 → resize the limit", ja: "> 0 → 上限を見直し" },
  ],
];

export function Operations() {
  const { t } = useLang();
  return (
    <Section
      id="operations"
      index="09"
      kicker={C.kicker}
      title={C.title}
      lead={C.lead}
      layers={["ops"]}
    >
      <div className="mb-8 max-w-3xl">
        <HikariSays mood="thinking">
          <T
            c={{
              en: "Until March 2026 there was no CloudWatch metric for BGP state at all, so a session could quietly go Idle — for example after someone advertised a 101st prefix. Now you can alarm on it. Do.",
              ja: "2026 年 3 月までは BGP の状態を示す CloudWatch メトリクスがなかったので、たとえば 101 本目の経路を広告しただけでセッションが静かに Idle になっても気づけなかった。今はアラームを設定できるから、ぜひ設定してね。",
            }}
          />
        </HikariSays>
      </div>
      <h3 className="mb-4 text-xl font-semibold">{t(C.tree)}</h3>
      <Troubleshoot />
      <h3 className="mt-14 mb-4 text-xl font-semibold">{t(C.metrics)}</h3>
      <Scroll>
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <tbody>
            {METRICS.map(([m, what, alarm]) => (
              <tr key={m} className="border-b border-[var(--line)] align-top">
                <td className="py-2.5 pr-4 font-mono text-xs whitespace-nowrap text-[var(--fiber)]">
                  {m}
                </td>
                <td className="py-2.5 pr-4">{t(what)}</td>
                <td className="py-2.5 text-[var(--muted)]">{t(alarm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Scroll>
    </Section>
  );
}
