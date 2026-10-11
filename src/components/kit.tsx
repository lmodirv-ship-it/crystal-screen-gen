import { useParams } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { isLang, translator, type Lang } from "@/lib/i18n";

export function useLang(): { lang: Lang; t: (k: string) => string } {
  const p = useParams({ strict: false }) as { lang?: string };
  const lang: Lang = p.lang && isLang(p.lang) ? p.lang : "ar";
  return { lang, t: translator(lang) };
}

const tone: Record<string, string> = {
  available: "badge-success", paid: "badge-success", completed: "badge-success", verified: "badge-success", done: "badge-success", confirmed: "badge-success", active: "badge-success",
  rented: "badge-info", scheduled: "badge-info", closed: "badge-muted", in_progress: "badge-warn",
  pending: "badge-warn", medium: "badge-warn", maintenance: "badge-warn",
  cancelled: "badge-danger", overdue: "badge-danger", rejected: "badge-danger", blocked: "badge-danger", high: "badge-danger", low: "badge-muted",
};

export function Badge({ value }: { value: string }) {
  const { t } = useLang();
  return <span className={`badge ${tone[value] ?? "badge-muted"}`}>{t(value)}</span>;
}

export function StatTile({ icon, color, value, label, hint, up }: { icon: ReactNode; color: string; value: ReactNode; label: string; hint?: string; up?: boolean }) {
  return (
    <div className="card flex items-center gap-4 p-4">
      <div className={`tile ${color}`}>{icon}</div>
      <div className="min-w-0">
        <div className="font-display text-2xl font-extrabold leading-tight">{value}</div>
        <div className="truncate text-sm text-muted-foreground">{label}</div>
        {hint && <div className={`text-xs font-bold ${up === false ? "text-destructive" : "text-success"}`}>{hint}</div>}
      </div>
    </div>
  );
}

export function Panel({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-extrabold">{title}</h2>
        {action && <div className="text-sm font-semibold text-primary">{action}</div>}
      </div>
      {children}
    </section>
  );
}

export function PageHead({ title, sub, icon, children }: { title: string; sub?: string; icon?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {icon && <div className="tile tile-blue">{icon}</div>}
        <div>
          <h1 className="font-display text-3xl font-extrabold">{title}</h1>
          {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30" onClick={onClose}>
      <div className="h-full w-full max-w-md overflow-y-auto bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-2" aria-label="close"><X className="h-4 w-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function Empty() {
  const { t } = useLang();
  return <div className="py-8 text-center text-sm text-muted-foreground">{t("empty")}</div>;
}

export function NoAccess() {
  const { t } = useLang();
  return <div className="card p-10 text-center text-muted-foreground">{t("noAccess")}</div>;
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/60 text-xs text-muted-foreground">
            {head.map((h, i) => <th key={i} className="whitespace-nowrap px-3 py-2.5 text-start font-bold">{h}</th>)}
          </tr>
        </thead>
        <tbody className="[&_td]:whitespace-nowrap [&_td]:px-3 [&_td]:py-2.5 [&_tr]:border-b [&_tr]:border-border [&_tr:last-child]:border-0">{children}</tbody>
      </table>
    </div>
  );
}
