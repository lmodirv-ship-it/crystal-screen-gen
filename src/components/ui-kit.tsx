import type { ReactNode } from "react";

const tone: Record<string, string> = {
  available: "badge-success", paid: "badge-success", completed: "badge-success", verified: "badge-success", done: "badge-success", closed: "badge-muted",
  rented: "badge-info", confirmed: "badge-info", active: "badge-info", open: "badge-info", scheduled: "badge-info",
  pending: "badge-warn", partial: "badge-warn", medium: "badge-warn", maintenance: "badge-warn",
  cancelled: "badge-danger", unpaid: "badge-danger", expired: "badge-danger", high: "badge-danger", low: "badge-muted",
};

export function Badge({ value, label }: { value: string; label: string }) {
  return <span className={`badge ${tone[value] ?? "badge-muted"}`}>{label}</span>;
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-2xl font-semibold">{value}</div>
      {hint && <div className="mt-1 text-xs text-accent">{hint}</div>}
    </div>
  );
}
