import { useState } from "react";
import { useLang } from "../i18n/useLang";
import { Section } from "../components/ui";
import { Hikari } from "../components/Hikari";
import { MYTHS } from "../content/myths";

const C = {
  kicker: { en: "Quick check", ja: "腕だめし" },
  title: { en: "Myth or fact?", ja: "ほんと? うそ?" },
  lead: {
    en: "Ten things people commonly believe about Direct Connect. Pick an answer on each card to see whether you were right.",
    ja: "Direct Connect についてよくある思い込みを 10 個。カードごとに答えを選ぶと、正解と理由が出ます。",
  },
  fact: { en: "Fact", ja: "ほんと" },
  myth: { en: "Myth", ja: "うそ" },
  right: { en: "Right!", ja: "正解!" },
  wrong: { en: "Not quite.", ja: "ざんねん。" },
  score: { en: "correct", ja: "問正解" },
  reset: { en: "Try again", ja: "もう一度" },
};

export function Myths() {
  const { t, lang } = useLang();
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const answered = Object.keys(answers).length;
  const correct = Object.entries(answers).filter(
    ([i, a]) => MYTHS[Number(i)].truth === a,
  ).length;
  const done = answered === MYTHS.length;

  return (
    <Section id="myths" index="12" kicker={C.kicker} title={C.title} lead={C.lead}>
      <div
        aria-live="polite"
        className="sticker mb-6 inline-flex items-center gap-3 rounded-full border-2 border-[var(--line)] bg-[var(--panel)] py-1.5 pr-4 pl-1.5"
      >
        <Hikari
          size={40}
          mood={!done ? "thinking" : correct >= 8 ? "happy" : "worried"}
        />
        <span className="font-display text-lg font-semibold">
          {lang === "ja"
            ? `${answered} / ${MYTHS.length} 問中 ${correct} ${t(C.score)}`
            : `${correct} of ${answered} ${t(C.score)}, ${MYTHS.length - answered} to go`}
        </span>
        {answered > 0 && (
          <button
            type="button"
            onClick={() => setAnswers({})}
            className="rounded-full px-3 py-1 text-sm font-bold text-[var(--fiber)] hover:bg-[var(--fiber-soft)]"
          >
            {t(C.reset)}
          </button>
        )}
      </div>
      <ol className="grid gap-4 sm:grid-cols-2">
        {MYTHS.map((m, i) => {
          const a = answers[i];
          const isAnswered = a !== undefined;
          const ok = isAnswered && a === m.truth;
          return (
            <li
              key={m.claim.en}
              className="sticker flex flex-col rounded-3xl border-2 bg-[var(--panel)] p-5 transition-colors"
              style={{
                borderColor: !isAnswered
                  ? "var(--line)"
                  : ok
                    ? "var(--ok)"
                    : "var(--bad)",
              }}
            >
              <p className="mb-4 font-display text-lg leading-snug font-semibold">
                <span className="mr-2 text-[var(--fiber)]">Q{i + 1}.</span>
                {t(m.claim)}
              </p>
              {!isAnswered ? (
                <div className="mt-auto flex gap-2">
                  {[true, false].map((v) => (
                    <button
                      key={String(v)}
                      type="button"
                      onClick={() => setAnswers((x) => ({ ...x, [i]: v }))}
                      className="flex-1 rounded-full border-2 border-[var(--line)] px-4 py-2 font-bold hover:border-[var(--fiber)] hover:bg-[var(--fiber-soft)]"
                    >
                      {t(v ? C.fact : C.myth)}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-auto">
                  <p
                    className="font-bold"
                    style={{ color: ok ? "var(--ok)" : "var(--bad)" }}
                  >
                    {t(ok ? C.right : C.wrong)} {t(m.truth ? C.fact : C.myth)}.
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                    {t(m.why)}
                  </p>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
