import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { DesktopShell } from "@/components/DesktopShell";
import { useNeighborhoods } from "@/hooks/useNeighborhoods";
import { useBusinesses } from "@/hooks/useBusinesses";
import { MapPinned, MapPin } from "lucide-react";

export const Route = createFileRoute("/bairros")({
  head: () => ({ meta: [{ title: "Bairros — GuiaAcre" }] }),
  component: NeighborhoodsPage,
});

function NeighborhoodsPage() {
  const { data, loading } = useNeighborhoods();
  const { data: businesses } = useBusinesses();

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden md:block">
        <DesktopShell>
          <div className="mx-auto max-w-7xl px-6 py-10">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-wider text-brand font-semibold">
                Por região
              </p>
              <h1 className="font-display font-bold text-4xl mt-1">Explore por bairro</h1>
              <p className="text-muted-foreground mt-2">
                Descubra os melhores negócios em cada região do Acre
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {loading && (
                <p className="col-span-full text-center text-muted-foreground py-16">
                  Carregando...
                </p>
              )}
              {!loading && data.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-16">
                  Nenhum bairro cadastrado ainda.
                </p>
              )}
              {data.map((n) => {
                const count = businesses.filter((b) => b.neighborhood_id === n.id).length;
                return (
                  <Link
                    key={n.id}
                    to="/bairro/$id"
                    params={{ id: n.slug }}
                    className="group relative h-64 rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition"
                  >
                    {n.image_url ? (
                      <img
                        src={n.image_url}
                        alt={n.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition duration-500"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <MapPinned className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-5 text-white">
                      <p className="text-xs opacity-80 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {n.city}
                      </p>
                      <p className="font-display font-bold text-2xl mt-1">{n.name}</p>
                      <p className="text-sm opacity-90 mt-1">
                        {count} negócio{count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </DesktopShell>
      </div>

      {/* MOBILE — intacto */}
      <div className="md:hidden">
        <MobileShell>
          <header className="px-5 pt-12 pb-3">
            <h1 className="font-display font-bold text-2xl">Bairros</h1>
            <p className="text-sm text-muted-foreground">Explore negócios por região</p>
          </header>
          <section className="px-4 mt-4 grid grid-cols-2 gap-3">
            {loading && (
              <p className="col-span-2 text-center text-sm text-muted-foreground py-8">
                Carregando...
              </p>
            )}
            {!loading && data.length === 0 && (
              <p className="col-span-2 text-center text-sm text-muted-foreground py-8">
                Nenhum bairro cadastrado ainda.
              </p>
            )}
            {data.map((n) => (
              <Link
                key={n.id}
                to="/bairro/$id"
                params={{ id: n.slug }}
                className="relative h-40 rounded-2xl overflow-hidden shadow-card bg-muted"
              >
                {n.image_url ? (
                  <img
                    src={n.image_url}
                    alt={n.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <MapPinned className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="font-display font-bold text-lg leading-tight">{n.name}</p>
                  <p className="text-xs opacity-90">{n.city}</p>
                </div>
              </Link>
            ))}
          </section>
        </MobileShell>
      </div>
    </>
  );
}
