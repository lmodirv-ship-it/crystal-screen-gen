import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Car, Headphones, MapPin, Search, ShieldCheck, Tag, Users, ClipboardCheck, KeyRound, Phone, Mail, MessageCircle } from "lucide-react";
import hero from "@/assets/hero-tangier.jpg";
import { isLang, translator } from "@/lib/i18n";
import { useRows } from "@/lib/data";
import { carImage, CATEGORIES } from "@/lib/car-images";
import { Badge } from "@/components/kit";
import { PublicShell } from "@/components/PublicShell";

export const Route = createFileRoute("/$lang/fleet")({
  head: () => ({
    meta: [
      { title: "Our cars — HN RentCar Tanger" },
      { name: "description", content: "Browse available rental cars in Tangier with daily prices and book online." },
      { property: "og:title", content: "Our cars — HN RentCar Tanger" },
      { property: "og:description", content: "Browse available rental cars in Tangier with daily prices and book online." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Fleet,
});

function Fleet() {
  const { lang } = Route.useParams();
  const l = isLang(lang) ? lang : "ar";
  const t = translator(l);
  const { data: cars = [] } = useRows("cars", "*", "price_per_day");
  const avail = cars.filter((c) => c.status === "available");
  return (
    <PublicShell lang={l}>
      <section className="mx-auto max-w-7xl px-4 pt-12">
        <h1 className="text-center font-display text-4xl font-black">{t("ourCars")}</h1>
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
                  <Link to="/$lang/book" params={{ lang: l }} search={{ car: c.id }} className="btn-primary">{t("bookNow")}</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
