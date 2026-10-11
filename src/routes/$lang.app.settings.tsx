import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Settings, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { canRead, canWrite, MODULES, PERMISSIONS, ROLES, type Role } from "@/lib/rbac";
import { useAuth } from "@/lib/auth";
import { useRows } from "@/lib/data";
import { NoAccess, PageHead, Panel, Table, useLang } from "@/components/kit";

export const Route = createFileRoute("/$lang/app/settings")({ component: SettingsPage });

function SettingsPage() {
  const { t } = useLang();
  const { role, user, refresh } = useAuth();
  const qc = useQueryClient();
  const { data: profiles = [] } = useRows("profiles");
  const { data: roles = [] } = useRows("user_roles", "*", "role");
  const [pick, setPick] = useState<Record<string, Role>>({});
  if (!role || !canRead(role, "settings")) return <NoAccess />;
  // Only developers may grant the developer role.
  const grantable = ROLES.filter((r) => role === "developer" || r !== "developer");

  const add = async (uid: string) => {
    const r = pick[uid] ?? "operator";
    const { error } = await supabase.from("user_roles").insert({ user_id: uid, role: r });
    if (error) toast.error(error.message); else { toast.success(t("saved")); qc.invalidateQueries(); if (uid === user?.id) refresh(); }
  };
  const remove = async (id: string, uid: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) toast.error(error.message); else { qc.invalidateQueries(); if (uid === user?.id) refresh(); }
  };

  return (
    <div className="space-y-5">
      <PageHead title={t("settings")} icon={<Settings className="h-6 w-6" />} />
      <Panel title={t("staff")}>
        <Table head={[t("user"), t("phone"), t("role"), t("addRole")]}>
          {profiles.map((p) => (
            <tr key={p.id}>
              <td className="font-bold">{p.full_name}{p.id === user?.id && <span className="ms-2 text-xs text-muted-foreground">(you)</span>}</td>
              <td>{p.phone ?? "—"}</td>
              <td>
                <div className="flex flex-wrap gap-1">
                  {roles.filter((r) => r.user_id === p.id).map((r) => (
                    <span key={r.id} className="badge badge-info gap-1">{t("r_" + r.role)}
                      {(role === "developer" || r.role !== "developer") && <button onClick={() => remove(r.id, p.id)} aria-label="remove"><X className="h-3 w-3" /></button>}
                    </span>
                  ))}
                </div>
              </td>
              <td>
                <div className="flex gap-2">
                  <select className="input w-auto py-1 text-xs" value={pick[p.id] ?? "operator"} onChange={(e) => setPick({ ...pick, [p.id]: e.target.value as Role })}>
                    {grantable.map((r) => <option key={r} value={r}>{t("r_" + r)}</option>)}
                  </select>
                  <button className="btn-soft py-1 text-xs" onClick={() => add(p.id)}>{t("addRole")}</button>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
      <Panel title={t("permissions")}>
        <Table head={[t("role"), ...MODULES.map((m) => t(m))]}>
          {ROLES.map((r) => (
            <tr key={r}>
              <td className="font-bold">{t("r_" + r)}</td>
              {MODULES.map((m) => (
                <td key={m}>{canWrite(r, m) ? <span className="badge badge-success">{t("write")}</span> : PERMISSIONS[r].read.includes(m) ? <span className="badge badge-info">{t("read")}</span> : <span className="text-muted-foreground">—</span>}</td>
              ))}
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
