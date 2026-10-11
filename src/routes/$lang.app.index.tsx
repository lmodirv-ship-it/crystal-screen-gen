import { createFileRoute, Link } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  BarChart3, Bell, Car, CalendarDays, CheckCircle2, Database, FilePlus2, FileText, Gauge, KeyRound, Lightbulb, Server, TrendingDown, TrendingUp, Upload, UserPlus, Users, Wallet, Wrench, Receipt, AlertTriangle,
} from "lucide-react";
import { useMemo } from "react";
import { useAuth } from "@/lib/auth";
import { useRows, money, type AnyRow } from "@/lib/data";
import { lastMonths, net, pctChange, remaining, sumByMonth } from "@/lib/finance";
import { carImage } from "@/lib/car-images";
import { locale } from "@/lib/i18n";
import { Badge, Empty, PageHead, Panel, StatTile, Table, useLang } from "@/components/kit";

export const Route = createFileRoute("/$lang/app/")({ component: Dashboard });

const COLORS = ["var(--primary)", "var(--destructive)", "var(--warn)", "var(--success)", "var(--violet)", "var(--cyan)"];

function useFinance() {
  const { lang } = useLang();
  const { data: pays = [] } = useRows("payments", "*, customers(full_name)", "paid_at");
  const { data: exps = [] } = useRows("expenses", "*", "spent_at");
  return useMemo(() => {
    const months = lastMonths(10);
    const inc = sumByMonth(pays.map((p) => ({ amount: p.amount, date: p.paid_at })), months);
    const exp = sumByMonth(exps.map((e) => ({ amount: e.amount, date: e.spent_at })), months);
    const fmt = (m: string) => new Date(m + "-01").toLocaleDateString(locale(lang), { month: "short" });
    const series = months.map((m) => ({ m: fmt(m), income: inc[m] ?? 0, expenses: exp[m] ?? 0, net: net(inc[m] ?? 0, exp[m] ?? 0) }));
    const cur = series[series.length - 1]!, prev = series[series.length - 2]!;
    return { pays, exps, series, cur, prev };
  }, [pays, exps, lang]);
}

function Dashboard() {
  const { role } = useAuth();
  if (role === "owner") return <OwnerDash />;
  if (role === "accountant") return <AccountantDash />;
  if (role === "developer") return <DeveloperDash />;
  if (role === "customer") return <CustomerDash />;
  return <ManagerDash />;
}

function IncomeChart({ series }: { series: AnyRow[] }) {
  const { t } = useLang();
  return (
    <div dir="ltr"><ResponsiveContainer width="100%" height={260}>
      <BarChart data={series}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="m" fontSize={12} />
        <YAxis fontSize={11} width={50} />
        <Tooltip />
        <Legend />
        <Bar dataKey="income" name={t("income")} fill="var(--success)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name={t("expenses")} fill="var(--destructive)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer></div>
  );
}

