import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, FileSignature, Check, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { canRead, canWrite, isModule, type Module } from "@/lib/rbac";
import { useAuth } from "@/lib/auth";
import { useRows, useSave, money, today, type AnyRow } from "@/lib/data";
import { rentalTotal } from "@/lib/finance";
import { Badge, Drawer, Empty, Field, NoAccess, PageHead, Table, useLang } from "@/components/kit";

export const Route = createFileRoute("/$lang/app/$module")({
  beforeLoad: ({ params }) => {
    if (!isModule(params.module) || !(params.module in CONFIG)) throw notFound();
  },
  component: ModulePage,
});

type FieldDef = { key: string; type: "text" | "number" | "date" | "select" | "customer" | "car" | "contract"; options?: string[]; staffOnly?: boolean };
type Config = { table: string; select: string; order: string; cols: string[]; status?: { key: string; options: string[] }; fields: FieldDef[] };

const CONFIG: Partial<Record<Module, Config>> = {
  customers: {
    table: "customers", select: "*", order: "created_at",
    cols: ["full_name", "phone", "email", "city", "license_no", "license_expiry", "status"],
    status: { key: "status", options: ["active", "blocked"] },
    fields: [{ key: "full_name", type: "text" }, { key: "phone", type: "text" }, { key: "email", type: "text" }, { key: "city", type: "text" }, { key: "license_no", type: "text" }, { key: "license_expiry", type: "date" }],
  },
  bookings: {
    table: "bookings", select: "*, customers(full_name), cars(model, price_per_day)", order: "start_date",
    cols: ["ref", "customers.full_name", "cars.model", "start_date", "end_date", "total", "status"],
    status: { key: "status", options: ["pending", "confirmed", "completed", "cancelled"] },
    fields: [{ key: "customer_id", type: "customer", staffOnly: true }, { key: "car_id", type: "car" }, { key: "start_date", type: "date" }, { key: "end_date", type: "date" }, { key: "notes", type: "text" }],
  },
  booking_requests: {
    table: "booking_requests", select: "*, cars(model), agencies(name)", order: "created_at",
    cols: ["ref", "full_name", "phone", "cars.model", "agencies.name", "start_date", "end_date", "estimate", "status"],
    status: { key: "status", options: ["pending", "confirmed", "cancelled"] },
    fields: [],
  },
  payments: {
    table: "payments", select: "*, customers(full_name), contracts(ref)", order: "paid_at",
    cols: ["ref", "paid_at", "customers.full_name", "contracts.ref", "amount", "method"],
    fields: [{ key: "contract_id", type: "contract" }, { key: "amount", type: "number" }, { key: "method", type: "select", options: ["cash", "card", "transfer", "cheque"] }, { key: "paid_at", type: "date" }, { key: "note", type: "text" }],
  },
  expenses: {
    table: "expenses", select: "*, cars(model)", order: "spent_at",
    cols: ["ref", "spent_at", "category", "label", "cars.model", "amount"],
    fields: [{ key: "category", type: "select", options: ["maintenance", "fuel", "insurance", "wash", "admin", "other"] }, { key: "label", type: "text" }, { key: "amount", type: "number" }, { key: "car_id", type: "car" }, { key: "spent_at", type: "date" }],
  },
  maintenance: {
    table: "maintenance", select: "*, cars(model, plate)", order: "scheduled_at",
    cols: ["ref", "cars.model", "cars.plate", "type", "cost", "mileage", "scheduled_at", "status"],
    status: { key: "status", options: ["scheduled", "in_progress", "done"] },
    fields: [{ key: "car_id", type: "car" }, { key: "type", type: "text" }, { key: "cost", type: "number" }, { key: "mileage", type: "number" }, { key: "scheduled_at", type: "date" }],
  },
  notifications: {
    table: "notifications", select: "*", order: "created_at",
    cols: ["created_at", "title", "body", "priority", "is_read"], fields: [],
  },
  audit: { table: "audit_logs", select: "*", order: "created_at", cols: ["created_at", "action", "entity", "entity_id"], fields: [] },
};

