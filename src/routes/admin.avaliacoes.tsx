import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useState } from "react";
import { Star, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { AdminShell } from "@/components/AdminShell";
import { listReviews, deleteReview } from "@/lib/crud.server";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/avaliacoes")({
  head: () => ({ meta: [{ title: "Avaliações — Admin GuiaAcre" }] }),
  component: AdminAvaliacoesPage,
});

type Row = {
  id: string;
  business_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_name?: string;
};

function AdminAvaliacoesPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  const doList = useServerFn(listReviews);
  const doDelete = useServerFn(deleteReview);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    if (!loading && user && !isAdmin) navigate({ to: "/" });
  }, [loading, user, isAdmin, navigate]);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const reviews = (await doList()) as Row[];
      setRows(reviews);
    } catch (err) {
      toast.error((err as Error).message);
    }
    setBusy(false);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta avaliação?")) return;
    try {
      await doDelete({ data: { id } });
      toast.success("Avaliação excluída");
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  if (loading || !isAdmin) {
    return (
      <AdminShell title="Avaliações">
        <p className="text-muted-foreground">Carregando...</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Avaliações"
      subtitle={`${rows.length} avaliações ${busy ? "(carregando...)" : ""}`}
    >
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to="/negocio/$id"
                    params={{ id: r.business_id }}
                    className="font-display font-semibold hover:text-brand truncate inline-flex items-center gap-1"
                  >
                    {r.business_id}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < r.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  por {r.user_name ?? "Usuário"} · {new Date(r.created_at).toLocaleString("pt-BR")}
                </p>
                {r.comment && (
                  <p className="text-sm mt-2 text-foreground/80 whitespace-pre-wrap">{r.comment}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(r.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {!busy && rows.length === 0 && (
          <div className="rounded-2xl bg-card border border-border p-10 text-center text-muted-foreground">
            Nenhuma avaliação ainda
          </div>
        )}
      </div>
    </AdminShell>
  );
}
