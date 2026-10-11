import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero-car.jpg";
import { isLang, translator } from "@/lib/i18n";
import { CURRENCY, FLEET } from "@/lib/demo-data";
import { LangSwitch } from "@/components/LangSwitch";
import { useRole } from "@/lib/role-store";

export const Route = createFileRoute("/$lang/")({
  head: () => ({
    meta: [
      { title: "HN RentCar — Car rental agency platform" },
      { name: "description", content: "Rent a car or run your whole rental agency: fleet, bookings, contracts, payments and reports in Arabic, French and English." },
      { property: "og:title", content: "HN RentCar — Car rental agency platform" },
      { property: "og:description", content: "Multilingual car rental management for every role in your agency." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { lang } = Route.useParams();
  const l = isLang(lang) ? lang : "en";
  const t = translator(l);
  const { setRole } = useRole();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="font-display text-lg font-bold">HN <span className="text-accent">RentCar</span></div>
          <div className="flex items-center gap-3">
            <LangSwitch lang={l} />
            <Link to="/$lang/app" params={{ lang: l }} className="btn-primary">{t("openApp")}</Link>
          </div>
        </div>
      </header>
      <section className="relative overflow-hidden">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" width={1600} height={900} />
        <div className="hero-fade absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-28 md:py-40">
          <h1 className="max-w-2xl font-display text-4xl font-bold leading-tight md:text-6xl">{t("heroTitle")}</h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">{t("heroSub")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#fleet" className="btn-accent">{t("browseFleet")}</a>
            <Link to="/$lang/app" params={{ lang: l }} className="btn-ghost">{t("openApp")}</Link>
          </div>
        </div>
      </section>
      <section id="fleet" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-2xl font-semibold">{t("ourFleet")}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FLEET.map((c) => (
            <div key={c.model} className="card p-5">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{c.category}</div>
              <div className="mt-1 font-display text-lg font-semibold">{c.model}</div>
              <div className="mt-4 flex items-end justify-between">
                <div><span className="text-2xl font-bold text-accent">{c.price}</span> <span className="text-sm text-muted-foreground">{CURRENCY} {t("perDay")}</span></div>
                <Link to="/$lang/app" params={{ lang: l }} onClick={() => setRole("customer")} className="btn-ghost text-sm">{t("bookNow")}</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">© 2026 HN RentCar</footer>
    </div>
  );
}
