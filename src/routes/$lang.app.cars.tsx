import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Car, Plus, Pencil, Calendar, Fuel, Cog } from "lucide-react";
import { canRead, canWrite } from "@/lib/rbac";
import { useAuth } from "@/lib/auth";
import { useRows, useSave, type AnyRow } from "@/lib/data";
import { carImage, CATEGORIES } from "@/lib/car-images";
import { Badge, Drawer, Empty, Field, NoAccess, PageHead, useLang } from "@/components/kit";

export const Route = createFileRoute("/$lang/app/cars")({ component: CarsPage });

const STATUSES = ["available", "rented", "maintenance"];

function CarsPage() {
  const { t } = useLang();
  const { role } = useAuth();
  const { data: cars = [] } = useRows("cars");
  const save = useSave("cars", t("saved"));
  const [st, setSt] = useState("");
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<AnyRow | null>(null);
  if (!role || !canRead(role, "cars")) return <NoAccess />;
  const full = canWrite(role, "cars");
  const canStatus = full || role === "operator";
  const shown = cars.filter((c) => (!st || c.status === st) && `${c.model} ${c.plate}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <PageHead title={t("cars")} icon={<Car className="h-6 w-6" />}>
        {full && <button className="btn-primary" onClick={() => setEdit({ category: "economy", fuel: "diesel", transmission: "manual", year: 2024, price_per_day: 300, status: "available" })}><Plus className="h-4 w-4" />{t("addCar")}</button>}
      </PageHead>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input className="input max-w-xs" placeholder={t("filter")} value={q} onChange={(e) => setQ(e.target.value)} />
        {["", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setSt(s)} className={st === s ? "btn-primary py-1.5" : "btn-ghost py-1.5"}>{s ? t(s) : t("all")} ({s ? cars.filter((c) => c.status === s).length : cars.length})</button>
        ))}
      </div>
      {shown.length === 0 ? <Empty /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {shown.map((c) => {
            const insSoon = c.insurance_expiry && (new Date(c.insurance_expiry).getTime() - Date.now()) / 86400000 <= 15;
            return (
              <div key={c.id} className="card overflow-hidden">
                <div className="relative bg-muted/50 p-3">
                  <span className="absolute end-3 top-3"><Badge value={c.status} /></span>
                  <img src={carImage(c.category)} alt={c.model} loading="lazy" width={992} height={672} className="mx-auto h-32 object-contain" />
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-display text-lg font-extrabold">{c.model}</div>
                    {full && <button className="btn-ghost p-1.5" onClick={() => setEdit(c)} aria-label="edit"><Pencil className="h-4 w-4" /></button>}
                  </div>
                  <div className="text-sm text-muted-foreground" dir="ltr">{c.plate}</div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{c.year}</span>
                    <span className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5" />{t(c.fuel)}</span>
                    <span className="flex items-center gap-1"><Cog className="h-3.5 w-3.5" />{t(c.transmission)}</span>
                    <span>{Number(c.mileage).toLocaleString()} km</span>
                  </div>
                  {insSoon && <div className="badge badge-danger">{t("insurance_expiry")}: {c.insurance_expiry}</div>}
                  <div className="flex items-center justify-between pt-1">
                    <div className="font-display text-xl font-black text-primary">{c.price_per_day} <span className="text-xs">{t("perDay")}</span></div>
                    {canStatus && (
                      <select className="input w-auto py-1 text-xs" value={c.status} onChange={(e) => save.mutate({ id: c.id, values: { status: e.target.value } })}>
                        {STATUSES.map((s) => <option key={s} value={s}>{t(s)}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Drawer open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? edit.model : t("addCar")}>
        {edit && <CarForm car={edit} onDone={() => setEdit(null)} />}
      </Drawer>
    </div>
  );
}

function CarForm({ car, onDone }: { car: AnyRow; onDone: () => void }) {
  const { t } = useLang();
  const save = useSave("cars", t("saved"));
  const [v, setV] = useState<AnyRow>(car);
  const set = (k: string, val: unknown) => setV((p: AnyRow) => ({ ...p, [k]: val }));
  const sel = (k: string, opts: string[]) => <select className="input" value={v[k]} onChange={(e) => set(k, e.target.value)}>{opts.map((o) => <option key={o} value={o}>{t(o)}</option>)}</select>;
  return (
    <form className="space-y-4" onSubmit={(e) => {
      e.preventDefault();
      const { id, created_at: _c, ...rest } = v;
      save.mutate({ id, values: { ...rest, year: Number(rest.year), price_per_day: Number(rest.price_per_day), mileage: Number(rest.mileage ?? 0), insurance_expiry: rest.insurance_expiry || null, inspection_expiry: rest.inspection_expiry || null, next_service_km: rest.next_service_km ? Number(rest.next_service_km) : null } }, { onSuccess: onDone });
    }}>
      <Field label={t("model")}><input className="input" required value={v.model ?? ""} onChange={(e) => set("model", e.target.value)} /></Field>
      <Field label={t("plate")}><input className="input" required dir="ltr" value={v.plate ?? ""} onChange={(e) => set("plate", e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("category")}>{sel("category", CATEGORIES)}</Field>
        <Field label={t("status")}>{sel("status", STATUSES)}</Field>
        <Field label={t("fuel")}>{sel("fuel", ["diesel", "petrol", "hybrid"])}</Field>
        <Field label={t("transmission")}>{sel("transmission", ["manual", "automatic"])}</Field>
        <Field label={t("year")}><input className="input" type="number" value={v.year} onChange={(e) => set("year", e.target.value)} /></Field>
        <Field label={t("price_per_day")}><input className="input" type="number" value={v.price_per_day} onChange={(e) => set("price_per_day", e.target.value)} /></Field>
        <Field label={t("mileage")}><input className="input" type="number" value={v.mileage ?? 0} onChange={(e) => set("mileage", e.target.value)} /></Field>
        <Field label={t("insurance_expiry")}><input className="input" type="date" value={v.insurance_expiry ?? ""} onChange={(e) => set("insurance_expiry", e.target.value)} /></Field>
        <Field label={t("inspection_expiry")}><input className="input" type="date" value={v.inspection_expiry ?? ""} onChange={(e) => set("inspection_expiry", e.target.value)} /></Field>
        <Field label={t("next_service_km")}><input className="input" type="number" value={v.next_service_km ?? ""} onChange={(e) => set("next_service_km", e.target.value)} /></Field>
      </div>
      <div className="flex gap-2"><button className="btn-primary" disabled={save.isPending}>{t("save")}</button><button type="button" className="btn-ghost" onClick={onDone}>{t("cancel")}</button></div>
    </form>
  );
}
