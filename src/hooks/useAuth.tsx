import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Role = "admin" | "owner" | "user";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  roles: Role[];
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async (userId: string) => {
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);

    if (error) {
      setRoles([]);
      return;
    }

    setRoles((data ?? []).map((r) => r.role as Role));
  };

  const syncSession = (sess: Session | null) => {
    setSession(sess);
    setUser(sess?.user ?? null);

    if (!sess?.user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    // Fire-and-forget — never await inside onAuthStateChange
    setTimeout(() => {
      fetchRoles(sess.user.id).finally(() => setLoading(false));
    }, 0);
  };

  useEffect(() => {
    // Listener FIRST
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      syncSession(sess);
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      syncSession(sess);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setRoles([]);
  };

  const isAdmin = roles.includes("admin");

  return (
    <AuthContext.Provider value={{ user, session, roles, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
