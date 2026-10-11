import { useNavigate, useRouterState } from "@tanstack/react-router";
import { LANGS, type Lang } from "@/lib/i18n";

export function LangSwitch({ lang }: { lang: Lang }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  return (
    <div className="flex rounded-lg border border-border p-0.5 text-xs">
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => navigate({ to: path.replace(/^\/(en|fr|ar)/, `/${l}`) as "/" })}
          className={`rounded-md px-2 py-1 font-semibold uppercase ${l === lang ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
