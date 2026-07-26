import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Store, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AdminShell } from "@/components/AdminShell";
import { listBusinesses } from "@/lib/crud.server";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin GuiaAcre" }] }),
  component: AdminAnalyticsPage,
});

function AdminAnalyticsPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const doList = useServerFn(listBusinesses);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    if (!loading && user && !isAdmin) navigate({ to: "/" });
  }, [loading, user, isAdmin, navigate]);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const data = await doList();
      setBusinesses(data);
    } catch (err) {
      // ignore
    }
    setBusy(false);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const stats = useMemo(
    () => ({
      total: businesses.length,
      approved: businesses.filter((b) => b.status === "approved").length,
      pending: businesses.filter((b) => b.status === "pending").length,
      premium: businesses.filter((b) => b.tier === "premium").length,
    }),
    [businesses],
  );

  if (loading || !isAdmin) {
    return (
      <AdminShell title="Analytics">
        <p className="text-muted-foreground">Carregando...</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Analytics"
      subtitle={`${businesses.length} empresas cadastradas ${busy ? "(carregando...)" : ""}`}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="h-10 w-10 rounded-xl inline-flex items-center justify-center bg-brand/10 text-brand">
            <Store className="h-5 w-5" />
          </div>
          <p className="text-2xl font-display font-bold mt-3">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total de empresas</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="h-10 w-10 rounded-xl inline-flex items-center justify-center bg-green-500/10 text-green-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-2xl font-display font-bold mt-3">{stats.approved}</p>
          <p className="text-xs text-muted-foreground">Aprovadas</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="h-10 w-10 rounded-xl inline-flex items-center justify-center bg-orange-500/10 text-orange-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-2xl font-display font-bold mt-3">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">Pendentes</p>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="h-10 w-10 rounded-xl inline-flex items-center justify-center bg-amber-500/10 text-amber-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-2xl font-display font-bold mt-3">{stats.premium}</p>
          <p className="text-xs text-muted-foreground">Premium</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-card border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand" />
          <h2 className="font-display font-semibold">Empresas cadastradas</h2>
        </div>
        <div className="divide-y divide-border">
          {businesses.slice(0, 20).map((b, i) => (
            <Link
              key={b.id}
              to="/admin/empresas/$id"
              params={{ id: b.id }}
              className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition"
            >
              <span className="text-sm font-display font-bold text-muted-foreground w-6">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="flex-1 font-medium truncate">{b.name}</p>
              <span className="text-sm text-muted-foreground">{b.status}</span>
            </Link>
          ))}
          {businesses.length === 0 && (
            <p className="px-5 py-10 text-center text-muted-foreground">Sem empresas cadastradas</p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
