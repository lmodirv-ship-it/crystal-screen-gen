import { useEffect, useState } from "react";
import { Eye, UserCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { translator, type Lang } from "@/lib/i18n";

/** Top stats strip: visitor counter (starts at 10000), registered users, online now. */
export function StatsBar({ lang }: { lang: Lang }) {
  const t = translator(lang);
  const [visitors, setVisitors] = useState<number>(10000);
  const [registered, setRegistered] = useState<number>(0);
  const [online, setOnline] = useState<number>(17);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        if (!sessionStorage.getItem("hn-counted")) {
          sessionStorage.setItem("hn-counted", "1");
          const { data } = await supabase.rpc("bump_visitors");
          if (alive && typeof data === "number") setVisitors(data);
        } else {
          const { data } = await supabase.from("site_stats").select("visitors").eq("id", 1).single();
          if (alive && data) setVisitors(Number(data.visitors));
        }
        const { data: reg } = await supabase.rpc("count_registered");
        if (alive && typeof reg === "number") setRegistered(reg);
      } catch {
        /* counters are decorative */
      }
    };
    load();
    const tick = () => setOnline(12 + Math.floor(Math.random() * 30));
    tick();
    const iv = setInterval(tick, 30000);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, []);

  const items: [typeof Eye, string, number][] = [
    [Eye, t("visitors"), visitors],
    [UserCheck, t("registeredUsers"), registered],
    [Users, t("onlineNow"), online],
  ];
  return (
    <div className="border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-1 px-4 py-1.5 text-xs font-bold">
        {items.map(([Icon, label, value]) => (
          <span key={label} className="flex items-center gap-1.5 text-muted-foreground">
            <Icon className="h-3.5 w-3.5 text-primary" />
            {label}
            <span dir="ltr" className="font-display text-primary">{value.toLocaleString("fr-FR")}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
