import type { ReactNode } from "react";
import { BrandLogo } from "@/components/BrandLogo";

type Value = string | number | null | undefined;
export type RentalAgreementData = {
  ref: Value; startDate: string; endDate: string; dailyRate: string; total: string;
  deposit: string; paid?: string; rest?: string; mileage?: Value; mileageIn?: Value;
  renter: { name?: Value; phone?: Value; address?: Value; license?: Value; licenseDate?: Value; identity?: Value };
  car: { model?: Value; plate?: Value };
  agency: { name: string; address?: Value; city?: Value; phone?: Value; email?: Value; patente?: Value; rc?: Value; fiscal_id?: Value; ice?: Value };
};

function Field({ fr, ar, value }: { fr: string; ar: string; value?: ReactNode }) {
  return <div className="agreement-field"><div className="agreement-label"><span>{fr}</span><span lang="ar" dir="rtl">{ar}</span></div><div className="agreement-value">{value ?? "\u00a0"}</div></div>;
}
function Heading({ fr, ar }: { fr: string; ar: string }) {
  return <h2 className="agreement-heading"><span>{fr}</span><span lang="ar" dir="rtl">{ar}</span></h2>;
}
function VehicleDiagram({ label }: { label: string }) {
  return <svg className="agreement-car" viewBox="0 0 100 170" role="img" aria-label={label} fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="23" y="13" width="54" height="144" rx="18" />
    <path d="M30 45 Q50 35 70 45 L68 65 Q50 58 32 65 Z M32 108 Q50 115 68 108 L70 130 Q50 138 30 130 Z" />
    <rect x="33" y="70" width="34" height="34" rx="6" />
    <path d="M27 65 L27 108 M73 65 L73 108 M35 20 L65 20 M35 150 L65 150" />
    <rect x="14" y="35" width="7" height="25" rx="3" /><rect x="79" y="35" width="7" height="25" rx="3" />
    <rect x="14" y="112" width="7" height="25" rx="3" /><rect x="79" y="112" width="7" height="25" rx="3" />
    <path d="M45 7 L50 2 L55 7" /><text x="50" y="168" textAnchor="middle" stroke="none" fill="currentColor" fontSize="8">AR</text>
  </svg>;
}
function Condition({ returning = false, mileage }: { returning?: boolean; mileage?: Value }) {
  return <section className="agreement-condition">
    <Heading fr={returning ? "Retour" : "Départ"} ar={returning ? "الإرجاع" : "التسليم"} />
    <div className="agreement-condition-body"><VehicleDiagram label={returning ? "État du véhicule au retour" : "État du véhicule au départ"} /><div>
      <strong>VÉHICULE EN PARFAIT ÉTAT</strong><div lang="ar" dir="rtl">السيارة في حالة جيدة</div>
      <div className="agreement-checks"><span>□ Oui / نعم</span><span>□ Non / لا</span></div>
      <Field fr="Kilométrage" ar="عداد الكيلومترات" value={mileage} />
      <Field fr="Commentaires" ar="ملاحظات" /><div className="agreement-writing" /><div className="agreement-writing" />
      <div className="agreement-signature">Signature client / توقيع الزبون</div>
    </div></div>
  </section>;
}