/* ───────────── OWNER ───────────── */
function OwnerDash() {
  const { t, lang } = useLang();
  const cur = t("currency");
  const f = useFinance();
  const { data: cars = [] } = useRows("cars");
  const { data: contracts = [] } = useRows("contracts", "*, payments(amount), cars(model)");
  const { data: customers = [] } = useRows("customers");
  const { data: roles = [] } = useRows("user_roles", "*", "role");
  const { data: profiles = [] } = useRows("profiles");
  const rented = cars.filter((c) => c.status === "rented").length;
  const util = cars.length ? Math.round((rented / cars.length) * 100) : 0;
  const active = contracts.filter((c) => c.status === "active").length;
  const overdue = contracts.filter((c) => c.status === "overdue").length;
  const debt = contracts.reduce((s, c) => s + remaining(c.total, c.payments ?? []), 0);
  const soon = cars.filter((c) => c.insurance_expiry && (new Date(c.insurance_expiry).getTime() - Date.now()) / 86400000 <= 15).length;
  const idle = cars.filter((c) => c.status === "available").length;
  const growth = pctChange(f.cur.income, f.prev.income);
  const netCur = net(f.cur.income, f.cur.expenses);

  const decisions = [
    overdue > 0 && { icon: AlertTriangle, tone: "tile-red", text: `${overdue} ${t("insight_overdue")}` },
    soon > 0 && { icon: AlertTriangle, tone: "tile-orange", text: `${soon} ${t("insight_insurance")}` },
    idle > 2 && { icon: Lightbulb, tone: "tile-violet", text: `${idle} ${t("insight_idle")}` },
    debt > 0 && { icon: Wallet, tone: "tile-blue", text: `${money(debt, cur)} ${t("insight_debt")}` },
    { icon: growth >= 0 ? TrendingUp : TrendingDown, tone: growth >= 0 ? "tile-green" : "tile-red", text: `${growth > 0 ? "+" : ""}${growth}% ${t("insight_growth")}` },
  ].filter(Boolean) as { icon: typeof AlertTriangle; tone: string; text: string }[];

  const staff = profiles.map((p) => ({ ...p, roles: roles.filter((r) => r.user_id === p.id).map((r) => r.role) })).filter((p) => p.roles.some((r: string) => r !== "customer"));

  return (
    <div className="space-y-5">
      <PageHead title={t("ownerTitle")} sub={t("dashSub")} icon={<BarChart3 className="h-6 w-6" />}>
        <div className="btn-ghost"><CalendarDays className="h-4 w-4" />{new Date().toLocaleDateString(locale(lang), { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
      </PageHead>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatTile icon={<Wallet />} color="tile-green" value={money(f.cur.income, cur)} label={t("incomeMonth")} hint={`${growth >= 0 ? "↑" : "↓"} ${growth}%`} up={growth >= 0} />
        <StatTile icon={<Receipt />} color="tile-red" value={money(f.cur.expenses, cur)} label={t("expensesMonth")} />
        <StatTile icon={netCur >= 0 ? <TrendingUp /> : <TrendingDown />} color={netCur >= 0 ? "tile-blue" : "tile-red"} value={money(netCur, cur)} label={`${t("netProfit")} · ${netCur >= 0 ? t("profit") : t("loss")}`} />
        <StatTile icon={<Gauge />} color="tile-orange" value={`${util}%`} label={t("fleetUtil")} />
        <StatTile icon={<FileText />} color="tile-violet" value={active} label={t("activeContracts")} />
        <StatTile icon={<Users />} color="tile-cyan" value={customers.length} label={t("totalCustomers")} />
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title={t("incomeVsExpenses")} className="xl:col-span-2"><IncomeChart series={f.series} /></Panel>
        <Panel title={t("monthCompare")}>
          <Table head={["", t("thisMonth"), t("lastMonth"), t("change")]}>
            {[["income", f.cur.income, f.prev.income], ["expenses", f.cur.expenses, f.prev.expenses], ["netProfit", f.cur.net, f.prev.net]].map(([k, a, b]) => {
              const p = pctChange(a as number, b as number);
              return <tr key={k as string}><td className="font-bold">{t(k as string)}</td><td>{money(a as number, "")}</td><td>{money(b as number, "")}</td><td className={p >= 0 ? "text-success font-bold" : "text-destructive font-bold"}>{p > 0 ? "+" : ""}{p}%</td></tr>;
            })}
          </Table>
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title={t("profitLoss")} className="xl:col-span-2">
          <div dir="ltr"><ResponsiveContainer width="100%" height={240}>
            <LineChart data={f.series}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="m" fontSize={12} /><YAxis fontSize={11} width={50} /><Tooltip />
              <Line type="monotone" dataKey="net" name={t("netProfit")} stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer></div>
        </Panel>
        <Panel title={t("decisions")}>
          <ul className="space-y-3">
            {decisions.map((d, i) => (
              <li key={i} className="flex items-center gap-3"><span className={`tile h-10 w-10 ${d.tone}`}><d.icon className="h-5 w-5" /></span><span className="text-sm font-semibold">{d.text}</span></li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel title={t("staff")} action={<Link to="/$lang/app/$module" params={{ lang, module: "settings" }}>{t("viewAll")}</Link>}>
        {staff.length ? (
          <Table head={[t("user"), t("role")]}>
            {staff.map((s) => <tr key={s.id}><td className="font-bold">{s.full_name}</td><td className="flex gap-1">{s.roles.map((r: string) => <span key={r} className="badge badge-info">{t("r_" + r)}</span>)}</td></tr>)}
          </Table>
        ) : <Empty />}
      </Panel>
    </div>
  );
}

/* ───────────── MANAGER / OPERATOR ───────────── */
function ManagerDash() {
  const { t, lang } = useLang();
  const { role } = useAuth();
  const { data: cars = [] } = useRows("cars");
  const { data: bookings = [] } = useRows("bookings", "*, customers(full_name), cars(model,category)", "start_date");
  const { data: contracts = [] } = useRows("contracts", "*, customers(full_name), cars(model)", "start_date");
  const { data: notes = [] } = useRows("notifications");
  const today = new Date().toISOString().slice(0, 10);
  const count = (s: string) => cars.filter((c) => c.status === s).length;
  const upcoming = bookings.filter((b) => b.start_date >= today && b.status !== "cancelled").slice(0, 5);
  const tasks = [
    ...contracts.filter((c) => c.end_date <= today && c.status !== "closed").map((c) => ({ k: c.id, text: `${t("return")} — ${c.cars?.model}`, sub: c.customers?.full_name, tone: "tile-red" })),
    ...bookings.filter((b) => b.start_date === today || (b.start_date > today && b.status === "pending")).map((b) => ({ k: b.id, text: `${t("bookings")} — ${b.cars?.model}`, sub: b.customers?.full_name, tone: "tile-blue" })),
  ].slice(0, 6);
  const quick: [typeof Car, string, string, string][] = [
    [FilePlus2, "createContract", "contracts/new", "text-success"],
    [CalendarDays, "bookings", "bookings", "text-primary"],
    [UserPlus, "addCustomer", "customers", "text-violet"],
    [Upload, "uploadDoc", "documents", "text-cyan"],
    [Wrench, "addMaintenance", "maintenance", "text-pink"],
    [Car, "cars", "cars", "text-warn"],
  ];
  return (
    <div className="space-y-5">
      <PageHead title={t(role === "operator" ? "operatorTitle" : "managerTitle")} sub={t("dashSub")} icon={<Gauge className="h-6 w-6" />} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile icon={<Car />} color="tile-blue" value={cars.length} label={t("totalCars")} />
        <StatTile icon={<CheckCircle2 />} color="tile-green" value={count("available")} label={t("availableNow")} />
        <StatTile icon={<KeyRound />} color="tile-orange" value={count("rented")} label={t("rentedNow")} />
        <StatTile icon={<Wrench />} color="tile-red" value={count("maintenance")} label={t("inMaintenance")} />
        <StatTile icon={<CalendarDays />} color="tile-violet" value={upcoming.length} label={t("upcomingBookings")} />
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title={t("todayTasks")}>
          {tasks.length ? <ul className="space-y-3">{tasks.map((x) => <li key={x.k} className="flex items-center gap-3"><span className={`tile h-10 w-10 ${x.tone}`}><CalendarDays className="h-4 w-4" /></span><div className="text-sm"><div className="font-bold">{x.text}</div><div className="text-muted-foreground">{x.sub}</div></div></li>)}</ul> : <Empty />}
        </Panel>
        <Panel title={t("quickActions")}>
          <div className="grid grid-cols-3 gap-3">
            {quick.map(([I, k, to, c]) => (
              <Link key={k} to={`/${lang}/app/${to}` as "/"} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/40 p-3 text-center text-xs font-bold hover:bg-accent">
                <I className={`h-6 w-6 ${c}`} />{t(k)}
              </Link>
            ))}
          </div>
        </Panel>
        <Panel title={t("upcomingBookings")} action={<Link to="/$lang/app/$module" params={{ lang, module: "bookings" }}>{t("viewAll")}</Link>}>
          {upcoming.length ? <ul className="space-y-3">{upcoming.map((b) => (
            <li key={b.id} className="flex items-center gap-3">
              <img src={carImage(b.cars?.category)} alt="" loading="lazy" width={992} height={672} className="h-12 w-20 object-contain" />
              <div className="flex-1 text-sm"><div className="font-bold">{b.cars?.model}</div><div className="text-muted-foreground">{b.customers?.full_name} · {b.start_date}</div></div>
              <Badge value={b.status} />
            </li>))}</ul> : <Empty />}
        </Panel>
      </div>
      <Panel title={t("fleetStatus")} action={<Link to="/$lang/app/$module" params={{ lang, module: "cars" }}>{t("viewAll")}</Link>}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {cars.slice(0, 6).map((c) => (
            <div key={c.id} className="rounded-xl border border-border p-3">
              <div className="flex justify-end"><Badge value={c.status} /></div>
              <img src={carImage(c.category)} alt={c.model} loading="lazy" width={992} height={672} className="mx-auto h-20 object-contain" />
              <div className="mt-1 font-bold">{c.model}</div>
              <div className="text-xs text-muted-foreground" dir="ltr">{c.plate}</div>
              <div className="mt-1 font-black text-primary">{c.price_per_day} {t("perDay")}</div>
            </div>
          ))}
        </div>
      </Panel>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title={t("activeContracts")}>
          <Table head={["#", t("customer"), t("car"), t("from"), t("to"), t("status")]}>
            {contracts.slice(0, 6).map((c) => <tr key={c.id}><td>#{c.ref}</td><td>{c.customers?.full_name}</td><td>{c.cars?.model}</td><td>{c.start_date}</td><td>{c.end_date}</td><td><Badge value={c.status} /></td></tr>)}
          </Table>
        </Panel>
        <NotesPanel notes={notes} />
      </div>
    </div>
  );
}

function NotesPanel({ notes }: { notes: AnyRow[] }) {
  const { t, lang } = useLang();
  return (
    <Panel title={t("notifications")} action={<Link to="/$lang/app/$module" params={{ lang, module: "notifications" }}>{t("viewAll")}</Link>}>
      {notes.length ? <ul className="space-y-3">{notes.slice(0, 5).map((n) => (
        <li key={n.id} className="flex items-center gap-3"><span className="tile h-10 w-10 tile-blue"><Bell className="h-4 w-4" /></span>
          <div className="flex-1 text-sm"><div className="font-bold">{t(n.title)}</div><div className="text-muted-foreground">{n.body}</div></div><Badge value={n.priority} /></li>))}</ul> : <Empty />}
    </Panel>
  );
}

/* ───────────── ACCOUNTANT ───────────── */
function AccountantDash() {
  const { t } = useLang();
  const cur = t("currency");
  const f = useFinance();
  const { data: contracts = [] } = useRows("contracts", "*, customers(full_name), payments(amount)");
  const debts = contracts.map((c) => ({ ...c, rest: remaining(c.total, c.payments ?? []) })).filter((c) => c.rest > 0);
  const split = Object.entries(f.exps.filter((e) => e.spent_at.slice(0, 7) === new Date().toISOString().slice(0, 7)).reduce<Record<string, number>>((a, e) => ({ ...a, [e.category]: (a[e.category] ?? 0) + Number(e.amount) }), {})).map(([k, v]) => ({ name: t(k), value: v }));
  const methods = ["cash", "transfer", "card", "cheque"].map((m) => ({ m, v: f.pays.filter((p) => p.method === m).reduce((s, p) => s + Number(p.amount), 0) }));
  const totalM = methods.reduce((s, x) => s + x.v, 0) || 1;
  const growth = pctChange(f.cur.income, f.prev.income);
  return (
    <div className="space-y-5">
      <PageHead title={t("accountantTitle")} sub={t("dashSub")} icon={<Receipt className="h-6 w-6" />} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={<Wallet />} color="tile-green" value={money(f.cur.income, cur)} label={t("incomeMonth")} hint={`${growth}%`} up={growth >= 0} />
        <StatTile icon={<Receipt />} color="tile-blue" value={money(f.cur.expenses, cur)} label={t("expensesMonth")} />
        <StatTile icon={<TrendingUp />} color="tile-violet" value={money(f.cur.net, cur)} label={t("netProfit")} />
        <StatTile icon={<AlertTriangle />} color="tile-orange" value={debts.length} label={t("debts")} />
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title={t("incomeVsExpenses")} className="xl:col-span-2"><IncomeChart series={f.series} /></Panel>
        <Panel title={t("expenseSplit")}>
          {split.length ? (
            <div dir="ltr"><ResponsiveContainer width="100%" height={260}>
              <PieChart><Pie data={split} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95}>{split.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
            </ResponsiveContainer></div>
          ) : <Empty />}
        </Panel>
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title={t("latestPayments")}>
          <Table head={[t("date"), t("customer"), t("amount"), t("method")]}>
            {f.pays.slice(0, 6).map((p) => <tr key={p.id}><td>{p.paid_at}</td><td>{p.customers?.full_name}</td><td className="font-bold">{money(p.amount, cur)}</td><td><span className="badge badge-info">{t(p.method)}</span></td></tr>)}
          </Table>
        </Panel>
        <Panel title={t("latestExpenses")}>
          <Table head={[t("date"), t("type"), t("amount")]}>
            {f.exps.slice(0, 6).map((e) => <tr key={e.id}><td>{e.spent_at}</td><td>{t(e.category)}</td><td className="font-bold">{money(e.amount, cur)}</td></tr>)}
          </Table>
        </Panel>
        <Panel title={t("debts")}>
          <Table head={["#", t("customer"), t("remaining"), t("status")]}>
            {debts.slice(0, 6).map((d) => <tr key={d.id}><td>#{d.ref}</td><td>{d.customers?.full_name}</td><td className="font-bold text-destructive">{money(d.rest, cur)}</td><td><Badge value={d.status} /></td></tr>)}
          </Table>
        </Panel>
      </div>
      <Panel title={t("paymentMethods")}>
        <div className="grid gap-4 sm:grid-cols-4">
          {methods.map((x, i) => (
            <div key={x.m} className="rounded-xl border border-border p-4">
              <div className="text-sm font-bold">{t(x.m)}</div>
              <div className="font-display text-xl font-black">{money(x.v, cur)}</div>
              <div className="mt-2 h-2 rounded-full bg-muted"><div className="h-2 rounded-full" style={{ width: `${(x.v / totalM) * 100}%`, background: COLORS[(i + 3) % COLORS.length] }} /></div>
              <div className="mt-1 text-xs text-muted-foreground">{Math.round((x.v / totalM) * 100)}%</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ───────────── DEVELOPER ───────────── */
function DeveloperDash() {
  const { t } = useLang();
  const { data: roles = [] } = useRows("user_roles", "*", "role");
  const { data: profiles = [] } = useRows("profiles");
  const { data: cars = [] } = useRows("cars");
  const { data: docs = [] } = useRows("documents");
  const { data: bookings = [] } = useRows("bookings");
  const { data: notes = [] } = useRows("notifications");
  const { data: logs = [] } = useRows("audit_logs");
  const { data: contracts = [] } = useRows("contracts");
  const { data: pays = [] } = useRows("payments");
  const tables: [string, number][] = [["profiles", profiles.length], ["user_roles", roles.length], ["cars", cars.length], ["bookings", bookings.length], ["contracts", contracts.length], ["payments", pays.length], ["documents", docs.length], ["audit_logs", logs.length]];
  const services = ["Website", "API / Server functions", "Database", "Storage", "Auth"];
  return (
    <div className="space-y-5">
      <PageHead title={t("developerTitle")} sub={t("dashSub")} icon={<Server className="h-6 w-6" />} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatTile icon={<Users />} color="tile-blue" value={profiles.length} label={t("users")} />
        <StatTile icon={<Car />} color="tile-green" value={cars.length} label={t("cars")} />
        <StatTile icon={<FileText />} color="tile-violet" value={docs.length} label={t("documents")} />
        <StatTile icon={<CalendarDays />} color="tile-orange" value={bookings.length} label={t("bookings")} />
        <StatTile icon={<Bell />} color="tile-pink" value={notes.length} label={t("notifications")} />
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Panel title={t("services")}>
          <ul className="space-y-3">{services.map((s) => <li key={s} className="flex items-center justify-between text-sm"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-success" />{s}</span><span className="badge badge-success">{t("online")}</span></li>)}</ul>
        </Panel>
        <Panel title={t("dbTables")}>
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-accent p-3 font-bold"><Database className="h-5 w-5 text-primary" />PostgreSQL · <span className="badge badge-success">{t("online")}</span></div>
          <Table head={["table", t("rows")]}>{tables.map(([n, c]) => <tr key={n}><td dir="ltr" className="font-mono text-xs">{n}</td><td>{c}</td></tr>)}</Table>
        </Panel>
        <Panel title={t("users")}>
          <Table head={[t("user"), t("role")]}>
            {profiles.map((p) => <tr key={p.id}><td className="font-bold">{p.full_name}</td><td className="flex flex-wrap gap-1">{roles.filter((r) => r.user_id === p.id).map((r) => <span key={r.id} className="badge badge-info">{t("r_" + r.role)}</span>)}</td></tr>)}
          </Table>
        </Panel>
      </div>
      <Panel title={t("systemLogs")}>
        <div className="console max-h-80 overflow-y-auto p-4 text-xs" dir="ltr">
          {logs.length ? logs.slice(0, 40).map((g) => (
            <div key={g.id} className="py-0.5"><span className={g.action === "delete" ? "text-destructive" : g.action === "update" ? "text-warn" : "text-success"}>[{g.action.toUpperCase()}]</span> {new Date(g.created_at).toLocaleString()} — {g.entity} <span className="opacity-60">{g.entity_id?.slice(0, 8)}</span></div>
          )) : <div className="opacity-60">no logs yet</div>}
        </div>
      </Panel>
    </div>
  );
}

/* ───────────── CUSTOMER ───────────── */
const STEPS = ["pending", "confirmed", "active", "completed"];
function CustomerDash() {
  const { t, lang } = useLang();
  const cur = t("currency");
  const { data: bookings = [] } = useRows("bookings", "*, cars(model,category)", "start_date");
  const { data: contracts = [] } = useRows("contracts", "*, cars(model), payments(amount)");
  const { data: pays = [] } = useRows("payments", "*", "paid_at");
  const { data: notes = [] } = useRows("notifications");
  const balance = contracts.reduce((s, c) => s + remaining(c.total, c.payments ?? []), 0);
  const latest = bookings[0];
  const stepIdx = latest ? (latest.status === "cancelled" ? -1 : contracts.some((c) => c.booking_id === latest.id && c.status === "closed") ? 3 : contracts.some((c) => c.booking_id === latest.id) ? 2 : STEPS.indexOf(latest.status)) : -1;
  return (
    <div className="space-y-5">
      <PageHead title={t("customerTitle")} sub={t("welcome")} icon={<Users className="h-6 w-6" />}>
        <Link to="/$lang/app/$module" params={{ lang, module: "bookings" }} className="btn-primary"><CalendarDays className="h-4 w-4" />{t("requestBooking")}</Link>
        <Link to="/$lang/app/$module" params={{ lang, module: "documents" }} className="btn-ghost"><Upload className="h-4 w-4" />{t("uploadDoc")}</Link>
      </PageHead>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={<CalendarDays />} color="tile-blue" value={bookings.length} label={t("myBookings")} />
        <StatTile icon={<FileText />} color="tile-violet" value={contracts.length} label={t("myContracts")} />
        <StatTile icon={<Wallet />} color="tile-green" value={money(pays.reduce((s, p) => s + Number(p.amount), 0), cur)} label={t("myPayments")} />
        <StatTile icon={<AlertTriangle />} color={balance > 0 ? "tile-red" : "tile-green"} value={money(balance, cur)} label={t("myBalance")} />
      </div>
      <Panel title={t("tracker")}>
        {latest ? (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <img src={carImage(latest.cars?.category)} alt="" width={992} height={672} className="h-14 w-24 object-contain" />
              <div><div className="font-bold">{latest.cars?.model}</div><div className="text-sm text-muted-foreground">{latest.start_date} → {latest.end_date}</div></div>
              <div className="ms-auto"><Badge value={latest.status} /></div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {STEPS.map((s, i) => (
                <div key={s} className="text-center">
                  <div className={`h-2 rounded-full ${i <= stepIdx ? "bg-primary" : "bg-muted"}`} />
                  <div className={`mt-2 text-xs font-bold ${i <= stepIdx ? "text-primary" : "text-muted-foreground"}`}>{t(s)}</div>
                </div>
              ))}
            </div>
          </div>
        ) : <Empty />}
      </Panel>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title={t("myContracts")}>
          <Table head={["#", t("car"), t("from"), t("to"), t("total"), t("remaining"), t("status")]}>
            {contracts.map((c) => <tr key={c.id}><td>#{c.ref}</td><td>{c.cars?.model}</td><td>{c.start_date}</td><td>{c.end_date}</td><td>{money(c.total, cur)}</td><td className="font-bold text-destructive">{money(remaining(c.total, c.payments ?? []), cur)}</td><td><Badge value={c.status} /></td></tr>)}
          </Table>
        </Panel>
        <NotesPanel notes={notes} />
      </div>
    </div>
  );
}
