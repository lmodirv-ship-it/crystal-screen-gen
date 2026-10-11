import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ROLES, type Role } from "./rbac";

const Ctx = createContext<{ role: Role; setRole: (r: Role) => void }>({ role: "owner", setRole: () => {} });
const KEY = "hn-role";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("owner");
  useEffect(() => {
    const s = localStorage.getItem(KEY);
    if (s && (ROLES as readonly string[]).includes(s)) setRoleState(s as Role);
  }, []);
  const setRole = (r: Role) => {
    localStorage.setItem(KEY, r);
    setRoleState(r);
  };
  return <Ctx.Provider value={{ role, setRole }}>{children}</Ctx.Provider>;
}
export const useRole = () => useContext(Ctx);
