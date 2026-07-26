import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
  Trash2,
  Check,
  X,
  Crown,
  Star,
  Store,
  MapPin,
  Phone,
  Clock,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { AdminShell } from "@/components/AdminShell";
import { getBusiness, updateBusiness, deleteBusiness } from "@/lib/crud.server";
import type { DBBusiness, BusinessTier } from "@/hooks/useBusinesses";
import { useNeighborhoods } from "@/hooks/useNeighborhoods";
import { categories } from "@/lib/data";
import { MapView } from "@/components/MapView";

export const Route = createFileRoute("/admin/empresas/$id")({
  head: () => ({ meta: [{ title: "Editar empresa — Admin" }] }),
  component: AdminEmpresaDetail,
});

function AdminEmpresaDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const { data: neighborhoods } = useNeighborhoods();
  const [biz, setBiz] = useState<DBBusiness | null>(null);
  const [loadingBiz, setLoadingBiz] = useState(true);
  const [saving, setSaving] = useState(false);

  const doGet = useServerFn(getBusiness);
  const doUpdate = useServerFn(updateBusiness);
  const doDelete = useServerFn(deleteBusiness);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    if (!loading && user && !isAdmin) navigate({ to: "/" });
  }, [loading, user, isAdmin, navigate]);

  useEffect(() => {
    void (async () => {
      setLoadingBiz(true);
      try {
        const data = await doGet({ data: { id } });
        setBiz((data as DBBusiness) ?? null);
      } catch (err) {
        toast.error((err as Error).message);
      }
      setLoadingBiz(false);
    })();
  }, [id]);

  if (loading || loadingBiz) {
    return (
      <AdminShell title="Empresa">
        <p className="text-muted-foreground">Carregando...</p>
      </AdminShell>
    );
  }
  if (!biz) {
    return (
      <AdminShell title="Empresa não encontrada">
        <Link to="/admin/empresas" className="text-brand font-semibold">
          ← Voltar
        </Link>
      </AdminShell>
    );
  }

  const update = (patch: Partial<DBBusiness>) =>
    setBiz((prev) => (prev ? { ...prev, ...patch } : prev));

  const persist = async (patch: Record<string, unknown>, msg: string) => {
    try {
      await doUpdate({ data: { id, ...patch } });
      toast.success(msg);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const setStatus = async (status: "approved" | "rejected" | "pending") => {
    update({ status });
    await persist(
      { status },
      status === "approved"
        ? "Empresa aprovada"
        : status === "rejected"
          ? "Rejeitada"
          : "Marcada como pendente",
    );
  };

  const setTier = async (tier: BusinessTier) => {
    const highlight = tier === "featured" || tier === "premium";
    update({ tier, highlight });
    await persist(
      { tier, highlight },
      `Plano: ${tier === "premium" ? "Premium" : tier === "featured" ? "Destaque" : "Básico"}`,
    );
  };

  const saveAll = async () => {
    setSaving(true);
    const payload = {
      name: biz.name,
      category: biz.category,
      category_id: biz.category_id,
      neighborhood: biz.neighborhood,
      neighborhood_id: biz.neighborhood_id,
      address: biz.address,
      description: biz.description,
      hours: biz.hours,
      whatsapp: biz.whatsapp,
      image_url: biz.image_url,
      latitude: biz.latitude,
      longitude: biz.longitude,
    };
    try {
      await doUpdate({ data: { id, ...payload } });
      toast.success("Alterações salvas");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm("Excluir esta empresa? Esta ação não pode ser desfeita.")) return;
    try {
      await doDelete({ data: { id } });
      toast.success("Empresa excluída");
      navigate({ to: "/admin/empresas" });
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <AdminShell
      title={biz.name}
      subtitle={`${biz.category} · ${biz.neighborhood}`}
      actions={
        <Link
          to="/admin/empresas"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left: form */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card title="Informações da empresa">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nome">
                <input
                  value={biz.name}
                  onChange={(e) => update({ name: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="WhatsApp">
                <input
                  value={biz.whatsapp}
                  onChange={(e) => update({ whatsapp: e.target.value })}
                  className="input"
                />
              </Field>
              <Field label="Categoria">
                <select
                  value={biz.category_id}
                  onChange={(e) => {
                    const c = categories.find((x) => x.id === e.target.value);
                    if (c) update({ category_id: c.id, category: c.name });
                  }}
                  className="input"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Bairro">
                <select
                  value={biz.neighborhood_id}
                  onChange={(e) => {
                    const n = neighborhoods.find((x) => x.id === e.target.value);
                    if (n) update({ neighborhood_id: n.id, neighborhood: n.name });
                  }}
                  className="input"
                >
                  {neighborhoods.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Horário de funcionamento" className="sm:col-span-2">
                <input
                  value={biz.hours ?? ""}
                  onChange={(e) => update({ hours: e.target.value })}
                  placeholder="Seg-Sex 8h-18h"
                  className="input"
                />
              </Field>
              <Field label="Descrição" className="sm:col-span-2">
                <textarea
                  value={biz.description ?? ""}
                  onChange={(e) => update({ description: e.target.value })}
                  rows={3}
                  className="input resize-none"
                />
              </Field>
              <Field label="URL da foto" className="sm:col-span-2">
                <input
                  value={biz.image_url ?? ""}
                  onChange={(e) => {
                    const url = e.target.value || null;
                    update({ image_url: url });
                    void persist({ image_url: url }, "Foto atualizada");
                  }}
                  placeholder="https://..."
                  className="input"
                />
              </Field>
            </div>
          </Card>

          <Card title="Endereço e mapa">
            <Field label="Endereço completo">
              <input
                value={biz.address ?? ""}
                onChange={(e) => update({ address: e.target.value })}
                placeholder="Rua, número, bairro, cidade"
                className="input"
              />
            </Field>
            <div className="mt-3">
              <MapView
                address={biz.address}
                lat={biz.latitude}
                lng={biz.longitude}
                interactive
                onResolved={(c) => update({ latitude: c.lat, longitude: c.lng })}
                onPick={(c) => update({ latitude: c.lat, longitude: c.lng })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Clique no mapa ou arraste o pino para ajustar. Salve para confirmar.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Field label="Latitude">
                <input
                  type="number"
                  step="any"
                  value={biz.latitude ?? ""}
                  onChange={(e) =>
                    update({ latitude: e.target.value === "" ? null : Number(e.target.value) })
                  }
                  className="input"
                />
              </Field>
              <Field label="Longitude">
                <input
                  type="number"
                  step="any"
                  value={biz.longitude ?? ""}
                  onChange={(e) =>
                    update({ longitude: e.target.value === "" ? null : Number(e.target.value) })
                  }
                  className="input"
                />
              </Field>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={saveAll}
              disabled={saving}
              className="flex-1 h-11 rounded-xl bg-brand text-brand-foreground font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar alterações"}
            </button>
            <button
              onClick={remove}
              className="h-11 px-4 rounded-xl bg-destructive/10 text-destructive font-semibold inline-flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" /> Excluir empresa
            </button>
          </div>
        </div>

        {/* Right: status + tier + preview */}
        <div className="space-y-4 sm:space-y-6">
          <Card title="Status do cadastro">
            <div className="grid grid-cols-3 gap-2">
              <ActionBtn
                active={biz.status === "approved"}
                onClick={() => setStatus("approved")}
                icon={Check}
                label="Aprovar"
                activeClass="bg-green-500 text-white"
              />
              <ActionBtn
                active={biz.status === "pending"}
                onClick={() => setStatus("pending")}
                icon={Clock}
                label="Pendente"
                activeClass="bg-orange-500 text-white"
              />
              <ActionBtn
                active={biz.status === "rejected"}
                onClick={() => setStatus("rejected")}
                icon={X}
                label="Rejeitar"
                activeClass="bg-red-500 text-white"
              />
            </div>
          </Card>

          <Card title="Plano / Assinatura">
            <div className="space-y-2">
              <TierOption
                active={biz.tier === "basic"}
                onClick={() => setTier("basic")}
                title="Básico"
                desc="Listagem padrão"
                icon={Store}
              />
              <TierOption
                active={biz.tier === "featured"}
                onClick={() => setTier("featured")}
                title="Destaque"
                desc="Aparece em destaque na home"
                icon={Star}
                accent="text-blue-600"
              />
              <TierOption
                active={biz.tier === "premium"}
                onClick={() => setTier("premium")}
                title="Premium"
                desc="Topo da lista + selo dourado"
                icon={Crown}
                accent="text-amber-600"
              />
            </div>
          </Card>

          <Card title="Pré-visualização">
            {biz.image_url && (
              <img
                src={biz.image_url}
                alt={biz.name}
                className="w-full h-32 object-cover rounded-lg"
              />
            )}
            <p className="font-display font-semibold mt-3">{biz.name}</p>
            <p className="text-xs text-muted-foreground">{biz.category}</p>
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {biz.neighborhood}
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {biz.whatsapp}
              </p>
            </div>
            <Link
              to="/negocio/$id"
              params={{ id: biz.id }}
              className="mt-3 inline-flex items-center gap-1 text-sm text-brand font-semibold"
            >
              Ver no app <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 sm:p-5">
      <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function ActionBtn({
  active,
  onClick,
  icon: Icon,
  label,
  activeClass,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  activeClass: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-10 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1 border transition ${
        active
          ? `${activeClass} border-transparent`
          : "bg-card border-border text-muted-foreground hover:bg-muted"
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}

function TierOption({
  active,
  onClick,
  title,
  desc,
  icon: Icon,
  accent = "text-foreground",
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition ${
        active ? "border-brand bg-brand/5" : "border-border hover:bg-muted/50"
      }`}
    >
      <div
        className={`h-9 w-9 rounded-lg bg-muted inline-flex items-center justify-center ${accent}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      {active && <Check className="h-4 w-4 text-brand" />}
    </button>
  );
}
