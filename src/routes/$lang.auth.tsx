import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { isLang, translator } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { Field } from "@/components/kit";
import { LangSwitch } from "@/components/LangSwitch";
import hero from "@/assets/hero-tangier.jpg";

export const Route = createFileRoute("/$lang/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — HN RentCar" },
      { name: "description", content: "Sign in to your HN RentCar space to manage bookings, contracts and payments." },
      { property: "og:title", content: "Sign in — HN RentCar" },
      { property: "og:description", content: "Access your HN RentCar space." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { lang } = Route.useParams();
  const l = isLang(lang) ? lang : "ar";
  const t = translator(l);
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/$lang/app", params: { lang: l }, replace: true });
  }, [ready, user, l, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      // Same email, one password per role: find which login this password belongs to before signing in.
      const { data: hit } = await supabase.rpc("resolve_role_login", { p_email: email, p_password: password });
      const login = hit?.[0]?.login ?? email;
      const { error } = await supabase.auth.signInWithPassword({ email: login, password });
      if (error) toast.error(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { emailRedirectTo: `${window.location.origin}/${l}/app`, data: { full_name: name } },
      });
      if (error) toast.error(error.message);
      else if (!data.session) toast.success(t("checkEmail"));
    }
    setBusy(false);
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + `/${l}/auth` });
    if (r.error) toast.error(String(r.error.message ?? r.error));
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex flex-col justify-center p-6 md:p-12">
        <div className="mb-8 flex items-center justify-between">
          <BrandLogo lang={l} />
          <LangSwitch lang={l} />
        </div>
        <div className="mx-auto w-full max-w-sm">
          <h1 className="font-display text-3xl font-black">{mode === "in" ? t("signIn") : t("signUp")}</h1>
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "up" && <Field label={t("fullName")}><input className="input" value={name} onChange={(e) => setName(e.target.value)} required /></Field>}
            <Field label={t("email")}><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
            <Field label={t("password")}><input className="input" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
            <button className="btn-primary w-full" disabled={busy}>{mode === "in" ? t("signIn") : t("signUp")}</button>
          </form>
          <div className="my-4 text-center text-xs text-muted-foreground">{t("or")}</div>
          <button onClick={google} className="btn-ghost w-full">{t("google")}</button>
          <button onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-5 w-full text-sm font-bold text-primary">
            {mode === "in" ? t("noAccount") : t("haveAccount")}
          </button>
        </div>
      </div>
      <div className="relative hidden md:block">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover" width={1600} height={800} />
      </div>
    </div>
  );
}
