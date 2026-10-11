import { describe, expect, it } from "vitest";
import { remaining, rentalTotal, net, pctChange, sumByMonth, lastMonths } from "@/lib/finance";
import { canRead, canWrite, primaryRole } from "@/lib/rbac";

describe("finance rules", () => {
  it("partial payments leave the remaining balance", () => {
    expect(remaining(1600, [{ amount: 800 }, { amount: 300 }])).toBe(500);
  });
  it("overpayment never gives negative balance", () => {
    expect(remaining(1000, [{ amount: 1200 }])).toBe(0);
  });
  it("rental total is days × daily rate", () => {
    expect(rentalTotal("2026-10-01", "2026-10-04", 250)).toEqual({ days: 3, total: 750 });
  });
  it("same-day rental counts as one day", () => {
    expect(rentalTotal("2026-10-01", "2026-10-01", 300).total).toBe(300);
  });
  it("net profit is income minus expenses", () => {
    expect(net(48500, 12300)).toBe(36200);
  });
  it("month-over-month change", () => {
    expect(pctChange(110, 100)).toBe(10);
  });
  it("groups amounts by month", () => {
    const m = lastMonths(2, new Date(2026, 9, 15));
    expect(m).toEqual(["2026-09", "2026-10"]);
    expect(sumByMonth([{ amount: 5, date: "2026-10-02" }, { amount: 7, date: "2026-09-30" }, { amount: 9, date: "2025-01-01" }], m)).toEqual({ "2026-09": 7, "2026-10": 5 });
  });
});

describe("role permissions", () => {
  it("accountant can record payments but not edit cars", () => {
    expect(canWrite("accountant", "payments")).toBe(true);
    expect(canWrite("accountant", "cars")).toBe(false);
  });
  it("customer cannot see expenses or settings", () => {
    expect(canRead("customer", "expenses")).toBe(false);
    expect(canRead("customer", "settings")).toBe(false);
  });
  it("operator cannot see reports", () => {
    expect(canRead("operator", "reports")).toBe(false);
  });
  it("highest role wins", () => {
    expect(primaryRole(["customer", "manager"])).toBe("manager");
  });
});
