import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Car, Headphones, MapPin, Search, ShieldCheck, Tag, Users, ClipboardCheck, KeyRound, Phone, Mail } from "lucide-react";
import hero from "@/assets/hero-tangier.jpg";
import { isLang, translator } from "@/lib/i18n";
import { LangSwitch } from "@/components/LangSwitch";
import { useRows } from "@/lib/data";
import { carImage, CATEGORIES } from "@/lib/car-images";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/kit";

export const Route = createFileRoute("/$lang/")({
  head: () => ({
    meta: [
      { title: "HN RentCar — كراء السيارات في المغرب | Location de voitures" },
      { name: "description", content: "HN RentCar: modern, safe rental cars at the best prices in Morocco. Book online in Arabic, French or English." },
      { property: "og:title", content: "HN RentCar — Car rental in Morocco" },
      { property: "og:description", content: "Modern, safe rental cars at the best prices. Book online in minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Logo() {
  return (
    <div className="leading-none">
      <div className="font-display text-2xl font-black">HN <span className="text-primary">RentCar</span></div>
    </div>
  );
}

function Home() {
  const { lang } = Route.useParams();
  const l = isLang(lang) ? lang : "ar";
  const t = translator(l);
  const { user } = useAuth();
  const { data: cars = [] } = useRows("cars", "*", "price_per_day");
  const avail = cars.filter((c) => c.status === "available").slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Logo />
          <nav className="hidden gap-6 text-sm font-bold md:flex">
            <a href="#top" className="text-primary">{t("home")}</a>
            <a href="#fleet">{t("cars")}</a>
            <a href="#how">{t("howItWorks")}</a>
            <a href="#contact">{t("contactUs")}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LangSwitch lang={l} />
            {user ? (
              <Link to="/$lang/app" params={{ lang: l }} className="btn-primary">{t("openApp")}</Link>
            ) : (
              <>
                <Link to="/$lang/auth" params={{ lang: l }} className="btn-ghost hidden sm:inline-flex">{t("signIn")}</Link>
                <Link to="/$lang/app/$module" params={{ lang: l, module: "bookings" }} className="btn-primary"><CalendarDays className="h-4 w-4" />{t("bookNow")}</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section id="top" className="relative">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" width={1600} height={800} />
        <div className={`absolute inset-0 ${l === "ar" ? "hero-overlay-rtl" : "hero-overlay"}`} />
        <div className="relative mx-auto max-w-7xl px-4 pb-32 pt-16 md:pt-24">
          <h1 className="max-w-xl font-display text-4xl font-black leading-tight md:text-6xl">
            {t("heroTitle")}<br />{t("heroWith")} <span className="text-primary">HN RentCar</span>
          </h1>
          <p className="mt-4 max-w-md text-lg font-semibold text-muted-foreground">{t("heroSub")}</p>
          <div className="mt-6 flex flex-wrap gap-5 text-sm font-bold">
            {[[ShieldCheck, "safeCars"], [Tag, "fairPrices"], [Headphones, "support247"]].map(([I, k]) => {
              const Icon = I as typeof ShieldCheck;
              return <span key={k as string} className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"><Icon className="h-4 w-4" /></span>{t(k as string)}</span>;
            })}
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-16 max-w-6xl px-4">
        <div className="card grid gap-3 p-4 md:grid-cols-5">
          <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"><MapPin className="h-5 w-5 text-primary" /><div className="text-xs"><div className="font-bold">{t("pickupPlace")}</div><select className="bg-transparent text-sm"><option>Tanger</option><option>Casablanca</option><option>Rabat</option><option>Marrakech</option></select></div></label>
          <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"><CalendarDays className="h-5 w-5 text-primary" /><div className="text-xs"><div className="font-bold">{t("pickupDate")}</div><input type="date" className="bg-transparent text-sm" /></div></label>
          <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"><CalendarDays className="h-5 w-5 text-primary" /><div className="text-xs"><div className="font-bold">{t("returnDate")}</div><input type="date" className="bg-transparent text-sm" /></div></label>
          <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"><Car className="h-5 w-5 text-primary" /><div className="text-xs"><div className="font-bold">{t("carType")}</div><select className="bg-transparent text-sm"><option>{t("all")}</option>{CATEGORIES.map((c) => <option key={c}>{t(c)}</option>)}</select></div></label>
          <a href="#fleet" className="btn-primary text-base"><Search className="h-5 w-5" />{t("searchCars")}</a>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="mb-6 text-center font-display text-3xl font-black">{t("ourCars")}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {CATEGORIES.map((c) => (
            <div key={c} className="card p-4 text-center">
              <img src={carImage(c)} alt={t(c)} loading="lazy" width={992} height={672} className="mx-auto h-24 object-contain" />
              <div className="mt-2 font-display font-extrabold">{t(c)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-accent/60 py-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
          {[[Car, `+${cars.length || 8}`, "carsAvailable"], [Users, "+5,000", "happyCustomers"], [ShieldCheck, "100%", "safeCars"], [Headphones, "24/7", "support247"]].map(([I, v, k]) => {
            const Icon = I as typeof Car;
            return (
              <div key={k as string} className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-card text-primary shadow"><Icon className="h-6 w-6" /></span>
                <div><div className="font-display text-2xl font-black">{v as string}</div><div className="text-sm text-muted-foreground">{t(k as string)}</div></div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="fleet" className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {avail.map((c) => (
            <div key={c.id} className="card overflow-hidden">
              <div className="relative bg-muted/60 p-4">
                <span className="absolute start-3 top-3"><Badge value={c.status} /></span>
                <img src={carImage(c.category)} alt={c.model} loading="lazy" width={992} height={672} className="mx-auto h-40 object-contain" />
              </div>
              <div className="p-5">
                <div className="font-display text-lg font-extrabold">{c.model}</div>
                <div className="mt-1 flex gap-3 text-xs text-muted-foreground"><span>{c.year}</span><span>{t(c.fuel)}</span><span>{t(c.transmission)}</span></div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="font-display text-xl font-black text-primary">{c.price_per_day} <span className="text-sm">{t("perDay")}</span></div>
                  <Link to="/$lang/app/$module" params={{ lang: l, module: "bookings" }} className="btn-primary">{t("bookNow")}</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-4 pb-16">
        <h2 className="mb-8 text-center font-display text-3xl font-black">{t("howItWorks")}</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[[Search, "step1"], [CalendarDays, "step2"], [ClipboardCheck, "step3"], [KeyRound, "step4"]].map(([I, k], i) => {
            const Icon = I as typeof Search;
            return (
              <div key={k as string} className="card p-6 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground"><Icon className="h-6 w-6" /></span>
                <div className="mt-3 font-display text-2xl font-black text-primary">{i + 1}</div>
                <div className="font-bold">{t(k as string)}</div>
              </div>
            );
          })}
        </div>
      </section>

      <footer id="contact" className="bg-sidebar py-10 text-sidebar-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4">
          <div><div className="font-display text-2xl font-black">HN <span className="text-primary">RentCar</span></div><div className="text-sm opacity-70">{t("appTag")}</div></div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> <span dir="ltr">+212 6 12 34 56 78</span></div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> contact@hn-rentcar.com</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Tanger, Maroc</div>
          </div>
          <div className="text-sm opacity-60">© 2026 HN RentCar</div>
        </div>
      </footer>
    </div>
  );
}
