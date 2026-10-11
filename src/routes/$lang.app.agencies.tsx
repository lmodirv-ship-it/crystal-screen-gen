import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Car, Plus, Trash2, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { canRead, canWrite } from "@/lib/rbac";
import { money, useRows, useSave, type AnyRow } from "@/lib/data";
import { Drawer, Empty, Field, NoAccess, PageHead, Panel, StatTile, Table, useLang } from "@/components/kit";

export const Route = createFileRoute("/$lang/app/agencies")({
  head: () => ({
    meta: [
      { title: "Agences — HN RentCar" },
      { name: "description", content: "Manage several rental agencies from the owner platform." },
      { property: "og:title", content: "Agences — HN RentCar" },
      { property: "og:description", content: "Manage several rental agencies from the owner platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AgenciesPage,
});

const STAFF_ROLES = ["manager", "operator", "accountant"] as const;

function AgenciesPage() {
  const { t } = useLang();
  const { role } = useAuth();
  const { data: agencies = [] } = useRows("agencies");
  const { data: cars = [] } = useRows("cars");
  const { data: members = [] } = useRows("agency_members");
  const { data: payments = [] } = useRows("payments");
  const [editing, setEditing] = useState<AnyRow | null>(null);
  const [selId, setSelId] = useState<string | null>(null);
  if (!role || !canRead(role, "agencies")) return <NoAccess />;
  const write = canWrite(role, "agencies");
  const sel = agencies.find((a) => a.id === selId) ?? agencies[0];

  return (
    <div className="space-y-6">
      <PageHead title={t("agencies")} sub={t("agenciesSub")} icon={<Building2 className="h-5 w-5" />}>
        {write && <button className="btn-primary" onClick={() => setEditing({})}><Plus className="h-4 w-4" />{t("newAgency")}</button>}
      </PageHead>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {agencies.map((a) => {
          const nCars = cars.filter((c) => c.agency_id === a.id).length;
          const nStaff = members.filter((m) => m.agency_id === a.id).length;
          const rev = payments.filter((p) => p.agency_id === a.id).reduce((s, p) => s + Number(p.amount), 0);
          const active = sel?.id === a.id;
          return (
            <button key={a.id} onClick={() => setSelId(a.id)} className={`card p-5 text-start hover:-translate-y-1 ${active ? "ring-2 ring-primary" : ""}`}>
              <div className="mb-3 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary font-black text-primary-foreground">{a.name[0]}</div>
                <div className="min-w-0">
                  <div className="truncate font-display text-lg font-extrabold">{a.name}</div>
                  <div className="text-xs text-muted-foreground">{a.city ?? "—"}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-muted p-2"><Car className="mx-auto mb-1 h-4 w-4 text-primary" /><b>{nCars}</b> {t("cars")}</div>
                <div className="rounded-lg bg-muted p-2"><Users className="mx-auto mb-1 h-4 w-4 text-violet" /><b>{nStaff}</b> {t("staff")}</div>
                <div className="rounded-lg bg-muted p-2"><Wallet className="mx-auto mb-1 h-4 w-4 text-success" /><b>{money(rev, a.currency)}</b></div>
              </div>
            </button>
          );
        })}
        {agencies.length === 0 && <div className="card"><Empty /></div>}
      </div>

      {sel && <AgencyDetail agency={sel} cars={cars} members={members.filter((m) => m.agency_id === sel.id)} write={write} onEdit={() => setEditing(sel)} />}
      <AgencyForm row={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

function AgencyDetail({ agency, cars, members, write, onEdit }: { agency: AnyRow; cars: AnyRow[]; members: AnyRow[]; write: boolean; onEdit: () => void }) {
  const { t } = useLang();
  const qc = useQueryClient();
  const saveMember = useSave("agency_members");
  const [m, setM] = useState({ full_name: "", email: "", phone: "", role: "operator" });
  const mine = cars.filter((c) => c.agency_id === agency.id);
  const others = cars.filter((c) => c.agency_id !== agency.id);
  const accountant = members.find((x) => x.role === "accountant");

  const setCar = async (id: string, agency_id: string | null) => {
    const { error } = await supabase.from("cars").update({ agency_id }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries();
  };
  const removeMember = async (id: string) => {
    const { error } = await supabase.from("agency_members").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Panel title={t("agencySettings")} action={write && <button className="btn-soft" onClick={onEdit}>{t("saveF")}…</button>}>
        <dl className="space-y-2 text-sm">
          {([["agencyName", agency.name], ["cityF", agency.city], ["phoneF", agency.phone], ["emailF", agency.email], ["addressF", agency.address], ["accountantOf", accountant?.full_name]] as const).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-border pb-2"><dt className="text-muted-foreground">{t(k)}</dt><dd className="font-semibold">{v || "—"}</dd></div>
          ))}
        </dl>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatTile icon={<Car className="h-5 w-5" />} color="bg-accent text-accent-foreground" value={mine.length} label={t("cars")} />
          <StatTile icon={<Users className="h-5 w-5" />} color="bg-accent text-accent-foreground" value={members.length} label={t("staff")} />
        </div>
      </Panel>

      <Panel title={`${t("staff")} · ${agency.name}`}>
        <Table head={[t("fullName"), t("roleF"), ""]}>
          {members.map((x) => (
            <tr key={x.id}><td><div className="font-semibold">{x.full_name}</div><div className="text-xs text-muted-foreground">{x.email ?? x.phone ?? ""}</div></td><td>{t("r_" + x.role)}</td>
              <td>{write && <button className="btn-ghost p-1.5" aria-label={t("removeF")} onClick={() => removeMember(x.id)}><Trash2 className="h-4 w-4 text-destructive" /></button>}</td></tr>
          ))}
        </Table>
        {members.length === 0 && <Empty />}
        {write && (
          <form className="mt-4 space-y-2" onSubmit={(e) => { e.preventDefault(); if (!m.full_name.trim()) return; saveMember.mutate({ values: { ...m, agency_id: agency.id } }, { onSuccess: () => setM({ full_name: "", email: "", phone: "", role: "operator" }) }); }}>
            <input className="input" placeholder={t("fullName")} value={m.full_name} onChange={(e) => setM({ ...m, full_name: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input className="input" placeholder={t("emailF")} value={m.email} onChange={(e) => setM({ ...m, email: e.target.value })} />
              <select className="input" value={m.role} onChange={(e) => setM({ ...m, role: e.target.value })}>{STAFF_ROLES.map((r) => <option key={r} value={r}>{t("r_" + r)}</option>)}</select>
            </div>
            <button className="btn-primary w-full"><Plus className="h-4 w-4" />{t("addStaff")}</button>
          </form>
        )}
      </Panel>

      <Panel title={`${t("cars")} · ${agency.name}`}>
        <div className="space-y-2">
          {mine.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
              <span><b>{c.model}</b> <span className="text-muted-foreground">{c.plate}</span></span>
              {write && <button className="btn-ghost p-1.5" aria-label={t("removeF")} onClick={() => setCar(c.id, null)}><Trash2 className="h-4 w-4 text-destructive" /></button>}
            </div>
          ))}
          {mine.length === 0 && <Empty />}
        </div>
        {write && others.length > 0 && (
          <select className="input mt-4" value="" onChange={(e) => e.target.value && setCar(e.target.value, agency.id)}>
            <option value="">+ {t("assignCar")}</option>
            {others.map((c) => <option key={c.id} value={c.id}>{c.model} · {c.plate}</option>)}
          </select>
        )}
      </Panel>
    </div>
  );
}

function AgencyForm({ row, onClose }: { row: AnyRow | null; onClose: () => void }) {
  const { t } = useLang();
  const save = useSave("agencies");
  const [v, setV] = useState<AnyRow>({});
  const [key, setKey] = useState<AnyRow>(null);
  if (row !== key) { setKey(row); setV(row ?? {}); }
  const f = (k: string, label: string) => <Field label={t(label)}><input className="input" value={v[k] ?? ""} onChange={(e) => setV({ ...v, [k]: e.target.value })} /></Field>;
  return (
    <Drawer open={!!row} onClose={onClose} title={row?.id ? t("agencySettings") : t("newAgency")}>
      <form className="space-y-3" onSubmit={(e) => {
        e.preventDefault();
        if (!String(v.name ?? "").trim()) return;
        const { name, city, phone, email, address, currency } = v;
        save.mutate({ id: row?.id, values: { name, city, phone, email, address, currency: currency || "MAD" } }, { onSuccess: onClose });
      }}>
        {f("name", "agencyName")}{f("city", "cityF")}{f("phone", "phoneF")}{f("email", "emailF")}{f("address", "addressF")}
        <button className="btn-primary w-full" disabled={save.isPending}>{t("saveF")}</button>
      </form>
    </Drawer>
  );
}
