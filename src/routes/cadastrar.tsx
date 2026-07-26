import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Save, ChevronDown, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MobileShell } from "@/components/MobileShell";
import { categories } from "@/lib/data";
import { useAuth } from "@/hooks/useAuth";
import { useNeighborhoods } from "@/hooks/useNeighborhoods";
import { createBusiness } from "@/lib/crud.server";
import { MapView } from "@/components/MapView";

export const Route = createFileRoute("/cadastrar")({
  head: () => ({ meta: [{ title: "Cadastrar empresa — GuiaAcre" }] }),
  component: AddBusinessPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(100),
  categoryId: z.string().min(1, "Escolha a categoria"),
  neighborhoodId: z.string().min(1, "Escolha o bairro"),
  whatsapp: z.string().trim().min(8, "WhatsApp inválido").max(20),
  address: z.string().trim().max(200).optional(),
  description: z.string().trim().max(1000).optional(),
});

function AddBusinessPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { data: neighborhoods } = useNeighborhoods();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    neighborhoodId: "",
    whatsapp: "",
    address: "",
    description: "",
  });

  const doCreate = useServerFn(createBusiness);

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
        toast.success("Localização capturada!");
      },
      (err) => {
        setLocating(false);
        toast.error(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const parsed = schema.parse(form);
      const cat = categories.find((c) => c.id === parsed.categoryId)!;
      const nb = neighborhoods.find((n) => n.slug === parsed.neighborhoodId);
      if (!nb) throw new Error("Bairro inválido");

      await doCreate({
        data: {
          name: parsed.name,
          category: cat.name,
          category_id: cat.id,
          neighborhood: nb.name,
          neighborhood_id: nb.slug,
          whatsapp: parsed.whatsapp.replace(/\D/g, ""),
          address: parsed.address || null,
          description: parsed.description || null,
          image_url: imageUrl,
          status: "pending",
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
        },
      });
      toast.success("Cadastro enviado! Aguarde aprovação do admin.");
      navigate({ to: "/meus-negocios" });
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.errors[0].message : (err as Error).message;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MobileShell>
      <header className="px-5 pt-12 pb-4 flex items-center gap-3">
        <Link to="/perfil" className="h-9 w-9 -ml-2 flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display font-bold text-lg">Cadastrar empresa</h1>
      </header>

      <form onSubmit={onSubmit} className="px-4 space-y-3 pb-6">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">URL da foto (opcional)</label>
          <input
            value={imageUrl ?? ""}
            onChange={(e) => setImageUrl(e.target.value || null)}
            placeholder="https://..."
            className="w-full rounded-xl bg-card border border-border px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>

        <Field
          placeholder="Nome do Negócio"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
        />
        <SelectField
          placeholder="Categoria do Negócio"
          value={form.categoryId}
          onChange={(v) => setForm({ ...form, categoryId: v })}
          options={categories.map((c) => ({ value: c.id, label: `${c.emoji} ${c.name}` }))}
        />
        <SelectField
          placeholder={neighborhoods.length === 0 ? "Carregando bairros..." : "Bairro"}
          value={form.neighborhoodId}
          onChange={(v) => setForm({ ...form, neighborhoodId: v })}
          options={neighborhoods.map((n) => ({ value: n.slug, label: n.name }))}
        />
        <Field
          placeholder="Endereço (rua e número)"
          value={form.address}
          onChange={(v) => setForm({ ...form, address: v })}
        />
        <button
          type="button"
          onClick={captureLocation}
          disabled={locating}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-60"
        >
          <MapPin className={`h-4 w-4 ${coords ? "text-whatsapp" : "text-brand"}`} />
          {locating
            ? "Obtendo localização..."
            : coords
              ? `Localização capturada (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`
              : "Usar minha localização atual"}
        </button>

        {(form.address.trim().length >= 4 || coords) && (
          <MapView
            address={form.address}
            lat={coords?.lat ?? null}
            lng={coords?.lng ?? null}
            interactive
            onResolved={(c) => setCoords(c)}
            onPick={(c) => setCoords(c)}
            height="h-44"
          />
        )}
        <Field
          placeholder="WhatsApp (ex: 5568999999999)"
          type="tel"
          value={form.whatsapp}
          onChange={(v) => setForm({ ...form, whatsapp: v })}
        />
        <Field
          placeholder="Descrição"
          textarea
          value={form.description}
          onChange={(v) => setForm({ ...form, description: v })}
        />

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full h-14 rounded-2xl bg-whatsapp text-whatsapp-foreground font-display font-bold text-base flex items-center justify-center gap-2 shadow-pill active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          <Save className="h-5 w-5" />
          {submitting ? "Enviando..." : "Salvar"}
        </button>
      </form>
    </MobileShell>
  );
}

function Field({
  placeholder,
  type = "text",
  textarea,
  value,
  onChange,
}: {
  placeholder: string;
  type?: string;
  textarea?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  const cls =
    "w-full rounded-xl bg-card border border-border px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/40";
  return textarea ? (
    <textarea
      rows={3}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cls}
    />
  ) : (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cls}
    />
  );
}

function SelectField({
  placeholder,
  value,
  onChange,
  options,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl bg-card border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="h-4 w-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}
