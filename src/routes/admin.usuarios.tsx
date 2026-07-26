import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Shield, ShieldOff, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { AdminShell } from "@/components/AdminShell";
import { listUsers, updateUserRole } from "@/lib/crud.server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({ meta: [{ title: "Usuários — Admin GuiaAcre" }] }),
  component: AdminUsuariosPage,
});

type Row = {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
};

function AdminUsuariosPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");

  const doList = useServerFn(listUsers);
  const doUpdateRole = useServerFn(updateUserRole);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    if (!loading && user && !isAdmin) navigate({ to: "/" });
  }, [loading, user, isAdmin, navigate]);

  const load = useCallback(async () => {
    setBusy(true);
    const data = await doList();
    setRows(data as Row[]);
    setBusy(false);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const toggleAdmin = async (row: Row) => {
    const newRole = row.role === "admin" ? "user" : "admin";
    if (newRole !== "admin" && row.id === user?.id) {
      toast.error("Você não pode remover seu próprio acesso admin");
      return;
    }
    try {
      await doUpdateRole({ data: { id: row.id, role: newRole } });
      toast.success(newRole === "admin" ? "Usuário promovido a admin" : "Acesso admin removido");
      load();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        (r.name ?? "").toLowerCase().includes(q) ||
        (r.email ?? "").toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q),
    );
  }, [rows, query]);

  if (loading || !isAdmin) {
    return (
      <AdminShell title="Usuários">
        <p className="text-muted-foreground">Carregando...</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Usuários" subtitle={`${rows.length} contas registradas`}>
      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por nome, email ou ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Usuário</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Função</th>
                <th className="px-4 py-3 font-medium">Cadastro</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const isAdminUser = r.role === "admin";
                return (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {r.avatar_url ? (
                          <img
                            src={r.avatar_url}
                            alt=""
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-muted inline-flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate">{r.name || "Sem nome"}</p>
                          <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{r.email || "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isAdminUser
                            ? "bg-amber-500/15 text-amber-700"
                            : "bg-muted text-foreground/70"
                        }`}
                      >
                        {r.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant={isAdminUser ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleAdmin(r)}
                        disabled={busy}
                      >
                        {isAdminUser ? (
                          <>
                            <ShieldOff className="h-3.5 w-3.5 mr-1.5" />
                            Remover admin
                          </>
                        ) : (
                          <>
                            <Shield className="h-3.5 w-3.5 mr-1.5" />
                            Tornar admin
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