export function RentalAgreement({ data: d, lang, terms }: { data: RentalAgreementData; lang: "en" | "fr" | "ar"; terms: string }) {
  const days = Math.max(1, Math.round((new Date(d.endDate).getTime() - new Date(d.startDate).getTime()) / 86400000));
  return <article className="print-sheet rental-agreement" dir="ltr" aria-label="Contrat de location / عقد كراء السيارات">
    <header className="agreement-header">
      <div><strong className="agreement-agency">{d.agency.name}</strong><div>{[d.agency.address, d.agency.city].filter(Boolean).join(" · ")}</div><div>{d.agency.phone}</div><div>{d.agency.email}</div></div>
      <BrandLogo lang={lang} size={60} withText={false} />
      <div className="agreement-reference"><strong>CONTRAT DE LOCATION</strong><strong lang="ar" dir="rtl">عقد كراء السيارات</strong><span>N° {d.ref}</span>
        {d.agency.patente && <span>Patente : {d.agency.patente}</span>}{d.agency.rc && <span>RC : {d.agency.rc}</span>}
        {d.agency.fiscal_id && <span>IF : {d.agency.fiscal_id}</span>}{d.agency.ice && <span>ICE : {d.agency.ice}</span>}
      </div>
    </header>
    <div className="agreement-title"><span>CONTRAT DE LOCATION</span><span lang="ar" dir="rtl">عقد كراء السيارات</span></div>
    <div className="agreement-columns">
      <div className="agreement-left">
        <section className="agreement-section"><Heading fr="Véhicule" ar="السيارة" />
          <Field fr="N° d’immatriculation" ar="رقم التسجيل" value={d.car.plate} /><Field fr="Marque / Modèle" ar="نوع السيارة" value={d.car.model} />
          <Field fr="Lieu de livraison" ar="مكان التسليم" value={d.agency.city} /><Field fr="Lieu de reprise" ar="مكان الإرجاع" />
        </section>
        <section className="agreement-section"><Heading fr="Locataire" ar="المكتري" />
          <Field fr="Nom et prénom" ar="الاسم العائلي والشخصي" value={d.renter.name} /><Field fr="Adresse au Maroc" ar="العنوان بالمغرب" value={d.renter.address} />
          <Field fr="Nationalité" ar="الجنسية" /><Field fr="Permis de conduire N°" ar="رقم رخصة السياقة" value={d.renter.license} />
          <Field fr="Délivré le" ar="تاريخ إصدار الرخصة" value={d.renter.licenseDate} /><Field fr="C.I.N. / Passeport N°" ar="رقم البطاقة الوطنية / جواز السفر" value={d.renter.identity} />
          <Field fr="Adresse à l’étranger" ar="العنوان بالخارج" /><Field fr="Tél." ar="الهاتف" value={d.renter.phone} />
        </section>
        <section className="agreement-section"><Heading fr="2ème conducteur" ar="السائق الثاني" />
          <Field fr="Nom et prénom" ar="الاسم العائلي والشخصي" /><Field fr="Adresse au Maroc" ar="العنوان بالمغرب" />
          <Field fr="Permis de conduire N°" ar="رقم رخصة السياقة" /><Field fr="C.I.N. N°" ar="رقم البطاقة الوطنية" /><Field fr="Tél." ar="الهاتف" />
        </section>
      </div>
      <div className="agreement-right">
        <section className="agreement-section"><Heading fr="Durée de location" ar="مدة الكراء" />
          <Field fr="Date de départ" ar="تاريخ التسليم" value={d.startDate} /><Field fr="Heure de départ" ar="ساعة التسليم" />
          <Field fr="Date de retour" ar="تاريخ الإرجاع" value={d.endDate} /><Field fr="Heure de retour" ar="ساعة الإرجاع" />
          <Field fr="Durée (jours)" ar="المدة بالأيام" value={days} /><Field fr="Prolongation" ar="تمديد الكراء" />
        </section>
        <section className="agreement-section"><Heading fr="Montants" ar="المبالغ" />
          <Field fr="Prix de location / jour" ar="ثمن الكراء في اليوم" value={d.dailyRate} /><Field fr="Montant payé" ar="المبلغ المؤدى" value={d.paid} />
          <Field fr="Le reste" ar="المبلغ المتبقي" value={d.rest} /><Field fr="Total" ar="المجموع" value={d.total} />
          <Field fr="Montant de prolongation" ar="مبلغ تمديد الكراء" /><Field fr="Total après prolongation" ar="المجموع بعد التمديد" />
        </section>
        <section className="agreement-section agreement-return-sign"><Heading fr="Signature au retour" ar="توقيع الزبون عند الإرجاع" /><Field fr="Date et heure" ar="التاريخ والساعة" /><div className="agreement-sign-space" /></section>
        <section className="agreement-section"><Heading fr="Paiement" ar="الأداء" /><div className="agreement-checks"><span>□ Espèces / نقداً</span><span>□ Chèque / شيك</span><span>□ Virement / تحويل</span></div><Field fr="Caution" ar="الضمان" value={d.deposit} /></section>
      </div>
    </div>
    <div className="agreement-inspection"><Condition mileage={d.mileage} /><section className="agreement-damage"><Heading fr="Dommages" ar="الأضرار" /><div>À identifier sur le véhicule</div><div lang="ar" dir="rtl">تحديد مكان الضرر على الرسم</div><p>／ Éraflure / خدش</p><p>× Bosse / انبعاج</p><p>□ Manque / نقص</p><Field fr="Nombre" ar="العدد" /><div className="agreement-signature">Paraphe client<br />توقيع الزبون</div></section><Condition returning mileage={d.mileageIn} /></div>
    <p className="agreement-terms" dir={lang === "ar" ? "rtl" : "ltr"}>{terms}</p>
    <div className="agreement-final-signatures"><div>Signature du locataire / توقيع المكتري<div className="agreement-sign-space" /></div><div>Signature et cachet de l’agence / توقيع وختم الوكالة<div className="agreement-sign-space" /></div></div>
    <div className="agreement-credit">Groupe-HN · Mouylay Ismail El Hassani</div>
  </article>;
}