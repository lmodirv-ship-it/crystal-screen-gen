import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { isLang, translator } from "@/lib/i18n";
import { PERMISSIONS, ROLES, type Role } from "@/lib/rbac";
import { useRole } from "@/lib/role-store";
import { LangSwitch } from "@/components/LangSwitch";

export const Route = createFileRoute("/$lang/app")({
  head: () => ({
    meta: [
      { title: "Dashboard — HN RentCar" },
      { name: "description", content: "Role-based workspace for managing the HN RentCar agency." },
      { property: "og:title", content: "Dashboard — HN RentCar" },
      { property: "og:description", content: "Role-based workspace for managing the HN RentCar agency." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AppShell,
});

function AppShell() {
  const { lang } = Route.useParams();
  const l = isLang(lang) ? lang : "en";
  const t = translator(l);
  const { role, setRole } = useRole();
  const [open, setOpen] = useState(false);
  const mods = PERMISSIONS[role].read;

  const nav = (
    <nav className="flex flex-col gap-1">
      {mods.map((m) =>
        m === "dashboard" ? (
          <Link key={m} to="/$lang/app" params={{ lang: l }} activeOptions={{ exact: true }} onClick={() => setOpen(false)} className="nav-link" activeProps={{ className: "nav-link-active" }}>{t(m)}</Link>
        ) : (
          <Link key={m} to="/$lang/app/$module" params={{ lang: l, module: m }} onClick={() => setOpen(false)} className="nav-link" activeProps={{ className: "nav-link-active" }}>{t(m)}</Link>
        ),
      )}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sidebar hidden w-64 shrink-0 border-e border-sidebar-border p-4 md:block">
        <Link to="/$lang" params={{ lang: l }} className="mb-6 block px-3 font-display text-lg font-bold">HN <span className="text-accent">RentCar</span></Link>
        {nav}
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-background/70" />
          <aside className="sidebar absolute inset-y-0 start-0 w-64 p-4" onClick={(e) => e.stopPropagation()}>{nav}</aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <button className="btn-ghost md:hidden" onClick={() => setOpen(true)} aria-label="menu">☰</button>
          <div className="flex flex-1 items-center justify-end gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              {t("role")}
              <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="input w-auto py-1.5">
                {ROLES.map((r) => <option key={r} value={r}>{t("r_" + r)}</option>)}
              </select>
            </label>
            <LangSwitch lang={l} />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          {role === "visitor" ? (
            <div className="card p-8 text-center">
              <p className="text-muted-foreground">{t("noAccess")}</p>
              <Link to="/$lang" params={{ lang: l }} className="btn-primary mt-4 inline-flex">{t("home")}</Link>
            </div>
          ) : <Outlet />}
        </main>
      </div>
    </div>
  );
}
