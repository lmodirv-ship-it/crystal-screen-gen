import { useNavigate, useRouterState } from "@tanstack/react-router";
import { LANGS, LANG_LABEL, type Lang } from "@/lib/i18n";

export function LangSwitch({ lang }: { lang: Lang }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  return (
    <select
      aria-label="language"
      value={lang}
      onChange={(e) => navigate({ to: path.replace(/^\/(en|fr|ar)/, `/${e.target.value}`) as "/" })}
      className="input w-auto py-1.5 font-bold"
    >
      {LANGS.map((l) => <option key={l} value={l}>{l.toUpperCase()} · {LANG_LABEL[l]}</option>)}
    </select>
  );
}
