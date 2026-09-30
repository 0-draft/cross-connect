import { useState } from "react";
import { useLang } from "../i18n/useLang";
import { Section } from "../components/ui";
import { GLOSSARY, GLOSSARY_BY_ID } from "../content/glossary";
import { NAV } from "../content/nav";

const C = {
  kicker: { en: "Glossary", ja: "用語集" },
  title: { en: "Every word, in both consoles", ja: "用語を英語と日本語のコンソール名で" },
  lead: {
    en: "The AWS Japanese docs, the English docs and vendors all use slightly different words. Here is each term with its official name in both languages and what it is most often confused with.",
    ja: "AWS の日本語ドキュメント、英語ドキュメント、ベンダーで少しずつ言葉が違います。各用語の正式名 (英・日) と、よく混同される相手をまとめました。",
  },
  search: { en: "Filter terms", ja: "用語を絞り込む" },
  none: {
    en: "No term matches. Try “VIF” or “prefix”.",
    ja: "該当する用語がありません。「VIF」や「プレフィックス」で試してください。",
  },
  notTo: { en: "Not the same as", ja: "混同注意" },
  more: { en: "Explained in", ja: "解説" },
};

export function Glossary() {
  const { t, lang } = useLang();
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const shown = GLOSSARY.filter(
    (e) =>
      !needle ||
      [e.en, e.ja, e.def.en, e.def.ja].some((s) => s.toLowerCase().includes(needle)),
  );
  return (
    <Section id="glossary" index="14" kicker={C.kicker} title={C.title} lead={C.lead}>
      <label className="mb-6 block max-w-md">
        <span className="sr-only">{t(C.search)}</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t(C.search)}
          className="w-full rounded-full border-2 border-[var(--line)] bg-[var(--panel)] px-5 py-2.5 outline-none focus:border-[var(--fiber)]"
        />
      </label>
      {shown.length === 0 ? (
        <p className="text-[var(--muted)]">{t(C.none)}</p>
      ) : (
        <dl className="grid gap-4 sm:grid-cols-2">
          {shown.map((e) => {
            const other = e.notTo ? GLOSSARY_BY_ID[e.notTo.id] : undefined;
            return (
              <div
                key={e.id}
                id={`term-${e.id}`}
                className="rounded-3xl border-2 border-[var(--line)] bg-[var(--panel)] p-5"
              >
                <dt>
                  <span className="block font-display text-lg font-semibold">
                    {lang === "ja" ? e.ja : e.en}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {lang === "ja" ? e.en : e.ja}
                  </span>
                </dt>
                <dd className="mt-2 text-sm leading-relaxed">
                  {t(e.def)}
                  {e.notTo && other && (
                    <span className="mt-2 block rounded-2xl bg-[var(--panel-2)] px-3 py-2 text-xs">
                      <strong>
                        {t(C.notTo)}: {lang === "ja" ? other.ja : other.en}
                      </strong>{" "}
                      — {t(e.notTo.why)}
                    </span>
                  )}
                  <a
                    href={`#${e.see}`}
                    className="mt-2 inline-block text-xs font-bold text-[var(--fiber)] underline"
                  >
                    {t(C.more)}: {t(NAV.find((n) => n.id === e.see)?.label ?? C.more)}
                  </a>
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </Section>
  );
}
