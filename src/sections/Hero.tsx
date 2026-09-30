import { useLang } from "../i18n/useLang";
import { UI } from "../content/ui";
import { Hikari } from "../components/Hikari";
import { useReducedMotion } from "../components/useReducedMotion";

const C = {
  eyebrow: { en: "AWS Direct Connect, drawn", ja: "図解 AWS Direct Connect" },
  title: {
    en: "Follow one photon from your router into AWS.",
    ja: "光の粒と一緒に、自社ルーターから AWS まで。",
  },
  lead: {
    en: "Direct Connect is hard because it is four worlds at once: a fiber in someone else's building, VLANs, BGP, and AWS gateways — each with its own vocabulary. Hikari, a photon who lives in the fiber, walks you through every stop. Tap things, break things, and watch where the traffic goes.",
    ja: "Direct Connect が難しいのは、他社の建物にあるファイバー、VLAN、BGP、AWS のゲートウェイという 4 つの世界が一度に出てくるからです。しかも、それぞれに専門用語があります。ファイバーの中に住む光の粒「ヒカリ」が、ひとつずつ案内します。触って、壊して、通信がどこを通るのかを確かめてみましょう。",
  },
  start: { en: "Why is DX so confusing?", ja: "DX はなぜわかりにくい?" },
  lab: { en: "Skip to the BGP lab", ja: "BGP ラボへ" },
  you: { en: "your office", ja: "自社" },
  aws: { en: "AWS", ja: "AWS" },
  hi: { en: "Hi, I'm Hikari!", ja: "ヒカリだよ!" },
};

export function Hero() {
  const { t } = useLang();
  const reduced = useReducedMotion();
  return (
    <div className="relative pt-12 pb-6 sm:pt-20">
      <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="mb-4 inline-block rounded-full bg-[var(--fiber-soft)] px-3 py-1 text-sm font-bold text-[var(--fiber)]">
            {t(C.eyebrow)}
          </p>
          <h1 className="font-display text-4xl leading-[1.08] font-semibold sm:text-6xl">
            {t(C.title)}
          </h1>
          <p className="mt-6 max-w-[38rem] text-lg leading-relaxed text-[var(--muted)]">
            {t(C.lead)}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#why"
              className="sticker rounded-full bg-[var(--fiber)] px-6 py-3 font-bold text-[var(--on-accent)] transition-transform hover:-translate-y-0.5"
            >
              {t(C.start)}
            </a>
            <a
              href="#routing"
              className="rounded-full border-2 border-[var(--line)] bg-[var(--panel)] px-6 py-3 font-bold transition-colors hover:border-[var(--fiber)]"
            >
              {t(C.lab)}
            </a>
          </div>
          <p className="mt-6 text-xs text-[var(--muted)]">{t(UI.asOf)}</p>
        </div>

        {/* The one orchestrated moment on the page: Hikari rides the fibre. */}
        <div className="relative">
          <svg viewBox="0 0 460 300" className="w-full" role="img" aria-label={t(C.hi)}>
            <path
              id="hero-fibre"
              d="M70 220 C160 220 150 90 240 90 S360 150 395 110"
              stroke="var(--fiber)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              className="flow"
            />
            {/* office */}
            <g>
              <rect
                x="22"
                y="190"
                width="96"
                height="74"
                rx="14"
                fill="var(--panel)"
                stroke="var(--line)"
                strokeWidth="3"
              />
              <path
                d="M18 196 L70 158 L122 196"
                fill="var(--violet-soft)"
                stroke="var(--violet)"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <rect x="42" y="222" width="18" height="18" rx="4" fill="var(--aws-soft)" />
              <rect x="80" y="222" width="18" height="18" rx="4" fill="var(--aws-soft)" />
              <text
                x="70"
                y="286"
                textAnchor="middle"
                fontSize="15"
                fontWeight="700"
                fill="var(--muted)"
              >
                {t(C.you)}
              </text>
            </g>
            {/* cloud */}
            <g>
              <path
                d="M360 132 a26 26 0 0 1 8 -50 a34 34 0 0 1 64 8 a22 22 0 0 1 4 42 z"
                fill="var(--aws-soft)"
                stroke="var(--aws)"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <text
                x="402"
                y="116"
                textAnchor="middle"
                fontSize="18"
                fontWeight="800"
                fill="var(--aws)"
              >
                {t(C.aws)}
              </text>
            </g>
            {reduced ? (
              <g transform="translate(212 56)">
                <Hikari size={56} />
              </g>
            ) : (
              <g>
                <animateMotion dur="6s" repeatCount="indefinite" calcMode="linear">
                  <mpath href="#hero-fibre" />
                </animateMotion>
                <g transform="translate(-28 -34)">
                  <Hikari size={56} />
                </g>
              </g>
            )}
            <g>
              <rect
                x="176"
                y="18"
                width="150"
                height="40"
                rx="20"
                fill="var(--panel)"
                stroke="var(--fiber-soft)"
                strokeWidth="3"
              />
              <text
                x="251"
                y="44"
                textAnchor="middle"
                fontSize="16"
                fontWeight="800"
                fill="var(--fiber)"
              >
                {t(C.hi)}
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}
