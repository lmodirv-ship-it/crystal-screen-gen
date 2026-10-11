import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { FileImage, FolderOpen, Upload, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { canRead, canWrite } from "@/lib/rbac";
import { useAuth } from "@/lib/auth";
import { useRows, useSave } from "@/lib/data";
import { Badge, Empty, Field, NoAccess, PageHead, Panel, useLang } from "@/components/kit";

export const Route = createFileRoute("/$lang/app/documents")({ component: DocumentsPage });

const TYPES = ["license", "id_card", "car_photo", "contract_doc", "other"];

function DocumentsPage() {
  const { t } = useLang();
  const { role, user } = useAuth();
  const qc = useQueryClient();
  const { data: docs = [] } = useRows("documents", "*, customers(full_name), cars(model)");
  const { data: customers = [] } = useRows("customers", "id, full_name, created_at");
  const { data: cars = [] } = useRows("cars", "id, model, plate, created_at");
  const save = useSave("documents", t("saved"));
  const [form, setForm] = useState({ title: "", doc_type: "license", customer_id: "", car_id: "" });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  if (!role || !canRead(role, "documents")) return <NoAccess />;
  const staff = role !== "customer";

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;
    setBusy(true);
    const path = `${user.id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const up = await supabase.storage.from("documents").upload(path, file);
    if (up.error) { toast.error(up.error.message); setBusy(false); return; }
    let customer_id: string | null = form.customer_id || null;
    if (!staff) customer_id = (await supabase.rpc("my_customer_id")).data ?? null;
    const { error } = await supabase.from("documents").insert({
      title: form.title || file.name, doc_type: form.doc_type, file_path: path, customer_id, car_id: form.car_id || null,
      uploaded_by: user.id, status: staff ? "verified" : "pending",
    });
    if (error) toast.error(error.message); else { toast.success(t("saved")); setFile(null); setForm({ ...form, title: "" }); qc.invalidateQueries(); }
    setBusy(false);
  };

  const open = async (path: string) => {
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 300);
    if (error) toast.error(error.message); else window.open(data.signedUrl, "_blank", "noopener");
  };

  return (
    <div>
      <PageHead title={t(staff ? "documents" : "myDocuments")} icon={<FolderOpen className="h-6 w-6" />} />
      <div className="grid gap-5 xl:grid-cols-3">
        {canWrite(role, "documents") && (
          <Panel title={t("uploadDoc")}>
            <form onSubmit={upload} className="space-y-4">
              <Field label={t("title")}><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
              <Field label={t("type")}><select className="input" value={form.doc_type} onChange={(e) => setForm({ ...form, doc_type: e.target.value })}>{TYPES.map((x) => <option key={x} value={x}>{t(x)}</option>)}</select></Field>
              {staff && <Field label={t("customer")}><select className="input" value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}><option value="">—</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}</select></Field>}
              {staff && <Field label={t("car")}><select className="input" value={form.car_id} onChange={(e) => setForm({ ...form, car_id: e.target.value })}><option value="">—</option>{cars.map((c) => <option key={c.id} value={c.id}>{c.model} · {c.plate}</option>)}</select></Field>}
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border p-6 text-center text-sm text-muted-foreground hover:bg-muted/40">
                <Upload className="h-6 w-6 text-primary" />{file ? file.name : "PDF / JPG / PNG — max 10MB"}
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              </label>
              <button className="btn-primary w-full" disabled={!file || busy}>{t("upload")}</button>
            </form>
          </Panel>
        )}
        <Panel title={t("documents")} className="xl:col-span-2">
          {docs.length === 0 ? <Empty /> : (
            <div className="grid gap-3 sm:grid-cols-2">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                  <span className="tile h-11 w-11 tile-cyan"><FileImage className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1 text-sm">
                    <div className="truncate font-bold">{d.title}</div>
                    <div className="text-xs text-muted-foreground">{t(d.doc_type)} · {d.customers?.full_name ?? d.cars?.model ?? "—"}</div>
                    <div className="mt-1 flex items-center gap-2">
                      {staff && canWrite(role, "documents") ? (
                        <select className="input w-auto py-0.5 text-xs" value={d.status} onChange={(e) => save.mutate({ id: d.id, values: { status: e.target.value } })}>
                          {["pending", "verified", "rejected"].map((s) => <option key={s} value={s}>{t(s)}</option>)}
                        </select>
                      ) : <Badge value={d.status} />}
                    </div>
                  </div>
                  <button className="btn-ghost p-2" onClick={() => open(d.file_path)} aria-label="open"><ExternalLink className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
