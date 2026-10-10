import { useLang } from "../i18n/useLang";
import { onRampUrl } from "../content/onramp";

const C = {
  disclaimer: {
    en: "Independent explainer, not affiliated with or endorsed by Amazon Web Services. Prices and quotas change; check the AWS documentation before you design or buy.",
    ja: "AWS とは無関係の非公式解説です。料金やクォータは変わるので、設計・購入前に必ず AWS 公式ドキュメントを確認してください。",
  },
  notes: { en: "Research notes (Markdown)", ja: "調査ノート (Markdown)" },
  onRamp: {
    en: "On-ramp: every road into AWS",
    ja: "On-ramp: AWS へのすべての道",
  },
};

export function Footer() {
  const { lang, t } = useLang();
  return (
    <footer className="mt-16 border-t border-[var(--line)] py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-sm text-[var(--muted)] sm:px-6">
        <p>{t(C.disclaimer)}</p>
        <p className="flex flex-wrap gap-4 font-mono text-xs">
          <a
            className="underline hover:text-[var(--ink)]"
            href="https://github.com/0-draft/cross-connect"
          >
            github.com/0-draft/cross-connect
          </a>
          <a
            className="underline hover:text-[var(--ink)]"
            href="https://github.com/0-draft/cross-connect/tree/main/docs"
          >
            {t(C.notes)}
          </a>
          <a className="underline hover:text-[var(--ink)]" href={onRampUrl(lang)}>
            {t(C.onRamp)}
          </a>
          <span>MIT License</span>
        </p>
      </div>
    </footer>
  );
}
