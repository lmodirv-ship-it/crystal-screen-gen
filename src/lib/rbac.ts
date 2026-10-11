export const ROLES = ["developer", "owner", "manager", "operator", "accountant", "customer", "visitor"] as const;
export type Role = (typeof ROLES)[number];

export const MODULES = [
  "dashboard", "cars", "customers", "bookings", "contracts", "payments", "expenses", "maintenance",
  "documents", "alerts", "reports", "settings", "audit",
] as const;
export type Module = (typeof MODULES)[number];
export const isModule = (v: string): v is Module => (MODULES as readonly string[]).includes(v);

const ALL = [...MODULES];

/** read = can see page; write = can create/edit records. */
export const PERMISSIONS: Record<Role, { read: Module[]; write: Module[] }> = {
  developer: { read: ALL, write: ALL },
  owner: { read: ALL.filter((m) => m !== "audit").concat("audit"), write: ALL.filter((m) => m !== "audit") },
  manager: {
    read: ["dashboard", "cars", "customers", "bookings", "contracts", "payments", "maintenance", "documents", "alerts", "reports"],
    write: ["cars", "customers", "bookings", "contracts", "maintenance", "documents"],
  },
  operator: {
    read: ["dashboard", "cars", "customers", "bookings", "contracts", "documents", "alerts"],
    write: ["customers", "bookings", "contracts", "documents"],
  },
  accountant: {
    read: ["dashboard", "payments", "expenses", "contracts", "reports"],
    write: ["payments", "expenses"],
  },
  customer: { read: ["dashboard", "bookings", "contracts", "payments", "documents"], write: ["bookings", "documents"] },
  visitor: { read: [], write: [] },
};

export const canRead = (r: Role, m: Module) => PERMISSIONS[r].read.includes(m);
export const canWrite = (r: Role, m: Module) => PERMISSIONS[r].write.includes(m);
