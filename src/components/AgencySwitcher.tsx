import { Building2 } from "lucide-react";
import { useRows } from "@/lib/data";
import { setActiveAgency, useActiveAgency } from "@/lib/agency";
import { useLang } from "@/components/kit";

export function AgencySwitcher() {
  const { t } = useLang();
  const active = useActiveAgency();
  const { data: list = [] } = useRows("agencies", "id, name, city", "name");
  return (
    <label className="flex items-center gap-2 rounded-xl border border-border bg-card px-2 py-1.5 text-sm">
      <Building2 className="h-4 w-4 text-primary" />
      <select aria-label={t("agencies")} className="max-w-[11rem] bg-transparent font-bold outline-none" value={active} onChange={(e) => setActiveAgency(e.target.value)}>
        <option value="">{t("allAgencies")}</option>
        {list.map((a) => <option key={a.id} value={a.id}>{a.name}{a.city ? ` — ${a.city}` : ""}</option>)}
      </select>
    </label>
  );
}
