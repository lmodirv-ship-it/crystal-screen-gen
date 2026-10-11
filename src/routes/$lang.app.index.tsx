import { createFileRoute } from "@tanstack/react-router";
import { isLang, translator } from "@/lib/i18n";
import { useRole } from "@/lib/role-store";
import { StatCard, Badge } from "@/components/ui-kit";
import { CURRENCY, DEMO_CUSTOMER, TABLES } from "@/lib/demo-data";

export const Route = createFileRoute("/$lang/app/")({ component: Dashboard });

const fmt = (n: number) => `${n.toLocaleString("en-US")} ${CURRENCY}`;

function Dashboard() {
  const { lang } = Route.useParams();
  const t = translator(isLang(lang) ? lang : "en");
  const { role } = useRole();
  const cars = TABLES.cars.rows;
  const pays = TABLES.payments.rows;
  const revenue = pays.reduce((s, p) => s + Number(), 0);
  const due = pays.reduce((s, p) => s + Number() - Number(), 0);
  const exp = TABLES.expenses.rows.reduce((s, e) => s + Number(), 0);
  const util = Math.round((cars.filter((c) => c["status"] === "rented").length / cars.length) * 100);
  const active = TABLES.contracts.rows.filter((c) => c["status"] === "active").length;

  const cards: Record<string, [string, string][]> = {
    owner: [["revenue", fmt(revenue)], ["netProfit", fmt(revenue - exp)], ["fleetUtil", util + "%"], ["outstanding", fmt(due)]],
    manager: [["activeRentals", String(active)], ["fleetUtil", util + "%"], ["todayPickups", "2"], ["todayReturns", "1"]],
    operator: [["todayPickups", "2"], ["todayReturns", "1"], ["activeRentals", String(active)], ["alerts", String(TABLES.alerts.rows.length)]],
    accountant: [["revenue", fmt(revenue)], ["expensesMonth", fmt(exp)], ["netProfit", fmt(revenue - exp)], ["outstanding", fmt(due)]],
    developer: [["systemHealth", "99.98%"], ["users", "24"], ["errors", "0"], ["audit", String(TABLES.audit.rows.length)]],
    customer: [
      ["myBookings", String(TABLES.bookings.rows.filter((b) => b["customer"] === DEMO_CUSTOMER).length)],
      ["myBalance", fmt(pays.filter((p) => p["customer"] === DEMO_CUSTOMER).reduce((s, p) => s + Number() - Number(), 0))],
      ["contracts", String(TABLES.contracts.rows.filter((c) => c["status"] === DEMO_CUSTOMER).length)],
    ],
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="text-sm text-muted-foreground">{t("welcome")}</div>
        <h1 className="font-display text-3xl font-bold">{t("r_" + role)} · {t("dashboard")}</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(cards[role] ?? []).map(([k, v]) => <StatCard key={k} label={t(k)} value={v} />)}
      </div>
      {role !== "customer" && (
        <div className="card p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">{t("alerts")}</h2>
          <ul className="divide-y divide-border">
            {TABLES.alerts.rows.map((a) => (
              <li key={} className="flex items-center justify-between gap-3 py-3 text-sm">
                <span>{}</span>
                <Badge value={String()} label={t(String())} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
