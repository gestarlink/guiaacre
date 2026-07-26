import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, MapPin, Star, Clock, Share2, Heart, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MobileShell } from "@/components/MobileShell";
import { DesktopShell } from "@/components/DesktopShell";
import { DesktopBusiness } from "@/components/desktop/DesktopBusiness";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Stars } from "@/components/Stars";
import { TierBadge } from "@/components/TierBadge";
import { getBusiness, createReview } from "@/lib/crud.server";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useGeolocation, haversineKm, formatDistance } from "@/hooks/useGeolocation";
import { useReviews } from "@/hooks/useReviews";
import type { DBBusiness } from "@/hooks/useBusinesses";
import { MapView } from "@/components/MapView";

export const Route = createFileRoute("/negocio/$id")({
  head: () => ({
    meta: [
      { title: `Negócio — GuiaAcre` },
      { property: "og:title", content: `Negócio no GuiaAcre` },
    ],
  }),
  component: BusinessPage,
});

function BusinessPage() {
  const { id } = Route.useParams();
  const [b, setB] = useState<DBBusiness | null>(null);
  const [loading, setLoading] = useState(true);
  const { isFav, toggle } = useFavorites();
  const { user } = useAuth();
  const { coords } = useGeolocation();
  const { reviews, avg, count, refetch } = useReviews(id);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [posting, setPosting] = useState(false);

  const doGet = useServerFn(getBusiness);
  const doCreateReview = useServerFn(createReview);

  useEffect(() => {
    (async () => {
      const data = await doGet({ data: { id } });
      setB(data as DBBusiness | null);
      setLoading(false);
    })();
  }, [id]);

  const distance =
    coords && b?.latitude != null && b?.longitude != null
      ? haversineKm(coords, { lat: b.latitude, lng: b.longitude })
      : null;

  const submitReview = async () => {
    if (!user) {
      toast.error("Faça login para avaliar");
      return;
    }
    setPosting(true);
    try {
      await doCreateReview({
        data: {
          business_id: id,
          rating,
          comment: comment.trim() || undefined,
        },
      });
      toast.success("Avaliação enviada!");
      setComment("");
      refetch();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="hidden md:block">
          <DesktopShell>
            <div className="mx-auto max-w-7xl px-6 py-20 text-center text-muted-foreground">Carregando...</div>
          </DesktopShell>
        </div>
        <div className="md:hidden">
          <MobileShell>
            <div className="p-12 text-center text-muted-foreground">Carregando...</div>
          </MobileShell>
        </div>
      </>
    );
  }

  if (!b) {
    return (
      <>
        <div className="hidden md:block">
          <DesktopShell>
            <div className="mx-auto max-w-7xl px-6 py-20 text-center">
              <p>Negócio não encontrado.</p>
              <Link to="/" className="text-brand underline">Voltar à home</Link>
            </div>
          </DesktopShell>
        </div>
        <div className="md:hidden">
          <MobileShell>
            <div className="p-8 text-center">
              <p>Negócio não encontrado.</p>
              <Link to="/" className="text-brand underline">Voltar</Link>
            </div>
          </MobileShell>
        </div>
      </>
    );
  }

  const fav = isFav(b.id);

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden md:block">
        <DesktopShell>
          <DesktopBusiness id={id} />
        </DesktopShell>
      </div>

      {/* MOBILE */}
      <div className="md:hidden">
        <MobileShell>
          <div className="relative">
        {b.image_url && (
          <img
            src={b.image_url}
            alt={b.name}
            className="h-64 w-full object-cover rounded-b-3xl"
          />
        )}
        <Link
          to="/"
          className="absolute top-12 left-4 h-10 w-10 rounded-full bg-card shadow-card flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="absolute top-12 right-4 flex gap-2">
          <button
            onClick={() => toggle(b.id)}
            className="h-10 w-10 rounded-full bg-card shadow-card flex items-center justify-center"
          >
            <Heart className={`h-5 w-5 ${fav ? "text-destructive" : ""}`} fill={fav ? "currentColor" : "none"} />
          </button>
          <button className="h-10 w-10 rounded-full bg-card shadow-card flex items-center justify-center">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="px-5 -mt-6 relative">
        <div className="rounded-2xl bg-card p-4 shadow-elevated border border-border/60 space-y-2">
          <TierBadge tier={b.tier} size="md" />
          <h1 className="font-display font-bold text-2xl leading-tight">{b.name}</h1>
          <p className="text-sm text-muted-foreground">{b.category} · {b.neighborhood}</p>
          <div className="flex items-center gap-2">
            <Stars value={avg} />
            <span className="text-xs text-muted-foreground">
              {count > 0 ? `${avg.toFixed(1)} (${count} avaliações)` : "Sem avaliações"}
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <MapPin className="h-4 w-4 text-destructive" />
            <span className="text-sm">{b.neighborhood}</span>
            {distance != null && (
              <>
                <span className="text-sm text-muted-foreground">·</span>
                <span className="text-sm font-semibold text-whatsapp">{formatDistance(distance)} de você</span>
              </>
            )}
            {b.hours && (
              <>
                <span className="text-sm text-muted-foreground">·</span>
                <Clock className="h-4 w-4 text-whatsapp" />
                <span className="text-sm">{b.hours}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <section className="px-5 mt-5">
        <div className="rounded-2xl overflow-hidden shadow-card border border-border/60 bg-card">
          <MapView address={b.address} lat={b.latitude} lng={b.longitude} height="h-44" />
          <div className="flex items-center justify-between p-4">
            <div className="min-w-0">
              <p className="font-display font-semibold truncate">{b.address ?? "Endereço não informado"}</p>
              <p className="text-xs text-muted-foreground">{b.neighborhood}, Rio Branco · AC</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-whatsapp/15 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-whatsapp" />
            </div>
          </div>
        </div>
      </section>

      {b.description && (
        <section className="px-5 mt-5">
          <h2 className="font-display font-semibold mb-2">Sobre</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{b.description}</p>
        </section>
      )}

      <section className="px-5 mt-6">
        <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
          <Star className="h-4 w-4 text-highlight-foreground" fill="currentColor" />
          Avaliações
        </h2>

        {user ? (
          <div className="rounded-2xl bg-card p-3 shadow-card border border-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sua nota</span>
              <Stars value={rating} size={22} onChange={setRating} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Deixe um comentário (opcional)"
              className="w-full rounded-xl bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
            <button
              onClick={submitReview}
              disabled={posting}
              className="w-full h-10 rounded-xl bg-brand text-brand-foreground text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {posting ? "Enviando..." : "Enviar avaliação"}
            </button>
          </div>
        ) : (
          <Link to="/auth" className="block text-center text-sm text-brand underline py-2">
            Faça login para avaliar
          </Link>
        )}

        <div className="space-y-3 mt-4">
          {reviews.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Seja o primeiro a avaliar.
            </p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl bg-card p-3 shadow-card border border-border/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {r.author_avatar ? (
                    <img src={r.author_avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                      {r.author_name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  <span className="text-sm font-semibold">{r.author_name}</span>
                </div>
                <Stars value={r.rating} size={14} />
              </div>
              {r.comment && <p className="text-sm text-muted-foreground mt-2">{r.comment}</p>}
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                {new Date(r.created_at).toLocaleDateString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="px-5 mt-6">
        <WhatsAppButton phone={b.whatsapp} size="lg" label="Chamar no WhatsApp" />
      </div>
        </MobileShell>
      </div>
    </>
  );
}