const LABEL: Record<string, string> = {
  "customers.full_name": "customer", "cars.model": "car", "cars.plate": "plate", "agencies.name": "agency", "contracts.ref": "contracts", start_date: "from", end_date: "to",
  paid_at: "date", spent_at: "date", scheduled_at: "date", created_at: "date", full_name: "fullName", is_read: "status", body: "message",
  customer_id: "customer", car_id: "car", contract_id: "contracts", note: "notes", category: "type",
};
const MONEY = ["total", "amount", "cost", "estimate"];
const TRANSLATED = ["category", "method", "title", "action", "entity"];
const get = (r: AnyRow, path: string) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), r);

function ModulePage() {
  const { module } = Route.useParams();
  const { t, lang } = useLang();
  const { role } = useAuth();
  const cfg = CONFIG[module as Module]!;
  const m = module as Module;
  const { data: rows = [], isLoading } = useRows(cfg.table, cfg.select, cfg.order);
  const save = useSave(cfg.table, t("saved"));
  const [q, setQ] = useState("");
  const [st, setSt] = useState("");
  const [open, setOpen] = useState(false);
  const isCustomer = role === "customer";
  const staff = !!role && !isCustomer;
  const writable = !!role && canWrite(role, m);
  const [editing, setEditing] = useState<AnyRow | null>(null);
  const canEdit = writable && staff && cfg.fields.length > 0;
  const cur = t("currency");

  const shown = useMemo(() => rows.filter((r) => (!st || (cfg.status && r[cfg.status.key] === st)) && JSON.stringify(r).toLowerCase().includes(q.toLowerCase())), [rows, q, st, cfg.status]);
  if (!role || !canRead(role, m)) return <NoAccess />;

  const title = isCustomer ? t({ bookings: "myBookings", payments: "myPayments" }[m as string] ?? m) : t(m);

  const cell = (r: AnyRow, c: string) => {
    const v = get(r, c);
    if (v == null || v === "") return "—";
    if (c === "is_read") return v ? <span className="badge badge-muted">✓</span> : <span className="badge badge-info">{t("new")}</span>;
    if (cfg.status && c === cfg.status.key) {
      return staff && writable ? (
        <select className="input w-auto py-1 text-xs" value={v} onChange={(e) => save.mutate({ id: r.id, values: { [c]: e.target.value } })}>
          {cfg.status.options.map((o) => <option key={o} value={o}>{t(o)}</option>)}
        </select>
      ) : <Badge value={v} />;
    }
    if (c === "priority") return <Badge value={v} />;
    if (MONEY.includes(c)) return <span className="font-bold">{money(v, cur)}</span>;
    if (c === "ref" || c === "contracts.ref") return `#${v}`;
    if (c === "created_at") return new Date(v).toLocaleString();
    if (c === "entity_id") return <span className="font-mono text-xs">{String(v).slice(0, 8)}</span>;
    if (TRANSLATED.includes(c)) return t(v);
    return v;
  };

  return (
    <div>
      <PageHead title={title}>
        {writable && cfg.fields.length > 0 && <button className="btn-primary" onClick={() => setOpen(true)}><Plus className="h-4 w-4" />{isCustomer && m === "bookings" ? t("requestBooking") : t("new")}</button>}
        {!writable && cfg.fields.length > 0 && <span className="badge badge-muted">{t("readOnly")}</span>}
      </PageHead>
      <div className="card p-4">
        <div className="mb-4 flex flex-wrap gap-3">
          <input className="input max-w-xs" placeholder={t("filter")} value={q} onChange={(e) => setQ(e.target.value)} />
          {cfg.status && (
            <div className="flex flex-wrap gap-2">
              {["", ...cfg.status.options].map((o) => (
                <button key={o} onClick={() => setSt(o)} className={st === o ? "btn-primary py-1.5" : "btn-ghost py-1.5"}>
                  {o ? t(o) : t("all")} ({o ? rows.filter((r) => r[cfg.status!.key] === o).length : rows.length})
                </button>
              ))}
            </div>
          )}
        </div>
        {isLoading ? <div className="py-8 text-center text-muted-foreground">{t("loading")}</div> : shown.length === 0 ? <Empty /> : (
          <Table head={[...cfg.cols.map((c) => t(LABEL[c] ?? c)), ...(m === "bookings" && staff ? [t("actions")] : []), ...(m === "notifications" ? [t("actions")] : []), ...(canEdit ? [t("edit")] : [])]}>
            {shown.map((r) => (
              <tr key={r.id} className="hover:bg-muted/40">
                {cfg.cols.map((c) => <td key={c}>{cell(r, c)}</td>)}
                {m === "bookings" && staff && (
                  <td>
                    {r.status !== "cancelled" && canWrite(role, "contracts") && (
                      <Link to="/$lang/app/contracts/new" params={{ lang }} search={{ booking: r.id }} className="btn-soft py-1 text-xs"><FileSignature className="h-3.5 w-3.5" />{t("createContract")}</Link>
                    )}
                  </td>
                )}
                {m === "notifications" && <td>{!r.is_read && <button className="btn-ghost py-1 text-xs" onClick={() => save.mutate({ id: r.id, values: { is_read: true } })}><Check className="h-3.5 w-3.5" />{t("markRead")}</button>}</td>}
                {canEdit && <td><button className="btn-ghost py-1 text-xs" onClick={() => setEditing(r)}><Pencil className="h-3.5 w-3.5" />{t("edit")}</button></td>}
              </tr>
            ))}
          </Table>
        )}
      </div>
      <Drawer open={open || !!editing} onClose={() => { setOpen(false); setEditing(null); }} title={`${editing ? t("edit") : t("new")} · ${title}`}>
        <RecordForm key={editing?.id ?? "new"} cfg={cfg} staff={staff} initial={editing} onDone={() => { setOpen(false); setEditing(null); }} />
      </Drawer>
    </div>
  );
}

