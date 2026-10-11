import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Car, Headphones, MapPin, Search, ShieldCheck, Tag, Users, ClipboardCheck, KeyRound, Phone, Mail, MessageCircle } from "lucide-react";
import hero from "@/assets/hero-tangier.jpg";
import { isLang, translator } from "@/lib/i18n";
import { useRows } from "@/lib/data";
import { carImage, CATEGORIES } from "@/lib/car-images";
import { Badge } from "@/components/kit";
import { PublicShell } from "@/components/PublicShell";

export const Route = createFileRoute("/$lang/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — HN RentCar" },
      { name: "description", content: "Book a rental car in four simple steps: choose, request, send documents, get your keys." },
      { property: "og:title", content: "How it works — HN RentCar" },
      { property: "og:description", content: "Book a rental car in four simple steps: choose, request, send documents, get your keys." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: How,
});

function How() {
  const { lang } = Route.useParams();
  const l = isLang(lang) ? lang : "ar";
  const t = translator(l);
  return (
    <PublicShell lang={l}>
      <section id="how" className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="mb-8 text-center font-display text-4xl font-black">{t("howItWorks")}</h1>
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
      <div className="pb-16 text-center"><Link to="/$lang/book" params={{ lang: l }} search={{ car: undefined }} className="btn-primary"><CalendarDays className="h-4 w-4" />{t("bookNow")}</Link></div>
    </PublicShell>
  );
}
