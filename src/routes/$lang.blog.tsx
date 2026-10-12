import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, ShieldCheck, Fuel, MapPin } from "lucide-react";
import { isLang, translator } from "@/lib/i18n";
import { InfoPage } from "@/components/InfoPage";

export const Route = createFileRoute("/$lang/blog")({
  head: () => ({
    meta: [
      { title: "Blog — HN RentCar Tanger" },
      { name: "description", content: "Car rental tips, insurance advice and travel guides in Morocco." },
      { property: "og:title", content: "Blog — HN RentCar Tanger" },
      { property: "og:description", content: "Car rental tips, insurance advice and travel guides in Morocco." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Blog,
});

function Blog() {
  const { lang } = Route.useParams();
  const l = isLang(lang) ? lang : "ar";
  return (
    <InfoPage lang={l} title={translator(l)("blog")}
      intro={["Tips and guides for a smooth rental.", "Conseils et guides pour une location sereine.", "نصائح وأدلة لكراء سيارة بكل راحة."]}
      items={[
        { icon: BookOpen, title: ["Renting your first car", "Louer sa première voiture", "كراء سيارتك الأولى"], body: ["Documents you need and how the booking works.", "Les documents nécessaires et le déroulé de la réservation.", "الوثائق المطلوبة وكيف يتم الحجز خطوة بخطوة."] },
        { icon: ShieldCheck, title: ["Understanding insurance", "Comprendre l'assurance", "فهم التأمين"], body: ["What is covered and what the deposit is for.", "Ce qui est couvert et le rôle de la caution.", "ما يغطيه التأمين ودور مبلغ الضمان."] },
        { icon: Fuel, title: ["Fuel and mileage", "Carburant et kilométrage", "الوقود والمسافة"], body: ["Return the car with the same fuel level.", "Rendez la voiture avec le même niveau de carburant.", "أرجع السيارة بنفس مستوى الوقود."] },
        { icon: MapPin, title: ["Road trips from Tangier", "Escapades depuis Tanger", "رحلات انطلاقاً من طنجة"], body: ["Chefchaouen, Tetouan, Asilah and more.", "Chefchaouen, Tétouan, Asilah et plus.", "شفشاون، تطوان، أصيلة وغيرها."] },
      ]} />
  );
}
