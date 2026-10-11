import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { FilePlus2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { canWrite } from "@/lib/rbac";
import { useAuth } from "@/lib/auth";
import { useRows, money, today } from "@/lib/data";
import { rentalTotal } from "@/lib/finance";
import { carImage } from "@/lib/car-images";
import { Field, NoAccess, PageHead, Panel, useLang } from "@/components/kit";

export const Route = createFileRoute("/$lang/app/contracts/new")({
  validateSearch: (s: Record<string, unknown>): { booking?: string | undefined } => ({ booking: typeof s["booking"] === "string" ? s["booking"] : undefined }),
  component: NewContract,
});

function NewContract() {
  const { t, lang } = useLang();
  const { role } = useAuth();
  const { booking } = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: customers = [] } = useRows("customers");
  const { data: cars = [] } = useRows("cars");
  const { data: bookings = [] } = useRows("bookings");
  const [v, setV] = useState({ customer_id: "", car_id: "", start_date: today(), end_date: today(), daily_rate: 0, deposit: 3000, mileage_out: 0, notes: "", initial: 0 });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof v, val: string | number) => setV((p) => ({ ...p, [k]: val }));

  useEffect(() => {
    const b = bookings.find((x) => x.id === booking);
    if (b) setV((p) => ({ ...p, customer_id: b.customer_id, car_id: b.car_id, start_date: b.start_date, end_date: b.end_date }));
  }, [booking, bookings]);
  const car = cars.find((c) => c.id === v.car_id);
  useEffect(() => {
    if (car) setV((p) => ({ ...p, daily_rate: Number(car.price_per_day), mileage_out: car.mileage }));
  }, [car?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!role || !canWrite(role, "contracts")) return <NoAccess />;
  const { days, total } = rentalTotal(v.start_date, v.end_date, Number(v.daily_rate));
  const cur = t("currency");
  const canPay = canWrite(role, "payments");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data: c, error } = await supabase.from("contracts").insert({
      customer_id: v.customer_id, car_id: v.car_id, booking_id: booking ?? null, start_date: v.start_date, end_date: v.end_date,
      daily_rate: Number(v.daily_rate), total, deposit: Number(v.deposit), mileage_out: Number(v.mileage_out), notes: v.notes || null,
    }).select().single();
    if (error || !c) { toast.error(error?.message ?? t("error")); setBusy(false); return; }
    await supabase.from("cars").update({ status: "rented" }).eq("id", v.car_id);
    if (booking) await supabase.from("bookings").update({ status: "confirmed" }).eq("id", booking);
    if (canPay && Number(v.initial) > 0) await supabase.from("payments").insert({ contract_id: c.id, customer_id: v.customer_id, amount: Number(v.initial), method: "cash" });
    await qc.invalidateQueries();
    toast.success(t("saved"));
    navigate({ to: "/$lang/app/contracts", params: { lang } });
  };

  return (
    <form onSubmit={submit}>
      <PageHead title={t("newContract")} icon={<FilePlus2 className="h-6 w-6" />} />
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title={t("details")} className="xl:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("customer")}>
              <select className="input" required value={v.customer_id} onChange={(e) => set("customer_id", e.target.value)}>
                <option value="">—</option>{customers.filter((c) => c.status !== "blocked").map((c) => <option key={c.id} value={c.id}>{c.full_name} · {c.phone}</option>)}
              </select>
            </Field>
            <Field label={t("car")}>
              <select className="input" required value={v.car_id} onChange={(e) => set("car_id", e.target.value)}>
                <option value="">—</option>{cars.filter((c) => c.status === "available" || c.id === v.car_id).map((c) => <option key={c.id} value={c.id}>{c.model} · {c.plate}</option>)}
              </select>
            </Field>
            <Field label={t("from")}><input className="input" type="date" required value={v.start_date} onChange={(e) => set("start_date", e.target.value)} /></Field>
            <Field label={t("to")}><input className="input" type="date" required min={v.start_date} value={v.end_date} onChange={(e) => set("end_date", e.target.value)} /></Field>
            <Field label={t("daily_rate")}><input className="input" type="number" min={0} value={v.daily_rate} onChange={(e) => set("daily_rate", e.target.value)} /></Field>
            <Field label={t("deposit")}><input className="input" type="number" min={0} value={v.deposit} onChange={(e) => set("deposit", e.target.value)} /></Field>
            <Field label={t("mileage")}><input className="input" type="number" min={0} value={v.mileage_out} onChange={(e) => set("mileage_out", e.target.value)} /></Field>
            {canPay && <Field label={t("initialPayment")}><input className="input" type="number" min={0} max={total} value={v.initial} onChange={(e) => set("initial", e.target.value)} /></Field>}
            <div className="md:col-span-2"><Field label={t("notes")}><textarea className="input min-h-20" value={v.notes} onChange={(e) => set("notes", e.target.value)} /></Field></div>
          </div>
        </Panel>
        <Panel title={t("total")}>
          {car && <img src={carImage(car.category)} alt={car.model} width={992} height={672} className="mx-auto mb-3 h-32 object-contain" />}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>{t("car")}</span><b>{car?.model ?? "—"}</b></div>
            <div className="flex justify-between"><span>{t("days")}</span><b>{days}</b></div>
            <div className="flex justify-between"><span>{t("daily_rate")}</span><b>{money(v.daily_rate, cur)}</b></div>
            <div className="flex justify-between"><span>{t("deposit")}</span><b>{money(v.deposit, cur)}</b></div>
            {canPay && <div className="flex justify-between"><span>{t("remaining")}</span><b className="text-destructive">{money(Math.max(0, total - Number(v.initial)), cur)}</b></div>}
            <div className="flex justify-between border-t border-border pt-3 text-lg"><span className="font-bold">{t("total")}</span><b className="text-primary">{money(total, cur)}</b></div>
          </div>
          <button className="btn-primary mt-5 w-full" disabled={busy}>{t("createContract")}</button>
        </Panel>
      </div>
    </form>
  );
}
