import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { ArrowLeft, Plus, Clock, Check, X as XIcon, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useBusinesses } from "@/hooks/useBusinesses";
import { MobileShell } from "@/components/MobileShell";
import { TierBadge } from "@/components/TierBadge";
import { deleteBusiness } from "@/lib/crud.server";

export const Route = createFileRoute("/meus-negocios")({
  head: () => ({ meta: [{ title: "Meus negócios — GuiaAcre" }] }),
  component: MyBusinessesPage,
});

function MyBusinessesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data, refetch } = useBusinesses({ ownerId: user?.id, status: "all" });

  const doDelete = useServerFn(deleteBusiness);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const onDelete = async (id: string) => {
    if (!confirm("Excluir este negócio? Esta ação não pode ser desfeita.")) return;
    try {
      await doDelete({ data: { id } });
      toast.success("Negócio excluído");
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <MobileShell>
      <header className="px-5 pt-12 pb-4 flex items-center gap-3">
        <Link to="/perfil" className="h-9 w-9 -ml-2 flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display font-bold text-lg flex-1">Meus negócios</h1>
        <Link
          to="/cadastrar"
          className="h-9 w-9 rounded-full bg-whatsapp text-whatsapp-foreground flex items-center justify-center shadow-pill"
        >
          <Plus className="h-5 w-5" strokeWidth={3} />
        </Link>
      </header>

      <section className="px-4 space-y-3 pb-6">
        {data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground mb-4">
              Você ainda não cadastrou nenhum negócio.
            </p>
            <Link
              to="/cadastrar"
              className="inline-flex items-center gap-2 rounded-xl bg-brand text-brand-foreground px-5 py-3 font-semibold"
            >
              <Plus className="h-4 w-4" /> Cadastrar agora
            </Link>
          </div>
        )}
        {data.map((b) => (
          <div key={b.id} className="rounded-2xl bg-card border border-border/60 shadow-card p-3">
            <div className="flex gap-3">
              {b.image_url && (
                <img src={b.image_url} alt={b.name} className="h-20 w-20 rounded-xl object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold truncate">{b.name}</h3>
                <p className="text-xs text-muted-foreground">{b.category} · {b.neighborhood}</p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <StatusPill status={b.status} />
                  {b.status === "approved" && <TierBadge tier={b.tier} />}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Link
                to="/editar-negocio/$id"
                params={{ id: b.id }}
                className="flex-1 h-9 rounded-lg bg-brand/10 text-brand text-sm font-semibold inline-flex items-center justify-center gap-1"
              >
                <Pencil className="h-3.5 w-3.5" /> Editar
              </Link>
              <button
                onClick={() => onDelete(b.id)}
                className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive inline-flex items-center justify-center"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </section>
    </MobileShell>
  );
}

function StatusPill({ status }: { status: "pending" | "approved" | "rejected" }) {
  const config = {
    pending: { icon: Clock, text: "Aguardando aprovação", cls: "bg-highlight/40 text-highlight-foreground" },
    approved: { icon: Check, text: "Aprovado", cls: "bg-whatsapp/20 text-whatsapp" },
    rejected: { icon: XIcon, text: "Rejeitado", cls: "bg-destructive/15 text-destructive" },
  }[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${config.cls}`}>
      <Icon className="h-3 w-3" /> {config.text}
    </span>
  );
}
