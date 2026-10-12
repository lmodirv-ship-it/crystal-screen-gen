import type { LucideIcon } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { PublicShell } from "@/components/PublicShell";

export type InfoItem = { icon: LucideIcon; title: [string, string, string]; body: [string, string, string]; meta?: string };
const IDX: Record<Lang, number> = { en: 0, fr: 1, ar: 2 };

export function InfoPage({ lang, title, intro, items }: { lang: Lang; title: string; intro: [string, string, string]; items: InfoItem[] }) {
  const i = IDX[lang];
  return (
    <PublicShell lang={lang}>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-center font-display text-4xl font-black">{title}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">{intro[i]}</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <article key={it.title[0]} className="card p-6">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground"><it.icon className="h-5 w-5" /></span>
              <h2 className="mt-4 text-lg font-bold">{it.title[i]}</h2>
              {it.meta && <div className="mt-1 text-xs font-semibold text-primary" dir="ltr">{it.meta}</div>}
              <p className="mt-2 text-sm text-muted-foreground">{it.body[i]}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
