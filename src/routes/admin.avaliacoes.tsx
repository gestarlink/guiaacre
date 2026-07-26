import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Star, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { AdminShell } from "@/components/AdminShell";
import { supabase } from "@/integrations/supabase/client";
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
  business_name?: string;
  author_name?: string;
};

function AdminAvaliacoesPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    if (!loading && user && !isAdmin) navigate({ to: "/" });
  }, [loading, user, isAdmin, navigate]);

  const load = useCallback(async () => {
    setBusy(true);
    const { data: reviews } = await supabase
      .from("reviews")
      .select("id, business_id, user_id, rating, comment, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    const list = (reviews ?? []) as Row[];
    if (list.length) {
      const bIds = [...new Set(list.map((r) => r.business_id))];
      const uIds = [...new Set(list.map((r) => r.user_id))];
      const [{ data: businesses }, { data: profiles }] = await Promise.all([
        supabase.from("businesses").select("id, name").in("id", bIds),
        supabase.from("profiles").select("user_id, display_name").in("user_id", uIds),
      ]);
      const bMap = new Map((businesses ?? []).map((b) => [b.id, b.name]));
      const pMap = new Map((profiles ?? []).map((p) => [p.user_id, p.display_name]));
      list.forEach((r) => {
        r.business_name = bMap.get(r.business_id) ?? "—";
        r.author_name = pMap.get(r.user_id) ?? "Usuário";
      });
    }
    setRows(list);
    setBusy(false);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta avaliação?")) return;
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Avaliação excluída");
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  if (loading || !isAdmin) {
    return (
      <AdminShell title="Avaliações">
        <p className="text-muted-foreground">Carregando...</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Avaliações" subtitle={`${rows.length} avaliações ${busy ? "(carregando...)" : ""}`}>
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
                    {r.business_name}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  por {r.author_name} · {new Date(r.created_at).toLocaleString("pt-BR")}
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
