import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Star, Clock, Share2, Heart, Send, Phone } from "lucide-react";
import { toast } from "sonner";
import { getBusiness } from "@/lib/crud.server";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useReviews, createReview } from "@/hooks/useReviews";
import { Stars } from "@/components/Stars";
import { TierBadge } from "@/components/TierBadge";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { MapView } from "@/components/MapView";
import type { DBBusiness } from "@/hooks/useBusinesses";

export function DesktopBusiness({ id }: { id: string }) {
  const [b, setB] = useState<DBBusiness | null>(null);
  const [loading, setLoading] = useState(true);
  const { isFav, toggle } = useFavorites();
  const { user } = useAuth();
  const { reviews, avg, count, refetch } = useReviews(id);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    getBusiness({ data: { id } }).then((data) => {
      setB(data as DBBusiness | null);
      setLoading(false);
    });
  }, [id]);

  const submitReview = async () => {
    if (!user) return toast.error("Faça login para avaliar");
    setPosting(true);
    try {
      await createReview({ business_id: id, rating, comment: comment.trim() });
      toast.success("Avaliação enviada!");
      setComment("");
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPosting(false);
    }
  };

  if (loading) return <div className="mx-auto max-w-7xl px-6 py-20 text-center text-muted-foreground">Carregando...</div>;
  if (!b) return (
    <div className="mx-auto max-w-7xl px-6 py-20 text-center">
      <p>Negócio não encontrado.</p>
      <Link to="/" className="text-brand underline">Voltar à home</Link>
    </div>
  );

  const fav = isFav(b.id);

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[420px] bg-muted overflow-hidden">
        {b.image_url && <img src={b.image_url} alt={b.name} className="h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute inset-0 mx-auto max-w-7xl px-6 flex flex-col justify-between py-8">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-white/90 hover:text-white w-fit">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="text-white max-w-3xl">
            <TierBadge tier={b.tier} size="md" />
            <h1 className="font-display font-bold text-5xl mt-3">{b.name}</h1>
            <p className="text-lg opacity-90 mt-2">{b.category} · {b.neighborhood}</p>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2"><Stars value={avg} size={18} /> {count > 0 ? `${avg.toFixed(1)} (${count})` : "Sem avaliações"}</span>
              {b.hours && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {b.hours}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
        {/* Main column */}
        <div className="space-y-8">
          {b.description && (
            <section className="rounded-2xl bg-card border border-border p-6">
              <h2 className="font-display font-bold text-xl mb-3">Sobre o negócio</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{b.description}</p>
            </section>
          )}

          <section className="rounded-2xl bg-card border border-border overflow-hidden">
            <MapView address={b.address} lat={b.latitude} lng={b.longitude} height="h-72" />
            <div className="p-5 flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-display font-semibold">{b.address ?? "Endereço não informado"}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{b.neighborhood} · Acre</p>
              </div>
              <MapPin className="h-6 w-6 text-brand shrink-0" />
            </div>
          </section>

          <section className="rounded-2xl bg-card border border-border p-6">
            <h2 className="font-display font-bold text-xl mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" fill="currentColor" />
              Avaliações ({count})
            </h2>

            {user ? (
              <div className="rounded-xl bg-muted/40 p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-sm">Sua avaliação</span>
                  <Stars value={rating} size={22} onChange={setRating} />
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Conte como foi sua experiência..."
                  className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
                <button
                  onClick={submitReview}
                  disabled={posting}
                  className="mt-3 h-10 px-5 rounded-lg bg-brand text-brand-foreground text-sm font-semibold inline-flex items-center gap-2 hover:opacity-90 disabled:opacity-60"
                >
                  <Send className="h-4 w-4" /> {posting ? "Enviando..." : "Enviar avaliação"}
                </button>
              </div>
            ) : (
              <Link to="/auth" className="block text-center text-sm text-brand underline py-4 mb-2">
                Faça login para avaliar este negócio
              </Link>
            )}

            <div className="space-y-3">
              {reviews.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">Seja o primeiro a avaliar.</p>
              )}
              {reviews.map((r) => (
                <div key={r.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {r.author_avatar ? (
                        <img src={r.author_avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                          {r.author_name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold">{r.author_name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("pt-BR")}</p>
                      </div>
                    </div>
                    <Stars value={r.rating} size={16} />
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground mt-3">{r.comment}</p>}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-card border border-border p-5 shadow-card">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Fale agora</p>
            <p className="font-display font-bold text-2xl mt-1">WhatsApp direto</p>
            <p className="text-sm text-muted-foreground mt-1">Atendimento em 1 clique</p>
            <div className="mt-4">
              <WhatsAppButton phone={b.whatsapp} size="lg" label="Chamar no WhatsApp" />
            </div>
            <a
              href={`tel:${b.whatsapp}`}
              className="mt-2 w-full h-11 rounded-xl border border-border hover:bg-muted text-sm font-semibold inline-flex items-center justify-center gap-2"
            >
              <Phone className="h-4 w-4" /> Ligar
            </a>
          </div>

          <div className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggle(b.id)}
                className="flex-1 h-11 rounded-xl border border-border hover:bg-muted text-sm font-semibold inline-flex items-center justify-center gap-2"
              >
                <Heart className={`h-4 w-4 ${fav ? "text-destructive" : ""}`} fill={fav ? "currentColor" : "none"} />
                {fav ? "Salvo" : "Salvar"}
              </button>
              <button
                onClick={() => {
                  navigator.share?.({ url: window.location.href, title: b.name }).catch(() => {});
                  navigator.clipboard?.writeText(window.location.href);
                  toast.success("Link copiado!");
                }}
                className="flex-1 h-11 rounded-xl border border-border hover:bg-muted text-sm font-semibold inline-flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4" /> Compartilhar
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border p-5 text-sm space-y-3">
            <h3 className="font-display font-semibold">Informações</h3>
            <Info label="Categoria" value={b.category} />
            <Info label="Bairro" value={b.neighborhood} />
            {b.address && <Info label="Endereço" value={b.address} />}
            {b.hours && <Info label="Horário" value={b.hours} />}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 pb-2 border-b border-border last:border-0 last:pb-0">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
