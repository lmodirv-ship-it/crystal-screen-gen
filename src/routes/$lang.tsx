import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { dirOf, isLang } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (!isLang(params.lang)) throw notFound();
  },
  component: LangLayout,
});

function LangLayout() {
  const { lang } = Route.useParams();
  const l = isLang(lang) ? lang : "ar";
  useEffect(() => {
    document.documentElement.lang = l;
    document.documentElement.dir = dirOf(l);
  }, [l]);
  return (
    <AuthProvider>
      <div dir={dirOf(l)}>
        <Outlet />
      </div>
      <Toaster position="top-center" />
    </AuthProvider>
  );
}
