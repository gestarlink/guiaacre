import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Plus, Trash2, Tag, Save, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useCategories, type DBCategory } from "@/hooks/useCategories";
import { AdminShell } from "@/components/AdminShell";
import { createCategory, updateCategory, deleteCategory } from "@/lib/crud.server";

export const Route = createFileRoute("/admin/categorias")({
  head: () => ({ meta: [{ title: "Categorias — Admin GuiaAcre" }] }),
  component: AdminCategoriasPage,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const emptyForm = { name: "", emoji: "", icon: "", sort_order: 0 };

function AdminCategoriasPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { data, refetch } = useCategories();
  const [editing, setEditing] = useState<DBCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const doCreate = useServerFn(createCategory);
  const doUpdate = useServerFn(updateCategory);
  const doDelete = useServerFn(deleteCategory);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/" });
  }, [loading, user, isAdmin, navigate]);

  const reset = () => {
    setEditing(null);
    setShowForm(false);
    setForm(emptyForm);
  };

  const startNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, sort_order: data.length + 1 });
    setShowForm(true);
  };

  const startEdit = (c: DBCategory) => {
    setEditing(c);
    setForm({
      name: c.name,
      emoji: c.emoji ?? "",
      icon: c.icon_url ?? "",
      sort_order: c.sort_order,
    });
    setShowForm(true);
  };

  const onSave = async () => {
    if (form.name.trim().length < 2) return toast.error("Nome muito curto");
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        slug: editing?.slug || slugify(form.name),
        description: form.emoji.trim() || null,
        icon: form.icon.trim() || null,
      };
      if (editing) {
        await doUpdate({ data: { ...payload, id: Number(editing.id) } });
        toast.success("Categoria atualizada");
      } else {
        await doCreate({ data: payload });
        toast.success("Categoria adicionada");
      }
      reset();
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Excluir esta categoria?")) return;
    try {
      await doDelete({ data: { id: Number(id) } });
      toast.success("Excluída");
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <AdminShell
      title="Categorias"
      subtitle="Gerencie as categorias de negócios"
      actions={
        <button
          onClick={startNew}
          className="inline-flex items-center gap-1.5 h-10 px-3 sm:px-4 rounded-lg bg-brand text-brand-foreground text-sm font-semibold"
        >
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Nova categoria</span>
        </button>
      }
    >
      {showForm && (
        <div className="rounded-2xl bg-card border border-border p-4 sm:p-5 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-semibold flex items-center gap-2">
              {editing ? (
                <>
                  <Pencil className="h-4 w-4" /> Editando: {editing.name}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Nova categoria
                </>
              )}
            </h3>
            <button
              onClick={reset}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Nome</span>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Alimentação"
                className="input mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Emoji</span>
              <input
                value={form.emoji}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                placeholder="🍔"
                className="input mt-1"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Ordem</span>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                className="input mt-1"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">
                URL do ícone (opcional)
              </span>
              <input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
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
            <button
              onClick={reset}
              className="px-4 h-10 rounded-lg bg-muted text-foreground text-sm font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <p className="text-sm font-semibold text-muted-foreground">
            {data.length} {data.length === 1 ? "categoria cadastrada" : "categorias cadastradas"}
          </p>
        </div>
        {data.length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">
            Nenhuma categoria cadastrada ainda.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {data.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 p-3 sm:p-4 hover:bg-muted/30 transition"
              >
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0 text-2xl"
                  style={{ background: c.color ?? "var(--muted)" }}
                >
                  {c.icon_url ? (
                    <img src={c.icon_url} alt={c.name} className="h-10 w-10 object-contain" />
                  ) : c.emoji ? (
                    c.emoji
                  ) : (
                    <Tag className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    /{c.slug} · ordem {c.sort_order}
                  </p>
                </div>
                <button
                  onClick={() => startEdit(c)}
                  className="h-9 w-9 rounded-lg bg-brand/10 text-brand inline-flex items-center justify-center hover:bg-brand/20"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onDelete(c.id)}
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
