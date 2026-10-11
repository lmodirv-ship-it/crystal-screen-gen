import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { primaryRole, type Role } from "./rbac";

type AuthState = { user: User | null; roles: Role[]; role: Role | null; ready: boolean; refresh: () => void };
const Ctx = createContext<AuthState>({ user: null, roles: [], role: null, ready: false, refresh: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [ready, setReady] = useState(false);

  const load = async (u: User | null) => {
    setUser(u);
    if (!u) { setRoles([]); setReady(true); return; }
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.id);
    setRoles((data ?? []).map((r) => r.role as Role));
    setReady(true);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => load(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") void load(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider value={{ user, roles, role: user ? primaryRole(roles) : null, ready, refresh: () => void load(user) }}>
      {children}
    </Ctx.Provider>
  );
}
export const useAuth = () => useContext(Ctx);
