import { createFileRoute } from "@tanstack/react-router";
import { Building2, Plane, Train } from "lucide-react";
import { isLang, translator } from "@/lib/i18n";
import { InfoPage } from "@/components/InfoPage";

export const Route = createFileRoute("/$lang/locations")({
  head: () => ({
    meta: [
      { title: "Our locations — HN RentCar Tanger" },
      { name: "description", content: "Where to pick up and return your HN RentCar rental in Tangier." },
      { property: "og:title", content: "Our locations — HN RentCar Tanger" },
      { property: "og:description", content: "Where to pick up and return your HN RentCar rental in Tangier." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Locations,
});

function Locations() {
  const { lang } = Route.useParams();
  const l = isLang(lang) ? lang : "ar";
  return (
    <InfoPage lang={l} title={translator(l)("ourSites")}
      intro={["Pick up and return your car where it suits you.", "Récupérez et rendez votre voiture là où cela vous convient.", "استلم سيارتك وأرجعها في المكان الذي يناسبك."]}
      items={[
        { icon: Building2, meta: "07 04 72 02 74", title: ["Main agency — Tangier", "Agence principale — Tanger", "الوكالة الرئيسية — طنجة"], body: ["1 Comp Duodet Imm D, RDJ Ma 30, Tanja balia.", "1 Comp Duodet Imm D, RDJ Ma 30, Tanja balia.", "1 Comp Duodet Imm D, RDJ Ma 30، طنجة البالية."] },
        { icon: Plane, title: ["Tangier Ibn Battuta Airport", "Aéroport Ibn Battouta", "مطار ابن بطوطة"], body: ["Delivery on request at arrivals.", "Livraison sur demande aux arrivées.", "تسليم السيارة عند الطلب في قاعة الوصول."] },
        { icon: Train, title: ["Tangier Ville station", "Gare Tanger Ville", "محطة طنجة المدينة"], body: ["Delivery on request.", "Livraison sur demande.", "تسليم السيارة عند الطلب."] },
      ]} />
  );
}
