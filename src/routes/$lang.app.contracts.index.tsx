import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FilePlus2, FileText } from "lucide-react";
import { canRead, canWrite } from "@/lib/rbac";
import { useAuth } from "@/lib/auth";
import { useRows, useSave, money } from "@/lib/data";
import { remaining } from "@/lib/finance";
import { supabase } from "@/integrations/supabase/client";
import { Badge, Empty, NoAccess, PageHead, Table, useLang } from "@/components/kit";

export const Route = createFileRoute("/$lang/app/contracts/")({ component: ContractsPage });

function ContractsPage() {
  const { t, lang } = useLang();
  const { role } = useAuth();
  const { data: rows = [] } = useRows("contracts", "*, customers(full_name, phone), cars(id, model, plate), payments(amount)", "start_date");
  const save = useSave("contracts", t("saved"));
  const [st, setSt] = useState("");
  const [q, setQ] = useState("");
  if (!role || !canRead(role, "contracts")) return <NoAccess />;
  const writable = canWrite(role, "contracts");
  const cur = t("currency");
  const shown = rows.filter((r) => (!st || r.status === st) && JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));

  const close = (r: (typeof rows)[number]) => {
    save.mutate({ id: r.id, values: { status: "closed" } }, { onSuccess: () => void supabase.from("cars").update({ status: "available" }).eq("id", r.car_id) });
  };

  return (
    <div>
      <PageHead title={t(role === "customer" ? "myContracts" : "contracts")} icon={<FileText className="h-6 w-6" />}>
        {writable && <Link to="/$lang/app/contracts/new" params={{ lang }} search={{}} className="btn-primary"><FilePlus2 className="h-4 w-4" />{t("createContract")}</Link>}
      </PageHead>
      <div className="card p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <input className="input max-w-xs" placeholder={t("filter")} value={q} onChange={(e) => setQ(e.target.value)} />
          {["", "active", "overdue", "closed"].map((s) => <button key={s} onClick={() => setSt(s)} className={st === s ? "btn-primary py-1.5" : "btn-ghost py-1.5"}>{s ? t(s) : t("all")}</button>)}
        </div>
        {shown.length === 0 ? <Empty /> : (
          <Table head={["#", t("customer"), t("car"), t("from"), t("to"), t("total"), t("paid"), t("remaining"), t("deposit"), t("status"), ...(writable ? [t("actions")] : [])]}>
            {shown.map((r) => {
              const rest = remaining(r.total, r.payments ?? []);
              return (
                <tr key={r.id} className="hover:bg-muted/40">
                  <td className="font-bold">#{r.ref}</td>
                  <td>{r.customers?.full_name}</td>
                  <td>{r.cars?.model} <span className="text-xs text-muted-foreground" dir="ltr">{r.cars?.plate}</span></td>
                  <td>{r.start_date}</td><td>{r.end_date}</td>
                  <td className="font-bold">{money(r.total, cur)}</td>
                  <td className="text-success">{money(Number(r.total) - rest, cur)}</td>
                  <td className={rest > 0 ? "font-bold text-destructive" : "text-muted-foreground"}>{money(rest, cur)}</td>
                  <td>{money(r.deposit, cur)}</td>
                  <td><Badge value={r.status} /></td>
                  {writable && <td>{r.status !== "closed" && <button className="btn-ghost py-1 text-xs" onClick={() => close(r)}>{t("closeContract")}</button>}</td>}
                </tr>
              );
            })}
          </Table>
        )}
      </div>
    </div>
  );
}
