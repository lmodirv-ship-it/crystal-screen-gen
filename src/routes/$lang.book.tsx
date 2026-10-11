import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { isLang, translator } from "@/lib/i18n";
import { useRows, money, today } from "@/lib/data";
import { carImage } from "@/lib/car-images";
import { BrandLogo } from "@/components/BrandLogo";
import { LangSwitch } from "@/components/LangSwitch";

export const Route = createFileRoute("/$lang/book")({
  validateSearch: (s: Record<string, unknown>) => ({ car: typeof s["car"] === "string" ? (s["car"] as string) : undefined }),
  head: () => ({
    meta: [
      { title: "Réserver en ligne — HN RentCar" },
      { name: "description", content: "Choose your car, dates and branch, upload your licence and ID, and send your rental request online." },
      { property: "og:title", content: "Réserver en ligne — HN RentCar" },
      { property: "og:description", content: "Online car rental request with HN RentCar in Morocco." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BookPage,
});

const MAX = 10 * 1024 * 1024;

function BookPage() {
  const { lang } = Route.useParams();
  const { car: preset } = Route.useSearch();
  const l = isLang(lang) ? lang : "ar";
  const t = translator(l);
  const { data: cars = [] } = useRows("cars", "*", "price_per_day");
  const { data: agencies = [] } = useRows("agencies", "id, name, city", "name");
  const [v, setV] = useState({ car_id: preset ?? "", agency_id: "", start_date: today(), end_date: "", full_name: "", phone: "", email: "", notes: "" });
  const [lic, setLic] = useState<File | null>(null);
  const [idc, setIdc] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof v, x: string) => setV((o) => ({ ...o, [k]: x }));
  const avail = cars.filter((c) => c.status === "available");
  const car = cars.find((c) => c.id === v.car_id);
  const nDays = v.end_date && v.start_date ? Math.max(1, Math.round((new Date(v.end_date).getTime() - new Date(v.start_date).getTime()) / 86400000)) : 0;
  const estimate = useMemo(() => (car ? nDays * Number(car.price_per_day) : 0), [car, nDays]);

  const upload = async (f: File | null) => {
    if (!f) return null;
    if (f.size > MAX) throw new Error("> 10 MB");
    const path = `requests/${crypto.randomUUID()}-${f.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("documents").upload(path, f);
    if (error) throw error;
    return path;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!v.end_date || v.end_date < v.start_date) { toast.error(t("returnDate")); return; }
    setBusy(true);
    try {
      const [license_path, id_card_path] = [await upload(lic), await upload(idc)];
      const { error } = await supabase.from("booking_requests").insert({
        ...v, car_id: v.car_id || null, agency_id: v.agency_id || car?.agency_id || null, email: v.email || null, notes: v.notes || null,
        estimate, license_path, id_card_path,
      });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/95"><div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3"><BrandLogo lang={l} /><LangSwitch lang={l} /></div></header>
      <main className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-6 flex items-center gap-3 font-display text-3xl font-black"><span className="tile tile-blue h-11 w-11"><CalendarDays className="h-5 w-5" /></span>{t("onlineBooking")}</h1>
        {done ? (
          <div className="card p-10 text-center"><CheckCircle2 className="mx-auto h-14 w-14 text-success" /><p className="mt-4 text-lg font-bold">{t("requestSent")}</p><Link to="/$lang" params={{ lang: l }} className="btn-primary mt-6 inline-flex">{t("home")}</Link></div>
        ) : (
          <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="card grid gap-4 p-6 sm:grid-cols-2">
              <label className="sm:col-span-2 text-sm font-bold">{t("car")}
                <select required className="input mt-1" value={v.car_id} onChange={(e) => set("car_id", e.target.value)}>
                  <option value="">—</option>
                  {avail.map((c) => <option key={c.id} value={c.id}>{c.model} · {c.price_per_day} {t("perDay")}</option>)}
                </select></label>
              <label className="text-sm font-bold">{t("agency")}
                <select className="input mt-1" value={v.agency_id} onChange={(e) => set("agency_id", e.target.value)}>
                  <option value="">—</option>{agencies.map((a) => <option key={a.id} value={a.id}>{a.name} {a.city ? `· ${a.city}` : ""}</option>)}
                </select></label>
              <div />
              <label className="text-sm font-bold">{t("pickupDate")}<input required type="date" min={today()} className="input mt-1" value={v.start_date} onChange={(e) => set("start_date", e.target.value)} /></label>
              <label className="text-sm font-bold">{t("returnDate")}<input required type="date" min={v.start_date} className="input mt-1" value={v.end_date} onChange={(e) => set("end_date", e.target.value)} /></label>
              <label className="text-sm font-bold">{t("fullName")}<input required minLength={2} maxLength={120} className="input mt-1" value={v.full_name} onChange={(e) => set("full_name", e.target.value)} /></label>
              <label className="text-sm font-bold">{t("phone")}<input required minLength={6} maxLength={30} dir="ltr" className="input mt-1" value={v.phone} onChange={(e) => set("phone", e.target.value)} /></label>
              <label className="text-sm font-bold">Email<input type="email" maxLength={160} dir="ltr" className="input mt-1" value={v.email} onChange={(e) => set("email", e.target.value)} /></label>
              <div />
              <label className="text-sm font-bold"><span className="flex items-center gap-1"><Upload className="h-4 w-4" />{t("licensePhoto")}</span><input type="file" accept="image/*,application/pdf" className="input mt-1" onChange={(e) => setLic(e.target.files?.[0] ?? null)} /></label>
              <label className="text-sm font-bold"><span className="flex items-center gap-1"><Upload className="h-4 w-4" />{t("idPhoto")}</span><input type="file" accept="image/*,application/pdf" className="input mt-1" onChange={(e) => setIdc(e.target.files?.[0] ?? null)} /></label>
              <label className="sm:col-span-2 text-sm font-bold">{t("notes")}<textarea maxLength={500} className="input mt-1" value={v.notes} onChange={(e) => set("notes", e.target.value)} /></label>
            </div>
            <aside className="card h-fit p-5">
              {car && <img src={carImage(car.category)} alt={car.model} className="mx-auto h-32 object-contain" />}
              <div className="mt-2 font-display text-lg font-extrabold">{car?.model ?? "—"}</div>
              <div className="mt-3 text-sm text-muted-foreground">{nDays} {t("days")}</div>
              <div className="mt-1 text-sm">{t("estimate")}</div>
              <div className="font-display text-3xl font-black text-primary">{money(estimate, t("currency"))}</div>
              <button disabled={busy} className="btn-primary mt-5 w-full">{busy ? t("loading") : t("sendRequest")}</button>
            </aside>
          </form>
        )}
      </main>
    </div>
  );
}
