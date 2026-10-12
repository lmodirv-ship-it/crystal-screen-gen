import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, CalendarRange, Star } from "lucide-react";
import { isLang, translator } from "@/lib/i18n";
import { InfoPage } from "@/components/InfoPage";

export const Route = createFileRoute("/$lang/programs")({
  head: () => ({
    meta: [
      { title: "Our programs — HN RentCar Tanger" },
      { name: "description", content: "Business rental, long-term rental and loyalty programs at HN RentCar." },
      { property: "og:title", content: "Our programs — HN RentCar Tanger" },
      { property: "og:description", content: "Business rental, long-term rental and loyalty programs at HN RentCar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Programs,
});

function Programs() {
  const { lang } = Route.useParams();
  const l = isLang(lang) ? lang : "ar";
  return (
    <InfoPage lang={l} title={translator(l)("ourPrograms")}
      intro={["Rental formulas for every need.", "Des formules de location pour chaque besoin.", "صيغ كراء تناسب كل الاحتياجات."]}
      items={[
        { icon: Briefcase, title: ["Business rental", "Location entreprises", "كراء للشركات"], body: ["Cars for your teams with monthly invoicing.", "Des véhicules pour vos équipes avec facturation mensuelle.", "سيارات لفرق عملك مع فوترة شهرية."] },
        { icon: CalendarRange, title: ["Long-term rental", "Location longue durée", "كراء طويل المدى"], body: ["Lower prices for one month or more.", "Tarifs réduits à partir d'un mois.", "أسعار مخفضة ابتداءً من شهر."] },
        { icon: Star, title: ["Loyalty program", "Programme fidélité", "برنامج الوفاء"], body: ["Discounts for returning customers.", "Remises pour les clients fidèles.", "تخفيضات للزبناء الأوفياء."] },
      ]} />
  );
}
