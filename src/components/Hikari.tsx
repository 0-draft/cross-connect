import type { ReactNode } from "react";
import type { L } from "../i18n/lang";
import { useLang } from "../i18n/useLang";

export type Mood = "happy" | "worried" | "thinking" | "sleepy";

/**
 * Hikari (光, "light") is a photon who lives in the fibre. She guides the
 * reader and mirrors the state of each lab: happy when traffic flows,
 * worried when the path breaks.
 */
export function Hikari({
  mood = "happy",
  size = 56,
  className = "",
  title,
}: {
  mood?: Mood;
  size?: number;
  className?: string;
  title?: string;
}) {
  const mouth: Record<Mood, string> = {
    happy: "M24 37 Q32 44 40 37",
    worried: "M25 41 Q32 35 39 41",
    thinking: "M26 39 H38",
    sleepy: "M28 39 Q32 41 36 39",
  };
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <circle cx="32" cy="33" r="27" fill="var(--fiber)" opacity="0.18" />
      <circle
        cx="32"
        cy="33"
        r="21"
        fill="var(--fiber-soft)"
        stroke="var(--fiber)"
        strokeWidth="2.5"
      />
      {/* sparkle antenna */}
      <path d="M32 12 V5" stroke="var(--fiber)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="4" r="3" fill="var(--sun)" />
      {mood === "sleepy" ? (
        <>
          <path
            d="M22 30 Q25 32 28 30"
            stroke="var(--ink)"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M36 30 Q39 32 42 30"
            stroke="var(--ink)"
            strokeWidth="2.2"
            fill="none"
            strokeLinecap="round"
          />
        </>
      ) : (
        <g className="blink">
          <circle cx="25" cy="30" r="3" fill="var(--ink)" />
          <circle cx="39" cy="30" r="3" fill="var(--ink)" />
          <circle cx="26" cy="29" r="1" fill="#fff" />
          <circle cx="40" cy="29" r="1" fill="#fff" />
        </g>
      )}
      {mood === "worried" && (
        <path d="M44 20 q3 5 0 7 q-3 -2 0 -7" fill="var(--aws)" opacity="0.8" />
      )}
      <circle cx="19" cy="37" r="3" fill="var(--fiber)" opacity="0.35" />
      <circle cx="45" cy="37" r="3" fill="var(--fiber)" opacity="0.35" />
      <path
        d={mouth[mood]}
        stroke="var(--ink)"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A speech bubble from Hikari: used for analogies and plain-language asides. */
export function HikariSays({
  mood = "happy",
  title,
  children,
}: {
  mood?: Mood;
  title?: L;
  children: ReactNode;
}) {
  const { t } = useLang();
  return (
    <aside className="flex items-start gap-3">
      <Hikari mood={mood} size={52} className="bob mt-1 shrink-0" />
      <div className="relative rounded-2xl rounded-tl-md border-2 border-[var(--fiber-soft)] bg-[var(--panel)] px-4 py-3 text-[0.95rem] leading-relaxed">
        {title && <p className="mb-1 font-bold text-[var(--fiber)]">{t(title)}</p>}
        {children}
      </div>
    </aside>
  );
}
