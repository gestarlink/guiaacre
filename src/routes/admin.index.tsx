import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { Store, MapPinned, Tag, Clock, CheckCircle2, Crown, Star, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AdminShell } from "@/components/AdminShell";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useNeighborhoods } from "@/hooks/useNeighborhoods";
import { useCategories } from "@/hooks/useCategories";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Admin GuiaAcre" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { data: businesses } = useBusinesses({ status: "all" });
  const { data: neighborhoods } = useNeighborhoods();
  const { data: categories } = useCategories();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    if (!loading && user && !isAdmin) navigate({ to: "/" });
  }, [loading, user, isAdmin, navigate]);

  const stats = useMemo(() => {
    const pending = businesses.filter((b) => b.status === "pending").length;
    const approved = businesses.filter((b) => b.status === "approved").length;
    const premium = businesses.filter((b) => b.tier === "premium").length;
    const featured = businesses.filter((b) => b.tier === "featured").length;
    return { pending, approved, premium, featured };
  }, [businesses]);

  const recentPending = businesses.filter((b) => b.status === "pending").slice(0, 5);

  if (loading || !isAdmin) {
    return (
      <AdminShell title="Dashboard">
        <p className="text-muted-foreground">Carregando...</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Dashboard" subtitle="Visão geral da plataforma">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Pendentes"
          value={stats.pending}
          icon={Clock}
          color="bg-orange-500/10 text-orange-600"
        />
        <StatCard
          label="Aprovadas"
          value={stats.approved}
          icon={CheckCircle2}
          color="bg-green-500/10 text-green-600"
        />
        <StatCard
          label="Premium"
          value={stats.premium}
          icon={Crown}
          color="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          label="Destaque"
          value={stats.featured}
          icon={Star}
          color="bg-blue-500/10 text-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
        <Link
          to="/admin/empresas"
          className="rounded-2xl bg-card border border-border p-5 hover:border-brand transition group"
        >
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-xl bg-brand/10 text-brand inline-flex items-center justify-center">
              <Store className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-brand group-hover:translate-x-1 transition" />
          </div>
          <p className="font-display font-semibold mt-3">Gerenciar Empresas</p>
          <p className="text-sm text-muted-foreground mt-1">
            {businesses.length} empresas · {stats.pending} aguardando
          </p>
        </Link>

        <Link
          to="/admin/bairros"
          className="rounded-2xl bg-card border border-border p-5 hover:border-brand transition group"
        >
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-xl bg-brand/10 text-brand inline-flex items-center justify-center">
              <MapPinned className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-brand group-hover:translate-x-1 transition" />
          </div>
          <p className="font-display font-semibold mt-3">Gerenciar Bairros</p>
          <p className="text-sm text-muted-foreground mt-1">
            {neighborhoods.length} bairros cadastrados
          </p>
        </Link>

        <Link
          to="/admin/categorias"
          className="rounded-2xl bg-card border border-border p-5 hover:border-brand transition group"
        >
          <div className="flex items-start justify-between">
            <div className="h-11 w-11 rounded-xl bg-brand/10 text-brand inline-flex items-center justify-center">
              <Tag className="h-5 w-5" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-brand group-hover:translate-x-1 transition" />
          </div>
          <p className="font-display font-semibold mt-3">Gerenciar Categorias</p>
          <p className="text-sm text-muted-foreground mt-1">
            {categories.length} categorias cadastradas
          </p>
        </Link>
      </div>

      <section className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-lg">Aguardando aprovação</h2>
          <Link
            to="/admin/empresas"
            search={{ status: "pending" }}
            className="text-sm text-brand font-semibold"
          >
            Ver todas →
          </Link>
        </div>
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {recentPending.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              Nenhuma empresa pendente 🎉
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recentPending.map((b) => (
                <li key={b.id}>
                  <Link
                    to="/admin/empresas/$id"
                    params={{ id: b.id }}
                    className="flex items-center gap-3 p-3 sm:p-4 hover:bg-muted/50 transition"
                  >
                    {b.image_url ? (
                      <img
                        src={b.image_url}
                        alt={b.name}
                        className="h-12 w-12 rounded-lg object-cover shrink-0"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-muted shrink-0 inline-flex items-center justify-center">
                        <Store className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{b.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {b.category} · {b.neighborhood}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4">
      <div className={`h-10 w-10 rounded-xl inline-flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-display font-bold text-2xl mt-3">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
