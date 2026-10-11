export type Dated = { amount: number | string; date: string };

/** Last `n` month keys (YYYY-MM), oldest first. */
export function lastMonths(n: number, now = new Date()): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

export function sumByMonth(items: Dated[], months: string[]): Record<string, number> {
  const r: Record<string, number> = Object.fromEntries(months.map((m) => [m, 0]));
  for (const it of items) {
    const k = it.date.slice(0, 7);
    if (k in r) r[k] = (r[k] ?? 0) + Number(it.amount);
  }
  return r;
}

export const net = (income: number, expenses: number) => income - expenses;

/** Remaining balance on a contract = total - sum(payments), never negative. */
export const remaining = (total: number | string, payments: { amount: number | string }[]) =>
  Math.max(0, Number(total) - payments.reduce((s, p) => s + Number(p.amount), 0));

/** Rental total = whole days between dates (min 1) × daily rate. */
export function rentalTotal(start: string, end: string, rate: number) {
  const days = Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000));
  return { days, total: days * rate };
}

export const pctChange = (cur: number, prev: number) => (prev === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - prev) / prev) * 100));
