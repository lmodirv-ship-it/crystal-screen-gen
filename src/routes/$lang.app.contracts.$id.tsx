import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Printer, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/data";
import { remaining } from "@/lib/finance";
import { useLang } from "@/components/kit";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/$lang/app/contracts/$id")({
  validateSearch: (s: Record<string, unknown>) => ({ doc: s["doc"] === "invoice" ? ("invoice" as const) : ("contract" as const) }),
  component: PrintDoc,
});

function PrintDoc() {
  const { id } = Route.useParams();
  const { doc } = Route.useSearch();
  const { t, lang } = useLang();
  const cur = t("currency");
  const { data: c, isLoading } = useQuery({
    queryKey: ["contract-print", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("contracts")
        .select("*, customers(full_name, phone, email, city, license_no, license_expiry), cars(model, plate, year, fuel, category), payments(amount, paid_at, method), agencies(name, city, phone, email, address)")
        .eq("id", id).single();
      if (error) throw error;
      return data as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  });
  if (isLoading || !c) return <div className="p-8 text-muted-foreground">{t("loading")}</div>;
  const ag = c.agencies ?? { name: "HN RentCar" };
  const paid = Number(c.total) - remaining(c.total, c.payments ?? []);
  const nDays = Math.max(1, Math.round((new Date(c.end_date).getTime() - new Date(c.start_date).getTime()) / 86400000));
  const row = (k: string, v: React.ReactNode) => <div className="flex justify-between gap-4 border-b border-dashed border-border py-1"><span className="text-muted-foreground">{k}</span><b>{v ?? "—"}</b></div>;

  return (
    <div>
      <div className="no-print mb-4 flex flex-wrap gap-2">
        <Link to="/$lang/app/contracts" params={{ lang }} className="btn-ghost"><ArrowLeft className="h-4 w-4" />{t("contracts")}</Link>
        <Link to="/$lang/app/contracts/$id" params={{ lang, id }} search={{ doc: "contract" }} className={doc === "contract" ? "btn-primary" : "btn-ghost"}>{t("printContract")}</Link>
        <Link to="/$lang/app/contracts/$id" params={{ lang, id }} search={{ doc: "invoice" }} className={doc === "invoice" ? "btn-primary" : "btn-ghost"}>{t("invoice")}</Link>
        <button className="btn-primary" onClick={() => window.print()}><Printer className="h-4 w-4" />{t("print")}</button>
      </div>
      <article className="print-sheet mx-auto max-w-[210mm] rounded-xl bg-card p-8 text-sm shadow-card">
        <header className="mb-6 flex items-start justify-between border-b border-border pb-4">
          <div><BrandLogo lang={lang} /><div className="mt-2 text-xs text-muted-foreground">{ag.name} · {ag.address ?? ""} {ag.city ?? ""}<br /><span dir="ltr">{ag.phone ?? ""}</span> {ag.email ?? ""}</div></div>
          <div className="text-end"><div className="font-display text-2xl font-black">{doc === "invoice" ? t("invoice") : t("contracts")}</div><div className="font-bold">#{c.ref}</div><div className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</div></div>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          <section><h3 className="mb-2 font-extrabold">{t("renter")}</h3>
            {row(t("fullName"), c.customers?.full_name)}{row(t("phone"), <span dir="ltr">{c.customers?.phone}</span>)}{row(t("city"), c.customers?.city)}{row(t("license_no"), c.customers?.license_no)}{row(t("license_expiry"), c.customers?.license_expiry)}
          </section>
          <section><h3 className="mb-2 font-extrabold">{t("vehicle")}</h3>
            {row(t("car"), c.cars?.model)}{row(t("plate"), <span dir="ltr">{c.cars?.plate}</span>)}{row(t("year"), c.cars?.year)}{row(t("fuel"), t(c.cars?.fuel ?? ""))}{row("Km", c.mileage_out)}
          </section>
        </div>
        <section className="mt-6"><h3 className="mb-2 font-extrabold">{doc === "invoice" ? t("invoice") : t("contracts")}</h3>
          {row(t("from"), c.start_date)}{row(t("to"), c.end_date)}{row(t("days"), nDays)}{row(t("perDay"), money(c.daily_rate, cur))}
          {row(t("total"), money(c.total, cur))}{row(t("deposit"), money(c.deposit, cur))}{row(t("paid"), money(paid, cur))}{row(t("remaining"), money(Number(c.total) - paid, cur))}
        </section>
        {doc === "invoice" ? (
          <section className="mt-6"><h3 className="mb-2 font-extrabold">{t("payments")}</h3>
            {(c.payments ?? []).length === 0 ? <div className="text-muted-foreground">—</div> : (c.payments as { amount: number; paid_at: string; method: string }[]).map((p, i) => row(`${p.paid_at} · ${t(p.method)}`, money(p.amount, cur)))}
          </section>
        ) : (
          <>
            <p className="mt-6 rounded-lg border border-border p-3 text-xs leading-relaxed">{t("terms")}</p>
            <div className="mt-10 grid grid-cols-2 gap-10 text-center">
              <div><div className="h-20 border-b border-border" />{t("signature")} — {t("renter")}</div>
              <div><div className="h-20 border-b border-border" />{t("signature")} — {ag.name}</div>
            </div>
          </>
        )}
      </article>
    </div>
  );
}
