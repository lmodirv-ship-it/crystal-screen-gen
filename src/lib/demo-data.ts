import type { Module } from "./rbac";

export const CURRENCY = "MAD";
export type Row = Record<string, string | number>;
export type Table = { columns: string[]; status?: string; rows: Row[]; customerScoped?: boolean };

export const FLEET = [
  { model: "Dacia Logan", category: "Economy", price: 250 },
  { model: "Renault Clio 5", category: "Compact", price: 320 },
  { model: "Peugeot 3008", category: "SUV", price: 650 },
  { model: "Toyota Corolla", category: "Sedan", price: 480 },
  { model: "Hyundai Tucson", category: "SUV", price: 700 },
  { model: "Mercedes C200", category: "Premium", price: 1200 },
];

export const TABLES: Record<Exclude<Module, "dashboard" | "settings">, Table> = {
  cars: {
    columns: ["ref", "model", "plate", "category", "price", "status"], status: "status",
    rows: [
      { ref: "C-01", model: "Dacia Logan", plate: "12345-A-1", category: "Economy", price: 250, status: "available" },
      { ref: "C-02", model: "Renault Clio 5", plate: "23456-B-6", category: "Compact", price: 320, status: "rented" },
      { ref: "C-03", model: "Peugeot 3008", plate: "34567-A-1", category: "SUV", price: 650, status: "rented" },
      { ref: "C-04", model: "Toyota Corolla", plate: "45678-D-8", category: "Sedan", price: 480, status: "maintenance" },
      { ref: "C-05", model: "Hyundai Tucson", plate: "56789-A-1", category: "SUV", price: 700, status: "available" },
      { ref: "C-06", model: "Mercedes C200", plate: "67890-H-6", category: "Premium", price: 1200, status: "available" },
      { ref: "C-07", model: "Dacia Duster", plate: "78901-A-1", category: "SUV", price: 400, status: "rented" },
    ],
  },
  customers: {
    columns: ["ref", "name", "phone", "city", "license", "status"], status: "status",
    rows: [
      { ref: "CL-101", name: "Yassine El Amrani", phone: "+212 600 112 233", city: "Casablanca", license: "B-883421", status: "verified" },
      { ref: "CL-102", name: "Sophie Martin", phone: "+33 6 12 34 56 78", city: "Paris", license: "FR-11923", status: "verified" },
      { ref: "CL-103", name: "Karim Benali", phone: "+212 661 445 990", city: "Rabat", license: "B-120044", status: "pending" },
      { ref: "CL-104", name: "Laura Gómez", phone: "+34 612 000 111", city: "Madrid", license: "ES-77120", status: "verified" },
      { ref: "CL-105", name: "Omar Haddad", phone: "+212 670 998 877", city: "Marrakech", license: "B-554109", status: "expired" },
    ],
  },
  bookings: {
    columns: ["ref", "customer", "car", "from", "to", "total", "status"], status: "status", customerScoped: true,
    rows: [
      { ref: "BK-2041", customer: "Yassine El Amrani", car: "Renault Clio 5", from: "2026-10-09", to: "2026-10-14", total: 1600, status: "confirmed" },
      { ref: "BK-2042", customer: "Sophie Martin", car: "Peugeot 3008", from: "2026-10-10", to: "2026-10-17", total: 4550, status: "confirmed" },
      { ref: "BK-2043", customer: "Karim Benali", car: "Mercedes C200", from: "2026-10-15", to: "2026-10-18", total: 3600, status: "pending" },
      { ref: "BK-2044", customer: "Laura Gómez", car: "Dacia Duster", from: "2026-10-08", to: "2026-10-12", total: 1600, status: "confirmed" },
      { ref: "BK-2039", customer: "Yassine El Amrani", car: "Dacia Logan", from: "2026-09-02", to: "2026-09-05", total: 750, status: "completed" },
      { ref: "BK-2038", customer: "Omar Haddad", car: "Hyundai Tucson", from: "2026-09-20", to: "2026-09-22", total: 1400, status: "cancelled" },
    ],
  },
  contracts: {
    columns: ["ref", "customer", "car", "from", "to", "deposit", "status"], status: "status", customerScoped: true,
    rows: [
      { ref: "CT-881", customer: "Yassine El Amrani", car: "Renault Clio 5", from: "2026-10-09", to: "2026-10-14", deposit: 3000, status: "active" },
      { ref: "CT-882", customer: "Sophie Martin", car: "Peugeot 3008", from: "2026-10-10", to: "2026-10-17", deposit: 5000, status: "active" },
      { ref: "CT-883", customer: "Laura Gómez", car: "Dacia Duster", from: "2026-10-08", to: "2026-10-12", deposit: 3000, status: "active" },
      { ref: "CT-879", customer: "Yassine El Amrani", car: "Dacia Logan", from: "2026-09-02", to: "2026-09-05", deposit: 2000, status: "closed" },
    ],
  },
  payments: {
    columns: ["ref", "customer", "amount", "total", "method", "date", "status"], status: "status", customerScoped: true,
    rows: [
      { ref: "PY-501", customer: "Yassine El Amrani", amount: 800, total: 1600, method: "Cash", date: "2026-10-09", status: "partial" },
      { ref: "PY-502", customer: "Sophie Martin", amount: 4550, total: 4550, method: "Card", date: "2026-10-10", status: "paid" },
      { ref: "PY-503", customer: "Laura Gómez", amount: 1000, total: 1600, method: "Transfer", date: "2026-10-08", status: "partial" },
      { ref: "PY-504", customer: "Karim Benali", amount: 0, total: 3600, method: "—", date: "2026-10-11", status: "unpaid" },
      { ref: "PY-499", customer: "Yassine El Amrani", amount: 750, total: 750, method: "Card", date: "2026-09-02", status: "paid" },
    ],
  },
  expenses: {
    columns: ["ref", "label", "type", "amount", "date"],
    rows: [
      { ref: "EX-71", label: "Fuel refill fleet", type: "Fuel", amount: 2400, date: "2026-10-03" },
      { ref: "EX-72", label: "Insurance renewal C-06", type: "Insurance", amount: 6800, date: "2026-10-05" },
      { ref: "EX-73", label: "Car wash contract", type: "Service", amount: 900, date: "2026-10-06" },
      { ref: "EX-74", label: "Office rent", type: "Rent", amount: 7000, date: "2026-10-01" },
    ],
  },
  maintenance: {
    columns: ["ref", "car", "type", "cost", "date", "status"], status: "status",
    rows: [
      { ref: "MT-31", car: "Toyota Corolla", type: "Brake pads", cost: 1800, date: "2026-10-10", status: "open" },
      { ref: "MT-32", car: "Dacia Logan", type: "Oil change", cost: 450, date: "2026-10-20", status: "scheduled" },
      { ref: "MT-29", car: "Peugeot 3008", type: "Tires", cost: 3200, date: "2026-09-18", status: "done" },
    ],
  },
  documents: {
    columns: ["ref", "file", "type", "owner", "date", "status"], status: "status", customerScoped: true,
    rows: [
      { ref: "DC-11", file: "license_yassine.pdf", type: "License", owner: "Yassine El Amrani", date: "2026-09-01", status: "verified" },
      { ref: "DC-12", file: "passport_sophie.jpg", type: "ID", owner: "Sophie Martin", date: "2026-10-09", status: "verified" },
      { ref: "DC-13", file: "c03_damage_front.jpg", type: "Car photo", owner: "Peugeot 3008", date: "2026-10-10", status: "pending" },
      { ref: "DC-14", file: "license_omar.pdf", type: "License", owner: "Omar Haddad", date: "2025-03-11", status: "expired" },
    ],
  },
  alerts: {
    columns: ["ref", "message", "priority", "date"], status: "priority",
    rows: [
      { ref: "AL-1", message: "Insurance of C-04 expires in 5 days", priority: "high", date: "2026-10-11" },
      { ref: "AL-2", message: "BK-2044 return due tomorrow", priority: "medium", date: "2026-10-11" },
      { ref: "AL-3", message: "Unpaid balance on PY-504", priority: "high", date: "2026-10-11" },
      { ref: "AL-4", message: "Oil change scheduled for C-01", priority: "low", date: "2026-10-10" },
    ],
  },
  reports: {
    columns: ["period", "rentals", "total", "cost", "status"], status: "status",
    rows: [
      { period: "2026-10", rentals: 14, total: 48200, cost: 17100, status: "open" },
      { period: "2026-09", rentals: 31, total: 96400, cost: 38200, status: "closed" },
      { period: "2026-08", rentals: 42, total: 131500, cost: 41800, status: "closed" },
    ],
  },
  audit: {
    columns: ["date", "user", "action", "target"],
    rows: [
      { date: "2026-10-11 15:20", user: "manager@hn", action: "update", target: "BK-2043" },
      { date: "2026-10-11 14:02", user: "accountant@hn", action: "create", target: "PY-504" },
      { date: "2026-10-11 11:47", user: "operator@hn", action: "upload", target: "DC-13" },
      { date: "2026-10-10 18:30", user: "owner@hn", action: "update", target: "Settings/pricing" },
    ],
  },
};

export const DEMO_CUSTOMER = "Yassine El Amrani";
export const MONEY_COLS = ["price", "total", "amount", "cost", "deposit"];
