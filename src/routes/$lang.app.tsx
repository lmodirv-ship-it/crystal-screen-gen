import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Bell, BarChart3, Building2, Car, CalendarDays, FileText, FolderOpen, Home, LogOut, Menu, Receipt, ScrollText, Search, Settings, Users, Wallet, Wrench,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { isLang, translator } from "@/lib/i18n";
import { PERMISSIONS, type Module } from "@/lib/rbac";
import { useAuth } from "@/lib/auth";
import { useRows } from "@/lib/data";
import { LangSwitch } from "@/components/LangSwitch";
import { BrandLogo } from "@/components/BrandLogo";

export const Route = createFileRoute("/$lang/app")({
  ssr: false,
  beforeLoad: async ({ params }) => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/$lang/auth", params: { lang: params.lang } });
  },
  head: () => ({
    meta: [
      { title: "Espace de gestion — HN RentCar" },
      { name: "description", content: "Role-based workspace for the HN RentCar agency." },
      { property: "og:title", content: "Espace de gestion — HN RentCar" },
      { property: "og:description", content: "Role-based workspace for the HN RentCar agency." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AppShell,
});

const ICONS: Record<Module, typeof Home> = {
  dashboard: Home, agencies: Building2, cars: Car, customers: Users, bookings: CalendarDays, contracts: FileText, payments: Wallet,
  expenses: Receipt, maintenance: Wrench, documents: FolderOpen, notifications: Bell, reports: BarChart3, settings: Settings, audit: ScrollText,
};
const CUSTOMER_LABEL: Partial<Record<Module, string>> = { bookings: "myBookings", contracts: "myContracts", payments: "myPayments", documents: "myDocuments" };

function AppShell() {
  const { lang } = Route.useParams();
  const l = isLang(lang) ? lang : "ar";
  const t = translator(l);
  const { user, role, ready } = useAuth();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: notes = [] } = useRows("notifications");
  const unread = notes.filter((n) => !n.is_read).length;
  // The address the workspace shows: every role login looks like the same one.
  const { data: shownEmail = "" } = useQuery({
    queryKey: ["display-email"],
    queryFn: async () => {
      const { data } = await supabase.rpc("my_display_email");
      return (data as string) ?? "";
    },
  });

  if (!ready || !role) return <div className="grid min-h-screen place-items-center text-muted-foreground">{t("loading")}</div>;
  const mods = PERMISSIONS[role].read;
  const label = (m: Module) => t(role === "customer" ? CUSTOMER_LABEL[m] ?? m : m);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/$lang/auth", params: { lang: l }, replace: true });
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="mb-5 px-2 text-center">
        <div className="flex justify-center"><BrandLogo lang={l} withText={false} size={56} /></div>
        <div className="mt-1 text-xs opacity-60">{t("appTag")}</div>
      </div>
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-sidebar-accent p-3">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-primary font-black text-primary-foreground">{(shownEmail || user?.email || "?")[0]?.toUpperCase()}</div>
        <div className="min-w-0 text-sm">
          <div className="truncate font-bold">{user?.user_metadata?.["full_name"] ?? shownEmail ?? user?.email}</div>
          {shownEmail && <div className="truncate text-xs opacity-60">{shownEmail}</div>}
          <div className="opacity-70">{t("r_" + role)}</div>
          <div className="flex items-center gap-1 text-xs text-success"><span className="h-2 w-2 rounded-full bg-success" />{t("online")}</div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {mods.map((m) => {
          const Icon = ICONS[m];
          const inner = (<><span className="nav-ic"><Icon className="h-[18px] w-[18px]" /></span><span className="flex-1">{label(m)}</span>{m === "notifications" && unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-xs text-primary-foreground">{unread}</span>}</>);
          return m === "dashboard" ? (
            <Link key={m} to="/$lang/app" params={{ lang: l }} activeOptions={{ exact: true }} onClick={() => setOpen(false)} className="nav-link" activeProps={{ className: "nav-link-active" }}>{inner}</Link>
          ) : (
            <Link key={m} to="/$lang/app/$module" params={{ lang: l, module: m }} onClick={() => setOpen(false)} className="nav-link" activeProps={{ className: "nav-link-active" }}>{inner}</Link>
          );
        })}
      </nav>
      <button onClick={signOut} className="nav-link mt-3 border border-sidebar-border"><span className="nav-ic"><LogOut className="h-[18px] w-[18px] text-destructive" /></span>{t("signOut")}</button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-sidebar p-4 text-sidebar-foreground lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-foreground/40" />
          <aside className="absolute inset-y-0 start-0 w-72 bg-sidebar p-4 text-sidebar-foreground" onClick={(e) => e.stopPropagation()}>{sidebar}</aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur">
          <button className="btn-ghost p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="menu"><Menu className="h-5 w-5" /></button>
          <div className="relative hidden max-w-xl flex-1 md:block">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input className="input ps-9" placeholder={t("search")} />
          </div>
          <div className="ms-auto flex items-center gap-2">
            <LangSwitch lang={l} />
            <Link to="/$lang/app/$module" params={{ lang: l, module: "notifications" }} className="btn-ghost relative p-2" aria-label="notifications">
              <Bell className="h-5 w-5" />
              {unread > 0 && <span className="absolute -end-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-xs text-primary-foreground">{unread}</span>}
            </Link>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
