import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3 } from "lucide-react";
import { canRead } from "@/lib/rbac";
import { useAuth } from "@/lib/auth";
import { useRows, money } from "@/lib/data";
import { lastMonths, net, pctChange, sumByMonth } from "@/lib/finance";
import { locale } from "@/lib/i18n";
import { NoAccess, PageHead, Panel, Table, useLang } from "@/components/kit";

export const Route = createFileRoute("/$lang/app/reports")({ component: Reports });
const COLORS = ["var(--primary)", "var(--success)", "var(--warn)", "var(--destructive)", "var(--violet)"];

function Reports() {
  const { t, lang } = useLang();
  const { role } = useAuth();
  const { data: pays = [] } = useRows("payments", "*", "paid_at");
  const { data: exps = [] } = useRows("expenses", "*", "spent_at");
  const { data: contracts = [] } = useRows("contracts", "*, cars(model)");
  const { data: bookings = [] } = useRows("bookings");
  const cur = t("currency");
  const data = useMemo(() => {
    const months = lastMonths(12);
    const inc = sumByMonth(pays.map((p) => ({ amount: p.amount, date: p.paid_at })), months);
    const exp = sumByMonth(exps.map((e) => ({ amount: e.amount, date: e.spent_at })), months);
    const rows = months.map((m) => ({ key: m, m: new Date(m + "-01").toLocaleDateString(locale(lang), { month: "short", year: "2-digit" }), income: inc[m] ?? 0, expenses: exp[m] ?? 0, net: net(inc[m] ?? 0, exp[m] ?? 0) }));
    const byCar = Object.entries(contracts.reduce<Record<string, number>>((a, c) => ({ ...a, [c.cars?.model ?? "?"]: (a[c.cars?.model ?? "?"] ?? 0) + Number(c.total) }), {})).map(([name, v]) => ({ name, v })).sort((a, b) => b.v - a.v).slice(0, 6);
    const byStatus = Object.entries(bookings.reduce<Record<string, number>>((a, b) => ({ ...a, [b.status]: (a[b.status] ?? 0) + 1 }), {})).map(([k, v]) => ({ name: t(k), value: v }));
    return { rows, byCar, byStatus };
  }, [pays, exps, contracts, bookings, lang, t]);
  if (!role || !canRead(role, "reports")) return <NoAccess />;
  const totals = data.rows.reduce((a, r) => ({ income: a.income + r.income, expenses: a.expenses + r.expenses }), { income: 0, expenses: 0 });

  return (
    <div className="space-y-5">
      <PageHead title={t("reports")} icon={<BarChart3 className="h-6 w-6" />}>
        <button className="btn-ghost" onClick={() => window.print()}>PDF</button>
      </PageHead>
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title={t("profitLoss")} className="xl:col-span-2">
          <div dir="ltr"><ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="m" fontSize={11} /><YAxis fontSize={11} width={55} /><Tooltip /><Legend />
              <Bar dataKey="income" name={t("income")} fill="var(--success)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name={t("expenses")} fill="var(--destructive)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="net" name={t("netProfit")} fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer></div>
        </Panel>
        <Panel title={t("bookings")}>
          <div dir="ltr"><ResponsiveContainer width="100%" height={300}>
            <PieChart><Pie data={data.byStatus} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100}>{data.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
          </ResponsiveContainer></div>
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title={t("monthCompare")} className="xl:col-span-2">
          <Table head={[t("date"), t("income"), t("expenses"), t("netProfit"), t("change")]}>
            {[...data.rows].reverse().map((r, i, arr) => {
              const prev = arr[i + 1];
              const p = prev ? pctChange(r.net, prev.net) : 0;
              return (
                <tr key={r.key}>
                  <td className="font-bold">{r.m}</td><td>{money(r.income, cur)}</td><td>{money(r.expenses, cur)}</td>
                  <td className={r.net >= 0 ? "font-bold text-success" : "font-bold text-destructive"}>{money(r.net, cur)} · {r.net >= 0 ? t("profit") : t("loss")}</td>
                  <td>{prev ? `${p > 0 ? "+" : ""}${p}%` : "—"}</td>
                </tr>
              );
            })}
            <tr className="bg-muted/60 font-black"><td>{t("total")}</td><td>{money(totals.income, cur)}</td><td>{money(totals.expenses, cur)}</td><td>{money(totals.income - totals.expenses, cur)}</td><td /></tr>
          </Table>
        </Panel>
        <Panel title={t("topCars")}>
          <div dir="ltr"><ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.byCar} layout="vertical">
              <XAxis type="number" fontSize={11} /><YAxis type="category" dataKey="name" width={100} fontSize={11} /><Tooltip />
              <Bar dataKey="v" name={t("revenue")} fill="var(--primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer></div>
        </Panel>
      </div>
    </div>
  );
}
