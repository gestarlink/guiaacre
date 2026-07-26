import { Link } from "@tanstack/react-router";
import { MapPin, Heart } from "lucide-react";
import { WhatsAppButton, WhatsAppIconButton } from "./WhatsAppButton";
import { TierBadge } from "./TierBadge";
import { useFavorites } from "@/hooks/useFavorites";
import { useGeolocation, haversineKm, formatDistance } from "@/hooks/useGeolocation";
import type { DBBusiness } from "@/hooks/useBusinesses";

function useDistance(b: DBBusiness) {
  const { coords } = useGeolocation();
  if (!coords || b.latitude == null || b.longitude == null) return null;
  return formatDistance(haversineKm(coords, { lat: b.latitude, lng: b.longitude }));
}

function FavButton({ id, floating = false }: { id: string; floating?: boolean }) {
  const { isFav, toggle } = useFavorites();
  const fav = isFav(id);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={`${
        floating
          ? "absolute top-2 right-2 h-8 w-8 rounded-full bg-card/95 shadow-card"
          : "h-8 w-8 rounded-full"
      } flex items-center justify-center transition active:scale-90`}
    >
      <Heart
        className={`h-4 w-4 ${fav ? "text-destructive" : "text-muted-foreground"}`}
        fill={fav ? "currentColor" : "none"}
      />
    </button>
  );
}

export function FeaturedCard({ b, fullWidth = false }: { b: DBBusiness; fullWidth?: boolean }) {
  const isPremium = b.tier === "premium";
  return (
    <Link
      to="/negocio/$id"
      params={{ id: b.id }}
      className={`block ${fullWidth ? "w-full" : "w-[230px] shrink-0"} rounded-2xl bg-card shadow-card overflow-hidden border ${
        isPremium ? "border-amber-400/60 ring-1 ring-amber-400/40" : "border-border/60"
      }`}
    >
      <div className="relative h-32 w-full overflow-hidden">
        {b.image_url && (
          <img src={b.image_url} alt={b.name} loading="lazy" className="h-full w-full object-cover" />
        )}
        <FavButton id={b.id} floating />
      </div>
      <div className="p-3 space-y-1.5">
        <TierBadge tier={b.tier} />
        <h3 className="font-display font-semibold text-[15px] leading-tight">{b.name}</h3>
        <p className="text-xs text-muted-foreground">
          {b.category} · {b.neighborhood}
        </p>
        <div className="flex items-center justify-between pt-1">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {b.neighborhood}
          </span>
          <WhatsAppButton phone={b.whatsapp} />
        </div>
      </div>
    </Link>
  );
}

export function BusinessRow({ b }: { b: DBBusiness }) {
  const isPremium = b.tier === "premium";
  const distance = useDistance(b);
  return (
    <Link
      to="/negocio/$id"
      params={{ id: b.id }}
      className={`flex gap-3 rounded-2xl bg-card p-2.5 shadow-card border ${
        isPremium ? "border-amber-400/60 ring-1 ring-amber-400/30" : "border-border/60"
      }`}
    >
      {b.image_url && (
        <img
          src={b.image_url}
          alt={b.name}
          loading="lazy"
          className="h-24 w-24 rounded-xl object-cover shrink-0"
        />
      )}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-[15px] leading-tight truncate">
              {b.name}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              <FavButton id={b.id} />
              <WhatsAppIconButton phone={b.whatsapp} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {b.category} · {b.neighborhood}
          </p>
          {b.tier !== "basic" && (
            <div className="mt-1">
              <TierBadge tier={b.tier} />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-destructive" /> {b.neighborhood}
            {distance && <span className="ml-1 text-whatsapp font-semibold">· {distance}</span>}
          </span>
          <WhatsAppButton phone={b.whatsapp} />
        </div>
      </div>
    </Link>
  );
}
