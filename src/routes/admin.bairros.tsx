import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, MapPinned, Save, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNeighborhoods, type DBNeighborhood } from "@/hooks/useNeighborhoods";
import { AdminShell } from "@/components/AdminShell";

export const Route = createFileRoute("/admin/bairros")({
  head: () => ({ meta: [{ title: "Bairros — Admin GuiaAcre" }] }),
  component: AdminBairrosPage,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function AdminBairrosPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { data, refetch } = useNeighborhoods();
  const [editing, setEditing] = useState<DBNeighborhood | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", city: "Rio Branco", image_url: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/" });
  }, [loading, user, isAdmin, navigate]);

  const reset = () => {
    setEditing(null);
    setShowForm(false);
    setForm({ name: "", city: "Rio Branco", image_url: "" });
  };

  const startNew = () => {
    setEditing(null);
    setForm({ name: "", city: "Rio Branco", image_url: "" });
    setShowForm(true);
  };

  const startEdit = (n: DBNeighborhood) => {
    setEditing(n);
    setForm({ name: n.name, city: n.city, image_url: n.image_url ?? "" });
    setShowForm(true);
  };

  const onSave = async () => {
    if (form.name.trim().length < 2) return toast.error("Nome muito curto");
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      city: form.city.trim() || "Rio Branco",
      image_url: form.image_url.trim() || null,
      slug: editing?.slug || slugify(form.name),
    };
    const op = editing
      ? supabase.from("neighborhoods").update(payload).eq("id", editing.id)
      : supabase.from("neighborhoods").insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Bairro atualizado" : "Bairro adicionado");
    reset();
    refetch();
  };

  const onDelete = async (id: string) => {
    if (!confirm("Excluir este bairro?")) return;
    const { error } = await supabase.from("neighborhoods").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Excluído"); refetch(); }
  };

  return (
    <AdminShell
      title="Bairros"
      subtitle="Cadastre e organize os bairros do app"
      actions={
        <button
          onClick={startNew}
          className="inline-flex items-center gap-1.5 h-10 px-3 sm:px-4 rounded-lg bg-brand text-brand-foreground text-sm font-semibold"
        >
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Novo bairro</span>
        </button>
      }
    >
      {showForm && (
        <div className="rounded-2xl bg-card border border-border p-4 sm:p-5 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold flex items-center gap-2">
              {editing ? <><Pencil className="h-4 w-4" /> Editando: {editing.name}</> : <><Plus className="h-4 w-4" /> Novo bairro</>}
            </h3>
            <button onClick={reset} className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Nome</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Bosque"
                className="input mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Cidade</span>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="input mt-1"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">URL da imagem (opcional)</span>
              <input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
                className="input mt-1"
              />
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={onSave}
              disabled={saving}
              className="flex-1 h-10 rounded-lg bg-brand text-brand-foreground font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar"}
            </button>
            <button onClick={reset} className="px-4 h-10 rounded-lg bg-muted text-foreground text-sm font-semibold">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold text-muted-foreground">
            {data.length} {data.length === 1 ? "bairro cadastrado" : "bairros cadastrados"}
          </p>
        </div>
        {data.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">
            Nenhum bairro cadastrado ainda.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {data.map((n) => (
              <li key={n.id} className="flex items-center gap-3 p-3 sm:p-4 hover:bg-muted/30 transition">
                {n.image_url ? (
                  <img src={n.image_url} alt={n.name} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <MapPinned className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold truncate">{n.name}</p>
                  <p className="text-xs text-muted-foreground">{n.city}</p>
                </div>
                <button
                  onClick={() => startEdit(n)}
                  className="h-9 w-9 rounded-lg bg-brand/10 text-brand inline-flex items-center justify-center hover:bg-brand/20"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(n.id)}
                  className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive inline-flex items-center justify-center hover:bg-destructive/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  );
}
