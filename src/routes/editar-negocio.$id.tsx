import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Camera, Save, ChevronDown, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { MobileShell } from "@/components/MobileShell";
import { categories } from "@/lib/data";
import { useAuth } from "@/hooks/useAuth";
import { useNeighborhoods } from "@/hooks/useNeighborhoods";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/editar-negocio/$id")({
  head: () => ({ meta: [{ title: "Editar negócio — GuiaAcre" }] }),
  component: EditBusinessPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(100),
  categoryId: z.string().min(1, "Escolha a categoria"),
  neighborhoodId: z.string().min(1, "Escolha o bairro"),
  whatsapp: z.string().trim().min(8, "WhatsApp inválido").max(20),
  address: z.string().trim().max(200).optional(),
  description: z.string().trim().max(1000).optional(),
  hours: z.string().trim().max(100).optional(),
});

function EditBusinessPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  const { data: neighborhoods } = useNeighborhoods();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    neighborhoodId: "",
    whatsapp: "",
    address: "",
    description: "",
    hours: "",
  });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  useEffect(() => {
    supabase
      .from("businesses")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          toast.error("Negócio não encontrado");
          navigate({ to: "/meus-negocios" });
          return;
        }
        setOwnerId(data.owner_id);
        setForm({
          name: data.name,
          categoryId: data.category_id,
          neighborhoodId: data.neighborhood_id ?? "",
          whatsapp: data.whatsapp ?? "",
          address: data.address ?? "",
          description: data.description ?? "",
          hours: data.hours ?? "",
        });
        if (data.image_url) setPhotoPreview(data.image_url);
        if (data.latitude != null && data.longitude != null) {
          setCoords({ lat: data.latitude, lng: data.longitude });
        }
        setLoadingData(false);
      });
  }, [id, navigate]);

  useEffect(() => {
    if (!loadingData && ownerId && user && ownerId !== user.id && !isAdmin) {
      toast.error("Você não tem permissão para editar este negócio");
      navigate({ to: "/meus-negocios" });
    }
  }, [loadingData, ownerId, user, isAdmin, navigate]);

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

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setPhotoFile(f);
      setPhotoPreview(URL.createObjectURL(f));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const parsed = schema.parse(form);
      const cat = categories.find((c) => c.id === parsed.categoryId)!;
      const nb = neighborhoods.find((n) => n.slug === parsed.neighborhoodId);
      if (!nb) throw new Error("Bairro inválido");

      let imageUrl: string | undefined;
      if (photoFile) {
        const ext = photoFile.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("business-photos")
          .upload(path, photoFile, { upsert: false });
        if (upErr) throw upErr;
        imageUrl = supabase.storage.from("business-photos").getPublicUrl(path).data.publicUrl;
      }

      const { error } = await supabase
        .from("businesses")
        .update({
          name: parsed.name,
          category: cat.name,
          category_id: cat.id,
          neighborhood: nb.name,
          neighborhood_id: nb.slug,
          whatsapp: parsed.whatsapp.replace(/\D/g, ""),
          address: parsed.address || null,
          description: parsed.description || null,
          hours: parsed.hours || null,
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
          ...(imageUrl ? { image_url: imageUrl } : {}),
        })
        .eq("id", id);
      if (error) throw error;
      toast.success("Negócio atualizado!");
      navigate({ to: isAdmin && ownerId !== user.id ? "/admin" : "/meus-negocios" });
    } catch (err) {
      const msg = err instanceof z.ZodError ? err.errors[0].message : (err as Error).message;
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <MobileShell>
        <div className="p-12 text-center text-muted-foreground">Carregando...</div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <header className="px-5 pt-12 pb-4 flex items-center gap-3">
        <Link to="/meus-negocios" className="h-9 w-9 -ml-2 flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display font-bold text-lg">Editar negócio</h1>
      </header>

      <form onSubmit={onSubmit} className="px-4 space-y-3 pb-6">
        <label className="w-full rounded-xl bg-card border border-border px-3 py-3 flex items-center gap-2 cursor-pointer">
          <Camera className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground truncate flex-1">
            {photoFile ? photoFile.name : "Trocar foto do negócio"}
          </span>
          <input type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
        </label>

        {photoPreview && (
          <img src={photoPreview} alt="Preview" className="h-40 w-full object-cover rounded-xl" />
        )}

        <Field placeholder="Nome do Negócio" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <SelectField
          placeholder="Categoria do Negócio"
          value={form.categoryId}
          onChange={(v) => setForm({ ...form, categoryId: v })}
          options={categories.map((c) => ({ value: c.id, label: `${c.emoji} ${c.name}` }))}
        />
        <SelectField
          placeholder="Bairro"
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
              ? `Localização (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`
              : "Definir localização atual"}
        </button>
        <Field
          placeholder="WhatsApp (ex: 5568999999999)"
          type="tel"
          value={form.whatsapp}
          onChange={(v) => setForm({ ...form, whatsapp: v })}
        />
        <Field
          placeholder="Horário (ex: Seg–Sáb 8h–18h)"
          value={form.hours}
          onChange={(v) => setForm({ ...form, hours: v })}
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
          className="mt-2 w-full h-14 rounded-xl bg-whatsapp text-whatsapp-foreground font-display font-bold flex items-center justify-center gap-2 shadow-pill active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          <Save className="h-5 w-5" />
          {submitting ? "Salvando..." : "Salvar alterações"}
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