function RecordForm({ cfg, staff, onDone, initial }: { cfg: Config; staff: boolean; onDone: () => void; initial?: AnyRow | null }) {
  const { t } = useLang();
  const save = useSave(cfg.table, t("saved"));
  const { data: customers = [] } = useRows("customers", "id, full_name, created_at");
  const { data: cars = [] } = useRows("cars", "id, model, plate, price_per_day, status, created_at");
  const { data: contracts = [] } = useRows("contracts", "id, ref, customer_id, total, customers(full_name), created_at");
  const [v, setV] = useState<AnyRow>(() => initial ? Object.fromEntries(cfg.fields.map((f) => [f.key, initial[f.key] ?? ""])) : { paid_at: today(), spent_at: today(), scheduled_at: today(), method: "cash", category: "other" });
  const set = (k: string, val: unknown) => setV((p: AnyRow) => ({ ...p, [k]: val }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values: AnyRow = {};
    for (const f of cfg.fields) if (v[f.key] !== undefined && v[f.key] !== "") values[f.key] = f.type === "number" ? Number(v[f.key]) : v[f.key];
    if (cfg.table === "bookings") {
      if (!staff) {
        const { data } = await supabase.rpc("my_customer_id");
        values["customer_id"] = data;
        values["status"] = "pending";
      }
      const car = cars.find((c) => c.id === values["car_id"]);
      values["total"] = rentalTotal(values["start_date"], values["end_date"], Number(car?.price_per_day ?? 0)).total;
    }
    if (cfg.table === "payments") values["customer_id"] = contracts.find((c) => c.id === values["contract_id"])?.customer_id;
    save.mutate({ values }, { onSuccess: onDone });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {cfg.fields.filter((f) => staff || !f.staffOnly).map((f) => (
        <Field key={f.key} label={t(LABEL[f.key] ?? f.key)}>
          {f.type === "select" ? (
            <select className="input" value={v[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)}>{f.options!.map((o) => <option key={o} value={o}>{t(o)}</option>)}</select>
          ) : f.type === "customer" ? (
            <select className="input" required value={v[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)}><option value="">—</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}</select>
          ) : f.type === "car" ? (
            <select className="input" required={cfg.table !== "expenses"} value={v[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)}><option value="">—</option>{cars.map((c) => <option key={c.id} value={c.id}>{c.model} · {c.plate} · {c.price_per_day}</option>)}</select>
          ) : f.type === "contract" ? (
            <select className="input" required value={v[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)}><option value="">—</option>{contracts.map((c) => <option key={c.id} value={c.id}>#{c.ref} · {c.customers?.full_name} · {c.total}</option>)}</select>
          ) : (
            <input className="input" type={f.type} required={f.type !== "text" || f.key === "full_name" || f.key === "label" || f.key === "type"} value={v[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} />
          )}
        </Field>
      ))}
      <div className="flex gap-2 pt-2">
        <button className="btn-primary" disabled={save.isPending}>{t("save")}</button>
        <button type="button" className="btn-ghost" onClick={onDone}>{t("cancel")}</button>
      </div>
    </form>
  );
}
