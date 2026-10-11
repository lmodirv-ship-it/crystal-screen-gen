export const ROLES = ["developer", "owner", "manager", "operator", "accountant", "customer"] as const;
export type Role = (typeof ROLES)[number];
/** Highest-privilege role wins when a user has several. */
export const primaryRole = (roles: Role[]): Role => ROLES.find((r) => roles.includes(r)) ?? "customer";

export const MODULES = [
  "dashboard", "agencies", "cars", "customers", "bookings", "booking_requests", "contracts", "payments", "expenses", "maintenance",
  "documents", "notifications", "reports", "settings", "audit",
] as const;
export type Module = (typeof MODULES)[number];
export const isModule = (v: string): v is Module => (MODULES as readonly string[]).includes(v);

const ALL = [...MODULES];

/** UI permissions — mirror the database RLS policies. read = page visible; write = can create/edit. */
export const PERMISSIONS: Record<Role, { read: Module[]; write: Module[] }> = {
  developer: { read: ALL, write: ALL },
  owner: { read: ALL, write: ALL.filter((m) => m !== "audit") },
  manager: {
    read: ["dashboard", "cars", "customers", "bookings", "booking_requests", "contracts", "payments", "expenses", "maintenance", "documents", "notifications", "reports"],
    write: ["cars", "customers", "bookings", "booking_requests", "contracts", "maintenance", "documents"],
  },
  operator: {
    read: ["dashboard", "cars", "customers", "bookings", "booking_requests", "contracts", "documents", "notifications"],
    write: ["customers", "bookings", "booking_requests", "contracts", "documents"],
  },
  accountant: {
    read: ["dashboard", "payments", "expenses", "contracts", "reports", "notifications"],
    write: ["payments", "expenses"],
  },
  customer: {
    read: ["dashboard", "bookings", "contracts", "payments", "documents", "notifications"],
    write: ["bookings", "documents"],
  },
};

export const canRead = (r: Role, m: Module) => PERMISSIONS[r].read.includes(m);
export const canWrite = (r: Role, m: Module) => PERMISSIONS[r].write.includes(m);
