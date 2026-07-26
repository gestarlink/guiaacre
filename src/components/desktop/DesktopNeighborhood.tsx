import { Link } from "@tanstack/react-router";
import { MapPin, ArrowLeft } from "lucide-react";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useNeighborhoods } from "@/hooks/useNeighborhoods";
import { TierBadge } from "@/components/TierBadge";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export function DesktopNeighborhood({ slug }: { slug: string }) {
  const { data: neighborhoods } = useNeighborhoods();
  const { data } = useBusinesses();
  const neighborhood = neighborhoods.find((n) => n.slug === slug);
  const list = data.filter((b) => b.neighborhood_id === slug);

  if (!neighborhood) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <p className="text-muted-foreground">Bairro não encontrado.</p>
        <Link to="/bairros" className="text-brand underline mt-3 inline-block">Ver todos os bairros</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-72 bg-muted overflow-hidden">
        {neighborhood.image_url && (
          <img src={neighborhood.image_url} alt={neighborhood.name} className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />
        <div className="absolute inset-0 mx-auto max-w-7xl px-6 flex flex-col justify-end pb-10 text-white">
          <Link to="/bairros" className="inline-flex items-center gap-1 text-sm opacity-90 hover:opacity-100 mb-3">
            <ArrowLeft className="h-4 w-4" /> Todos os bairros
          </Link>
          <p className="text-sm opacity-90 flex items-center gap-1"><MapPin className="h-4 w-4" /> {neighborhood.city}</p>
          <h1 className="font-display font-bold text-5xl mt-2">{neighborhood.name}</h1>
          <p className="mt-2 opacity-90">{list.length} negócio{list.length !== 1 ? "s" : ""} cadastrado{list.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {list.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border p-16 text-center">
            <p className="text-muted-foreground">Nenhum negócio cadastrado neste bairro ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {list.map((b) => (
              <Link
                key={b.id}
                to="/negocio/$id"
                params={{ id: b.id }}
                className="group block rounded-2xl bg-card border border-border overflow-hidden hover:-translate-y-1 hover:shadow-elevated transition"
              >
                <div className="relative h-48 bg-muted overflow-hidden">
                  {b.image_url ? (
                    <img src={b.image_url} alt={b.name} className="h-full w-full object-cover group-hover:scale-110 transition duration-500" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">Sem foto</div>
                  )}
                  <div className="absolute top-3 left-3">
                    <TierBadge tier={b.tier} />
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-display font-semibold text-base leading-tight line-clamp-1">{b.name}</h3>
                  <p className="text-xs text-muted-foreground">{b.category}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {b.neighborhood}
                    </span>
                    <WhatsAppButton phone={b.whatsapp} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
