import { createFileRoute, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { isLang, translator } from "@/lib/i18n";
import { canRead, canWrite, isModule, PERMISSIONS, ROLES } from "@/lib/rbac";
import { useRole } from "@/lib/role-store";
import { CURRENCY, DEMO_CUSTOMER, MONEY_COLS, TABLES, type Row } from "@/lib/demo-data";
import { Badge } from "@/components/ui-kit";

export const Route = createFileRoute("/$lang/app/$module")({
  beforeLoad: ({ params }) => {
    if (!isModule(params.module) || params.module === "dashboard") throw notFound();
  },
  component: ModulePage,
});

function ModulePage() {
  const { lang, module } = Route.useParams();
  const t = translator(isLang(lang) ? lang : "en");
  const { role } = useRole();
  if (!isModule(module)) return null;
  if (!canRead(role, module)) return <div className="card p-8 text-center text-muted-foreground">{t("noAccess")}</div>;
  if (module === "settings") return <Settings t={t} />;
  if (module === "dashboard") return null;
  return <DataTable key={module + role} module={module} t={t} writable={canWrite(role, module)} customer={role === "customer"} />;
}

function DataTable({ module, t, writable, customer }: { module: keyof typeof TABLES; t: (k: string) => string; writable: boolean; customer: boolean }) {
  const def = TABLES[module];
  const [rows, setRows] = useState<Row[]>(def.rows);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [modal, setModal] = useState(false);
  const [draft, setDraft] = useState<Row>({});

  const scoped = customer && def.customerScoped ? rows.filter((r) => r["customer"] === DEMO_CUSTOMER || r["owner"] === DEMO_CUSTOMER) : rows;
  const statuses = def.status ? [...new Set(scoped.map((r) => String(r[def.status!])))] : [];
  const shown = useMemo(
    () => scoped.filter((r) => (!status || r[def.status!] === status) && Object.values(r).join(" ").toLowerCase().includes(q.toLowerCase())),
    [scoped, q, status, def.status],
  );

  const cell = (c: string, v: string | number | undefined) => {
    if (v === undefined) return "";
    if (c === def.status) return <Badge value={String(v)} label={t(String(v))} />;
    if (MONEY_COLS.includes(c) && typeof v === "number") return `${v.toLocaleString("en-US")} ${CURRENCY}`;
    return v;
  };

  const add = () => {
    const r: Row = { ...draft };
    if (def.status && !r[def.status]) r[def.status] = statuses[0] ?? "pending";
    if (customer && def.customerScoped) r["customer"] = DEMO_CUSTOMER;
    setRows([r, ...rows]);
    setDraft({});
    setModal(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">{t(module)}</h1>
        {writable ? <button className="btn-accent" onClick={() => setModal(true)}>+ {t("new")}</button> : <span className="badge badge-muted">{t("readOnly")}</span>}
      </div>
      <div className="flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder={t("search")} value={q} onChange={(e) => setQ(e.target.value)} />
        {statuses.length > 0 && (
          <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t("all")}</option>
            {statuses.map((s) => <option key={s} value={s}>{t(s)}</option>)}
          </select>
        )}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-start text-xs uppercase tracking-wider text-muted-foreground">
              {def.columns.map((c) => <th key={c} className="px-4 py-3 text-start font-medium">{t(c)}</th>)}
            </tr>
          </thead>
          <tbody>
            {shown.map((r, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/40">
                {def.columns.map((c) => <td key={c} className="whitespace-nowrap px-4 py-3">{cell(c, r[c])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/70" onClick={() => setModal(false)}>
          <div className="drawer h-full w-full max-w-md overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="mb-5 font-display text-xl font-semibold">{t("new")} · {t(module)}</h2>
            <div className="space-y-3">
              {def.columns.filter((c) => c !== def.status).map((c) => (
                <label key={c} className="block text-sm">
                  <span className="text-muted-foreground">{t(c)}</span>
                  <input className="input mt-1" value={String(draft[c] ?? "")} onChange={(e) => setDraft({ ...draft, [c]: MONEY_COLS.includes(c) ? Number(e.target.value) || 0 : e.target.value })} />
                </label>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button className="btn-accent" onClick={add}>{t("save")}</button>
              <button className="btn-ghost" onClick={() => setModal(false)}>{t("cancel")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Settings({ t }: { t: (k: string) => string }) {
  const mods = PERMISSIONS.developer.read;
  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold">{t("settings")}</h1>
      <div className="card overflow-x-auto p-1">
        <h2 className="p-4 font-display text-lg font-semibold">{t("permissions")}</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="px-3 py-2 text-start">{t("role")}</th>
              {mods.map((m) => <th key={m} className="px-2 py-2 text-start font-medium">{t(m)}</th>)}
            </tr>
          </thead>
          <tbody>
            {ROLES.map((r) => (
              <tr key={r} className="border-b border-border last:border-0">
                <td className="px-3 py-2 font-medium">{t("r_" + r)}</td>
                {mods.map((m) => (
                  <td key={m} className="px-2 py-2">
                    {canWrite(r, m) ? <span className="badge badge-success">{t("write")}</span> : canRead(r, m) ? <span className="badge badge-info">{t("read")}</span> : <span className="text-muted-foreground">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
