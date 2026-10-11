/** Builds a wa.me link; Moroccan local numbers (06/07…) become 212… */
export function waNumber(phone: string | null | undefined) {
  let d = (phone ?? "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "212" + d.slice(1);
  return d;
}
export const waLink = (phone: string | null | undefined, text: string) => `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text)}`;

type C = { ref: number | string; name: string; car: string; from: string; to: string; total: number; rest: number; cur: string };
export const WA_TEMPLATES = {
  confirm: (c: C) => `مرحباً ${c.name} 👋\nتم تأكيد حجزك لدى HN RentCar ✅\nالسيارة: ${c.car}\nمن ${c.from} إلى ${c.to}\nالمبلغ: ${c.total} ${c.cur}\n\nBonjour ${c.name}, votre réservation est confirmée. Contrat #${c.ref}.`,
  contract: (c: C) => `HN RentCar — عقد رقم #${c.ref}\n${c.car}\n${c.from} → ${c.to}\nالمجموع: ${c.total} ${c.cur} | الباقي: ${c.rest} ${c.cur}\nشكراً لثقتكم 🙏`,
  returnReminder: (c: C) => `تذكير 🔔 ${c.name}، موعد إرجاع السيارة ${c.car} هو ${c.to}.\nRappel : retour du véhicule prévu le ${c.to}. Merci !`,
  payReminder: (c: C) => `تذكير بالأداء 💳 ${c.name}، المبلغ المتبقي للعقد #${c.ref} هو ${c.rest} ${c.cur}.\nRappel : reste à payer ${c.rest} ${c.cur}.`,
};
export type WaKind = keyof typeof WA_TEMPLATES;
