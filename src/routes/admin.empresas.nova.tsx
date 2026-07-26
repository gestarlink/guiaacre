import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, MapPin } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNeighborhoods } from "@/hooks/useNeighborhoods";
import { categories } from "@/lib/data";
import { AdminShell } from "@/components/AdminShell";
import { createBusiness } from "@/lib/crud.server";
import { MapView } from "@/components/MapView";

export const Route = createFileRoute("/admin/empresas/nova")({
  head: () => ({ meta: [{ title: "Nova empresa — Admin" }] }),
  component: AdminNovaEmpresa,
});

const schema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(100),
  category_id: z.string().min(1, "Escolha a categoria"),
  neighborhood_id: z.string().min(1, "Escolha o bairro"),
  whatsapp: z.string().trim().min(8, "WhatsApp inválido").max(20),
  address: z.string().trim().max(200).optional(),
  description: z.string().trim().max(1000).optional(),
});

function AdminNovaEmpresa() {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const { data: neighborhoods } = useNeighborhoods();
  const [form, setForm] = useState({
    name: "",
    category_id: "",
    neighborhood_id: "",
    whatsapp: "",
    address: "",
    description: "",
    hours: "",
    image_url: null as string | null,
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [saving, setSaving] = useState(false);

  const doCreate = useServerFn(createBusiness);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/" });
  }, [loading, user, isAdmin, navigate]);

  const captureLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocalização não suportada");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
        toast.success("Localização capturada!");
      },
      (err) => toast.error(err.message),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const parsed = schema.parse(form);
      const cat = categories.find((c) => c.id === parsed.category_id)!;
      const nb = neighborhoods.find((n) => n.id === parsed.neighborhood_id);
      if (!nb) throw new Error("Bairro inválido");

      await doCreate({
        data: {
          name: parsed.name,
          category: cat.name,
          category_id: cat.id,
          neighborhood: nb.name,
          neighborhood_id: nb.id,
          whatsapp: parsed.whatsapp.replace(/\D/g, ""),
          address: parsed.address || null,
          description: parsed.description || null,
          hours: form.hours || null,
          image_url: form.image_url,
          latitude: form.latitude,
          longitude: form.longitude,
          status: "approved",
        },
      });
      toast.success("Empresa cadastrada!");
      navigate({ to: "/admin/empresas" });
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.errors[0].message : (err as Error).message;
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Nova empresa"
      subtitle="Cadastre uma empresa direto pelo painel"
      actions={
        <Link to="/admin/empresas" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card title="Foto principal">
            <div>
              <input
                value={form.image_url ?? ""}
                onChange={(e) => setForm({ ...form, image_url: e.target.value || null })}
                placeholder="https://..."
                className="input"
              />
              {form.image_url && (
                <img src={form.image_url} alt="" className="mt-2 w-full h-32 object-cover rounded-lg" />
              )}
            </div>
          </Card>

          <Card title="Informações">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nome">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
              </Field>
              <Field label="WhatsApp">
                <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="55689..." className="input" />
              </Field>
              <Field label="Categoria">
                <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input">
                  <option value="">Selecione...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Bairro">
                <select value={form.neighborhood_id} onChange={(e) => setForm({ ...form, neighborhood_id: e.target.value })} className="input">
                  <option value="">Selecione...</option>
                  {neighborhoods.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
                </select>
              </Field>
              <Field label="Horário" className="sm:col-span-2">
                <input value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="Seg-Sex 8h-18h" className="input" />
              </Field>
              <Field label="Descrição" className="sm:col-span-2">
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input resize-none" />
              </Field>
            </div>
          </Card>

          <Card title="Endereço e mapa">
            <Field label="Endereço completo">
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Rua, número, bairro" className="input" />
            </Field>
            <button
              type="button"
              onClick={captureLocation}
              className="mt-3 inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-muted text-sm font-medium hover:bg-muted/70"
            >
              <MapPin className="h-4 w-4" /> Usar minha localização
            </button>
            <div className="mt-3">
              <MapView
                address={form.address}
                lat={form.latitude}
                lng={form.longitude}
                interactive
                onResolved={(c) => setForm((f) => ({ ...f, latitude: c.lat, longitude: c.lng }))}
                onPick={(c) => setForm((f) => ({ ...f, latitude: c.lat, longitude: c.lng }))}
              />
              <p className="text-xs text-muted-foreground mt-1">Clique no mapa ou arraste o pino para ajustar.</p>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 rounded-xl bg-brand text-brand-foreground font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Cadastrar empresa"}
          </button>
          <p className="text-xs text-muted-foreground">Cadastros pelo painel são aprovados automaticamente.</p>
        </div>
      </form>
    </AdminShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 sm:p-5">
      <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
