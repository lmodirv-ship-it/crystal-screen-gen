import { AlertTriangle, CalendarClock, ShieldAlert, Wrench } from "lucide-react";
import { useRows, today } from "@/lib/data";
import { useLang } from "@/components/kit";

const days = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

/** Insurance / inspection / service / return alerts for staff dashboards. */
export function SmartAlerts() {
  const { t } = useLang();
  const { data: cars = [] } = useRows("cars");
  const { data: contracts = [] } = useRows("contracts", "id, ref, end_date, status, customers(full_name), cars(model)", "end_date");
  const { data: maint = [] } = useRows("maintenance", "id, type, scheduled_at, status, cars(model)", "scheduled_at");
  const now = today();
  const items: { icon: typeof AlertTriangle; tone: string; text: string }[] = [];
  for (const c of cars) {
    if (c.insurance_expiry && days(c.insurance_expiry) <= 15) items.push({ icon: ShieldAlert, tone: "badge-danger", text: `${t("insurance_expiry")} · ${c.model} (${c.plate}) · ${c.insurance_expiry}` });
    if (c.inspection_expiry && days(c.inspection_expiry) <= 15) items.push({ icon: ShieldAlert, tone: "badge-warn", text: `${t("inspection_expiry")} · ${c.model} · ${c.inspection_expiry}` });
    if (c.next_service_km && c.mileage >= c.next_service_km - 500) items.push({ icon: Wrench, tone: "badge-warn", text: `${t("oilChange")} · ${c.model} · ${Number(c.mileage).toLocaleString()} / ${Number(c.next_service_km).toLocaleString()} km` });
  }
  for (const m of maint) if (m.status !== "done" && days(m.scheduled_at) <= 7) items.push({ icon: Wrench, tone: "badge-info", text: `${t("maintenance")} · ${m.cars?.model} · ${m.type} · ${m.scheduled_at}` });
  for (const k of contracts) {
    if (k.status === "closed") continue;
    if (k.end_date < now) items.push({ icon: AlertTriangle, tone: "badge-danger", text: `${t("lateReturn")} · #${k.ref} ${k.customers?.full_name} · ${k.cars?.model} · ${k.end_date}` });
    else if (k.end_date === now) items.push({ icon: CalendarClock, tone: "badge-warn", text: `${t("returnToday")} · #${k.ref} ${k.customers?.full_name} · ${k.cars?.model}` });
  }
  return (
    <div className="card mb-5 p-4">
      <div className="mb-3 flex items-center gap-2 font-display font-extrabold"><span className="tile tile-orange h-9 w-9"><AlertTriangle className="h-4 w-4" /></span>{t("smartAlerts")} <span className="badge badge-danger">{items.length}</span></div>
      {items.length === 0 ? <div className="text-sm text-muted-foreground">{t("noAlerts")}</div> : (
        <ul className="grid gap-2 md:grid-cols-2">
          {items.slice(0, 12).map((a, i) => <li key={i} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm"><span className={`badge ${a.tone}`}><a.icon className="h-3.5 w-3.5" /></span>{a.text}</li>)}
        </ul>
      )}
    </div>
  );
}
