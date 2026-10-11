import { useSyncExternalStore } from "react";

/** Active agency filter for staff (empty = all agencies). Kept per browser. */
const KEY = "hn-active-agency";
const subs = new Set<() => void>();
const read = () => (typeof window === "undefined" ? "" : localStorage.getItem(KEY) ?? "");

export function setActiveAgency(id: string) {
  if (id) localStorage.setItem(KEY, id);
  else localStorage.removeItem(KEY);
  subs.forEach((f) => f());
}
export function useActiveAgency() {
  return useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, read, () => "");
}
/** Tables that carry agency_id and get filtered by the switcher. */
export const AGENCY_TABLES = ["cars", "customers", "contracts", "payments", "expenses", "booking_requests"];
