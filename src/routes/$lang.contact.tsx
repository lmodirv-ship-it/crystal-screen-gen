import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Car, Headphones, MapPin, Search, ShieldCheck, Tag, Users, ClipboardCheck, KeyRound, Phone, Mail, MessageCircle } from "lucide-react";
import hero from "@/assets/hero-tangier.jpg";
import { isLang, translator } from "@/lib/i18n";
import { useRows } from "@/lib/data";
import { carImage, CATEGORIES } from "@/lib/car-images";
import { Badge } from "@/components/kit";
import { PublicShell } from "@/components/PublicShell";

export const Route = createFileRoute("/$lang/contact")({
  head: () => ({
    meta: [
      { title: "Contact — HN RentCar Tanger" },
      { name: "description", content: "Call, WhatsApp or visit HN RentCar in Tangier for your car rental." },
      { property: "og:title", content: "Contact — HN RentCar Tanger" },
      { property: "og:description", content: "Call, WhatsApp or visit HN RentCar in Tangier for your car rental." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { lang } = Route.useParams();
  const l = isLang(lang) ? lang : "ar";
  const t = translator(l);
  const items = [
    [Phone, "07 04 72 02 74", "tel:+212704720274"],
    [MessageCircle, "WhatsApp 06 68 54 63 58", "https://wa.me/212668546358"],
    [Mail, "lmodirv@gmail.com", "mailto:lmodirv@gmail.com"],
    [MapPin, "1 Comp Duodet Imm D, RDJ Ma 30, Tanja balia - Tanger", "https://maps.google.com/?q=Tanger"],
  ] as const;
  return (
    <PublicShell lang={l}>
      <section className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="mb-8 text-center font-display text-4xl font-black">{t("contactUs")}</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map(([Icon, label, href]) => (
            <a key={href} href={href} target="_blank" rel="noreferrer" className="card flex items-center gap-4 p-5 hover:border-primary">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"><Icon className="h-5 w-5" /></span>
              <span className="font-bold" dir="ltr">{label}</span>
            </a>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
