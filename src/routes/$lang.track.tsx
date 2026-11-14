import { uploadRequestDoc } from "@/lib/request-uploads.functions";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Printer, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isLang, translator } from "@/lib/i18n";
import { money } from "@/lib/data";
import { BrandLogo } from "@/components/BrandLogo";
import { LangSwitch } from "@/components/LangSwitch";
import { RentalAgreement } from "@/components/RentalAgreement";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/$lang/track")({
  validateSearch: (s: Record<string, unknown>) => ({
    ref: typeof s["ref"] === "string" || typeof s["ref"] === "number" ? String(s["ref"]) : undefined,
    phone: typeof s["phone"] === "string" ? (s["phone"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Suivre ma réservation — HN RentCar" },
      { name: "description", content: "Follow your HN RentCar booking, send your ID and licence, and get your approved rental contract online." },
      { property: "og:title", content: "Suivre ma réservation — HN RentCar" },
      { property: "og:description", content: "Track your car rental request and receive your contract online." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TrackPage,
});

type Track = {
  ref: number; status: string; full_name: string; start_date: string; end_date: string; estimate: number;
  has_license: boolean; has_id: boolean; car: string | null; agency: string | null;
  contract: null | { ref: number; start_date: string; end_date: string; daily_rate: number; total: number; deposit: number; plate: string; agency_phone: string | null; agency_address: string | null; agency_city: string | null };
};
const STEPS = ["pending", "accepted", "docs_sent", "contract_ready", "sent"];
const MAX = 10 * 1024 * 1024;

function TrackPage() {
  const { lang } = Route.useParams();
  const s = Route.useSearch();
  const l = isLang(lang) ? lang : "ar";
  const t = translator(l);
  const [ref, setRef] = useState(s.ref ?? "");
  const [phone, setPhone] = useState(s.phone ?? "");
  const [data, setData] = useState<Track | null>(null);
  const [miss, setMiss] = useState(false);
  const [lic, setLic] = useState<File | null>(null);
  const [idc, setIdc] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const n = parseInt(ref, 10);
    if (!n || phone.length < 6) return;
    const { data: d, error } = await supabase.rpc("track_booking", { p_ref: n, p_phone: phone });
    if (error) { toast.error(error.message); return; }
    setData((d as Track) ?? null); setMiss(!d);
  };
  useEffect(() => { if (s.ref && s.phone) void load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const up = async (f: File) => {
    if (f.size > MAX) throw new Error("> 10 MB");
    const fd = new FormData(); fd.append("file", f);
    const { path } = await uploadRequestDoc({ data: fd });
    return path;
  };
  const sendDocs = async () => {
    if (!lic || !idc || !data) return;
    setBusy(true);
    try {
      const [a, b] = [await up(lic), await up(idc)];
      const { error } = await supabase.rpc("submit_booking_docs", { p_ref: data.ref, p_phone: phone, p_license: a, p_id_card: b });
      if (error) throw error;
      toast.success(t("st_docs_sent")); await load();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  };

  const idx = data ? STEPS.indexOf(data.status) : -1;
  const k = data?.contract;

  return (
    <div className="min-h-screen bg-background">
      <header className="no-print border-b border-border bg-card/95"><div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3"><BrandLogo lang={l} /><LangSwitch lang={l} /></div></header>
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="no-print mb-6 flex items-center gap-3 font-display text-3xl font-black"><span className="tile tile-cyan h-11 w-11"><Search className="h-5 w-5" /></span>{t("trackBooking")}</h1>
        <form className="no-print card mb-6 grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto]" onSubmit={(e) => { e.preventDefault(); void load(); }}>
          <input required inputMode="numeric" dir="ltr" className="input" placeholder={t("requestNo")} value={ref} onChange={(e) => setRef(e.target.value.replace(/\D/g, ""))} />
          <input required minLength={6} dir="ltr" className="input" placeholder={t("phone")} value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button className="btn-primary">{t("trackBooking")}</button>
        </form>
        {miss && <div className="card p-6 text-center text-muted-foreground">{t("notFoundReq")}</div>}
        {data && (
          <div className="grid gap-6">
            <div className="no-print card p-6">
              <div className="mb-4 flex items-center justify-between"><b className="font-display text-xl">#{data.ref} · {data.full_name}</b><span className="text-sm text-muted-foreground">{data.car} · {data.start_date} → {data.end_date}</span></div>
              {data.status === "cancelled" ? <div className="badge badge-danger">{t("st_cancelled")}</div> : (
                <ol className="grid gap-3 sm:grid-cols-5">
                  {STEPS.map((st, i) => (
                    <li key={st} className={`flex items-center gap-2 text-sm ${i <= idx ? "font-bold text-primary" : "text-muted-foreground"}`}>
                      {i <= idx ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <Circle className="h-5 w-5 shrink-0" />}{t(`st_${st}`)}
                    </li>))}
                </ol>)}
            </div>
            {(data.status === "accepted" || data.status === "pending") && (
              <div className="no-print card grid gap-4 p-6 sm:grid-cols-2">
                <p className="sm:col-span-2 font-bold">{t("docsNeeded")}</p>
                <label className="text-sm font-bold"><span className="flex items-center gap-1"><Upload className="h-4 w-4" />{t("idPhoto")}</span><input type="file" accept="image/*,application/pdf" className="input mt-1" onChange={(e) => setIdc(e.target.files?.[0] ?? null)} /></label>
                <label className="text-sm font-bold"><span className="flex items-center gap-1"><Upload className="h-4 w-4" />{t("licensePhoto")}</span><input type="file" accept="image/*,application/pdf" className="input mt-1" onChange={(e) => setLic(e.target.files?.[0] ?? null)} /></label>
                <button disabled={busy || !lic || !idc} onClick={sendDocs} className="btn-primary sm:col-span-2">{busy ? t("loading") : t("sendDocs")}</button>
              </div>)}
            {k && (
              <div>
                <Button onClick={() => window.print()} className="no-print btn-primary mb-4"><Printer className="h-4 w-4" />{t("print")}</Button>
                <RentalAgreement lang={l} terms={t("terms")} data={{
                  ref: k.ref, startDate: k.start_date, endDate: k.end_date,
                  dailyRate: money(k.daily_rate, t("currency")), total: money(k.total, t("currency")), deposit: money(k.deposit, t("currency")),
                  renter: { name: data.full_name, phone }, car: { model: data.car, plate: k.plate },
                  agency: { name: data.agency ?? "HN RentCar", address: k.agency_address, city: k.agency_city, phone: k.agency_phone },
                }} />
              </div>)}
          </div>)}
      </main>
    </div>
  );
}
