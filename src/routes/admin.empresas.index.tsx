import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Store, Crown, Star, Clock, CheckCircle2, XCircle, ArrowRight, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AdminShell } from "@/components/AdminShell";
import { useBusinesses } from "@/hooks/useBusinesses";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export const Route = createFileRoute("/admin/empresas/")({
  head: () => ({ meta: [{ title: "Empresas — Admin GuiaAcre" }] }),
  validateSearch: (search: Record<string, unknown>): { status?: StatusFilter } => {
    const s = search.status;
    if (s === "pending" || s === "approved" || s === "rejected" || s === "all") return { status: s };
    return {};
  },
  component: AdminEmpresasPage,
});

function AdminEmpresasPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { data } = useBusinesses({ status: "all" });
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<StatusFilter>(search.status ?? "pending");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    if (!loading && user && !isAdmin) navigate({ to: "/" });
  }, [loading, user, isAdmin, navigate]);

  const counts = useMemo(() => ({
    all: data.length,
    pending: data.filter((b) => b.status === "pending").length,
    approved: data.filter((b) => b.status === "approved").length,
    rejected: data.filter((b) => b.status === "rejected").length,
  }), [data]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data
      .filter((b) => tab === "all" || b.status === tab)
      .filter((b) =>
        !q ||
        b.name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.neighborhood.toLowerCase().includes(q),
      );
  }, [data, tab, query]);

  if (loading || !isAdmin) {
    return <AdminShell title="Empresas"><p className="text-muted-foreground">Carregando...</p></AdminShell>;
  }

  return (
    <AdminShell
      title="Empresas"
      subtitle="Gerencie cadastros, aprovações e assinaturas"
      actions={
        <Link
          to="/admin/empresas/nova"
          className="inline-flex items-center gap-1.5 h-10 px-3 sm:px-4 rounded-lg bg-brand text-brand-foreground text-sm font-semibold"
        >
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Nova empresa</span>
        </Link>
      }
    >
      <div className="rounded-2xl bg-card border border-border p-3 sm:p-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome, categoria ou bairro..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
          {(["pending", "approved", "rejected", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition ${
                tab === t
                  ? "bg-brand text-brand-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {labelOf(t)} <span className="opacity-70 ml-1">({counts[t]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-card border border-border overflow-hidden">
        {list.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">
            Nenhuma empresa encontrada.
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden md:table w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Empresa</th>
                  <th className="text-left px-4 py-3 font-medium">Categoria</th>
                  <th className="text-left px-4 py-3 font-medium">Bairro</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Plano</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30 transition">
                    <td className="px-4 py-3">
                      <Link to="/admin/empresas/$id" params={{ id: b.id }} className="flex items-center gap-3 min-w-0">
                        {b.image_url ? (
                          <img src={b.image_url} alt={b.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-muted inline-flex items-center justify-center shrink-0">
                            <Store className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium truncate">{b.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{b.category}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.neighborhood}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3"><TierBadge tier={b.tier} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to="/admin/empresas/$id"
                        params={{ id: b.id }}
                        className="inline-flex items-center gap-1 text-brand text-sm font-semibold"
                      >
                        Gerenciar <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="md:hidden divide-y divide-border">
              {list.map((b) => (
                <li key={b.id}>
                  <Link
                    to="/admin/empresas/$id"
                    params={{ id: b.id }}
                    className="flex items-center gap-3 p-3 hover:bg-muted/30 transition"
                  >
                    {b.image_url ? (
                      <img src={b.image_url} alt={b.name} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted inline-flex items-center justify-center shrink-0">
                        <Store className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{b.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {b.category} · {b.neighborhood}
                      </p>
                      <div className="flex gap-1.5 mt-1.5">
                        <StatusBadge status={b.status} />
                        <TierBadge tier={b.tier} />
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </AdminShell>
  );
}

function labelOf(t: StatusFilter) {
  return t === "pending" ? "Pendentes" : t === "approved" ? "Aprovadas" : t === "rejected" ? "Rejeitadas" : "Todas";
}

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  const map = {
    pending: { label: "Pendente", icon: Clock, cls: "bg-orange-500/10 text-orange-600" },
    approved: { label: "Aprovada", icon: CheckCircle2, cls: "bg-green-500/10 text-green-600" },
    rejected: { label: "Rejeitada", icon: XCircle, cls: "bg-red-500/10 text-red-600" },
  } as const;
  const { label, icon: Icon, cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}

function TierBadge({ tier }: { tier: "basic" | "featured" | "premium" }) {
  if (tier === "premium")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600">
        <Crown className="h-3 w-3" /> Premium
      </span>
    );
  if (tier === "featured")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600">
        <Star className="h-3 w-3" /> Destaque
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
      Básico
    </span>
  );
}
