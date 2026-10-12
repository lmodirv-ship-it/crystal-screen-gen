import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays, Mail, MapPin, Phone } from "lucide-react";
import { translator, type Lang } from "@/lib/i18n";
import { LangSwitch } from "@/components/LangSwitch";
import { BrandLogo } from "@/components/BrandLogo";
import { StatsBar } from "@/components/StatsBar";
import { useAuth } from "@/lib/auth";

export function PublicShell({ lang, children }: { lang: Lang; children: ReactNode }) {
  const t = translator(lang);
  const { user } = useAuth();
  const nav = "transition-colors hover:text-primary";
  const active = { className: "text-primary" };
  return (
    <div className="min-h-screen bg-background">
      <StatsBar lang={lang} />
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <BrandLogo lang={lang} />
          <nav className="flex gap-4 overflow-x-auto text-sm font-bold md:gap-6">
            <Link to="/$lang" params={{ lang }} activeOptions={{ exact: true }} activeProps={active} className={nav}>{t("home")}</Link>
            <Link to="/$lang/fleet" params={{ lang }} activeProps={active} className={nav}>{t("cars")}</Link>
            <Link to="/$lang/how-it-works" params={{ lang }} activeProps={active} className={nav}>{t("howItWorks")}</Link>
            <Link to="/$lang/blog" params={{ lang }} activeProps={active} className={nav}>{t("blog")}</Link>
            <Link to="/$lang/locations" params={{ lang }} activeProps={active} className={nav}>{t("ourSites")}</Link>
            <Link to="/$lang/programs" params={{ lang }} activeProps={active} className={nav}>{t("ourPrograms")}</Link>
            <Link to="/$lang/contact" params={{ lang }} activeProps={active} className={nav}>{t("contactUs")}</Link>
          </nav>
          <div className="flex items-center gap-2">
            <LangSwitch lang={lang} />
            {user ? (
              <Link to="/$lang/app" params={{ lang }} className="btn-primary">{t("openApp")}</Link>
            ) : (
              <>
                <Link to="/$lang/auth" params={{ lang }} className="btn-ghost hidden sm:inline-flex">{t("signIn")}</Link>
                <Link to="/$lang/book" params={{ lang }} search={{ car: undefined }} className="btn-primary hidden sm:inline-flex"><CalendarDays className="h-4 w-4" />{t("bookNow")}</Link>
              </>
            )}
          </div>
        </div>
      </header>
      {children}
      <footer className="bg-sidebar py-10 text-sidebar-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4">
          <div><BrandLogo lang={lang} /><div className="mt-1 text-sm opacity-70">{t("appTag")}</div></div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> <span dir="ltr">07 04 72 02 74</span></div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> lmodirv@gmail.com</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Tanger, Maroc</div>
          </div>
          <div className="text-sm opacity-60">© 2026 HN RentCar</div>
        </div>
      </footer>
    </div>
  );
}
