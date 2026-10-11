import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { dirOf, isLang } from "@/lib/i18n";
import { RoleProvider } from "@/lib/role-store";

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (!isLang(params.lang)) throw notFound();
  },
  component: LangLayout,
});

function LangLayout() {
  const { lang } = Route.useParams();
  const l = isLang(lang) ? lang : "en";
  useEffect(() => {
    document.documentElement.lang = l;
    document.documentElement.dir = dirOf(l);
  }, [l]);
  return (
    <RoleProvider>
      <div dir={dirOf(l)} className={l === "ar" ? "font-arabic" : ""}>
        <Outlet />
      </div>
    </RoleProvider>
  );
}
