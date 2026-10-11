import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, FileSignature, FileText, IdCard, Inbox, Send, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { money } from "@/lib/data";
import { useActiveAgency } from "@/lib/agency";
import { useLang, PageHead, Panel, Empty } from "@/components/kit";

export const Route = createFileRoute("/$lang/app/booking_requests")({ component: Requests });

type Req = {
  id: string; ref: number; full_name: string; phone: string; start_date: string; end_date: string; estimate: number; status: string;
  license_path: string | null; id_card_path: string | null; contract_id: string | null; created_at: string;
  history: { step: string; at: string; by: string; role?: string | null }[];
  cars: { model: string } | null; agencies: { name: string } | null;
};
const TONE: Record<string, string> = { pending: "badge-warn", accepted: "badge-info", docs_sent: "badge-info", contract_ready: "badge-warn", sent: "badge-success", cancelled: "badge-danger" };

function Requests() {
  const { t, lang } = useLang();
  const qc = useQueryClient();
  const agency = useActiveAgency();
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { data: rows = [] } = useQuery({
    queryKey: ["booking_requests_flow", agency],
    queryFn: async () => {
      let q = supabase.from("booking_requests").select("*, cars(model), agencies(name)").order("created_at", { ascending: false });
      if (agency) q = q.eq("agency_id", agency);
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as Req[];
    },
  });
  const sel = rows.find((r) => r.id === open);

  const run = async (fn: () => PromiseLike<{ error: { message: string } | null }>) => {
    setBusy(true);
    const { error } = await fn();
    setBusy(false);
    if (error) toast.error(error.message); else { toast.success("OK"); void qc.invalidateQueries(); }
  };
  const view = async (path: string) => {
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 300);
    if (error) toast.error(error.message); else window.open(data.signedUrl, "_blank", "noopener");
  };

  return (
    <div>
      <PageHead title={t("booking_requests")} sub={t("allOps")} icon={<Inbox className="h-5 w-5" />} />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Panel title={t("booking_requests")}>
          {rows.length === 0 ? <Empty /> : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <tbody>{rows.map((r) => (
                <tr key={r.id} onClick={() => setOpen(r.id)} className={`cursor-pointer border-b border-border hover:bg-muted/40 ${open === r.id ? "bg-muted/50" : ""}`}>
                  <td className="p-2 font-bold" dir="ltr">#{r.ref}</td>
                  <td className="p-2">{r.full_name}<div className="text-xs text-muted-foreground" dir="ltr">{r.phone}</div></td>
                  <td className="p-2">{r.cars?.model ?? "—"}<div className="text-xs text-muted-foreground">{r.agencies?.name ?? ""}</div></td>
                  <td className="p-2 text-xs">{r.start_date} → {r.end_date}</td>
                  <td className="p-2"><span className={`badge ${TONE[r.status] ?? "badge-muted"}`}>{t(`st_${r.status}`)}</span></td>
                </tr>))}</tbody>
            </table></div>)}
        </Panel>
        {sel ? (
          <Panel title={`#${sel.ref} · ${sel.full_name}`}>
            <div className="grid gap-3 text-sm">
              <div>{sel.cars?.model} · {sel.start_date} → {sel.end_date} · <b>{money(sel.estimate, t("currency"))}</b></div>
              <div className="flex flex-wrap gap-2">
                {sel.id_card_path ? <button className="btn-ghost" onClick={() => view(sel.id_card_path!)}><IdCard className="h-4 w-4" />{t("idPhoto")}</button> : null}
                {sel.license_path ? <button className="btn-ghost" onClick={() => view(sel.license_path!)}><FileText className="h-4 w-4" />{t("licensePhoto")}</button> : null}
              </div>
              {sel.status === "pending" && <div className="flex gap-2">
                <button disabled={busy} className="btn-primary" onClick={() => run(() => supabase.rpc("set_request_status", { p_id: sel.id, p_status: "accepted" }))}><Check className="h-4 w-4" />{t("accept")}</button>
                <button disabled={busy} className="btn-ghost" onClick={() => run(() => supabase.rpc("set_request_status", { p_id: sel.id, p_status: "cancelled" }))}><X className="h-4 w-4" />{t("refuse")}</button></div>}
              {sel.status === "accepted" && <div className="badge badge-info w-fit">{t("waitingDocs")}</div>}
              {(sel.status === "docs_sent" || sel.status === "accepted") && sel.license_path && sel.id_card_path &&
                <button disabled={busy} className="btn-primary" onClick={() => run(() => supabase.rpc("prepare_contract", { p_id: sel.id }))}><FileSignature className="h-4 w-4" />{t("prepareContract")}</button>}
              {sel.contract_id && <Link to="/$lang/app/contracts/$id" params={{ lang, id: sel.contract_id }} search={{ doc: "contract" }} className="btn-ghost w-fit"><FileText className="h-4 w-4" />{t("viewContract")}</Link>}
              {sel.status === "contract_ready" &&
                <button disabled={busy} className="btn-primary" onClick={() => run(() => supabase.rpc("approve_contract", { p_id: sel.id }))}><Send className="h-4 w-4" />{t("approveSend")}</button>}
              <h4 className="mt-3 font-extrabold">{t("history")}</h4>
              <ol className="grid gap-2 border-s border-border ps-3">
                {(sel.history ?? []).map((h, i) => (
                  <li key={i} className="text-xs"><b>{t(`st_${h.step}`)}</b> · {new Date(h.at).toLocaleString()}<div className="text-muted-foreground">{h.by}{h.role ? ` (${t(h.role)})` : ""}</div></li>))}
              </ol>
            </div>
          </Panel>
        ) : <Panel title={t("history")}><Empty /></Panel>}
      </div>
    </div>
  );
}
