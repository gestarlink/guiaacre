import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getSessionUser, signOut as serverSignOut } from "@/lib/auth.server";
import type { AuthUser } from "@/lib/auth.server";

type AuthContextValue = {
  user: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessionUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const signOut = async () => {
    await serverSignOut();
    setUser(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
