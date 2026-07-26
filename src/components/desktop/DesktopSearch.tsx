import { Link } from "@tanstack/react-router";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { categories } from "@/lib/data";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useNeighborhoods } from "@/hooks/useNeighborhoods";
import { TierBadge } from "@/components/TierBadge";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export function DesktopSearch({ initialCat }: { initialCat?: string }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(initialCat ?? null);
  const [neighborhood, setNeighborhood] = useState<string | null>(null);
  const { data } = useBusinesses();
  const { data: neighborhoods } = useNeighborhoods();

  const list = data.filter(
    (b) =>
      (!cat || b.category_id === cat) &&
      (!neighborhood || b.neighborhood_id === neighborhood) &&
      (!q ||
        b.name.toLowerCase().includes(q.toLowerCase()) ||
        b.category.toLowerCase().includes(q.toLowerCase()) ||
        b.neighborhood.toLowerCase().includes(q.toLowerCase())),
  );

  const hasFilters = cat || neighborhood || q;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-brand font-semibold">Explorar</p>
          <h1 className="font-display font-bold text-4xl mt-1">Buscar negócios</h1>
          <p className="text-muted-foreground mt-2">
            {list.length} resultado{list.length !== 1 ? "s" : ""} encontrado
            {list.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="rounded-2xl bg-card border border-border p-2 shadow-card flex items-center gap-2 mb-6">
        <Search className="h-5 w-5 text-muted-foreground ml-3" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busque por nome, categoria ou bairro..."
          className="flex-1 bg-transparent text-sm focus:outline-none py-3"
        />
        {hasFilters && (
          <button
            onClick={() => {
              setQ("");
              setCat(null);
              setNeighborhood(null);
            }}
            className="h-10 px-3 rounded-xl text-xs text-muted-foreground hover:bg-muted inline-flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" /> Limpar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar filters */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-card border border-border p-5">
            <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Categorias
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setCat(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                  cat === null ? "bg-brand text-brand-foreground" : "hover:bg-muted"
                }`}
              >
                Todas
              </button>
              {categories.map((c) => {
                const count = data.filter((b) => b.category_id === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCat(c.id === cat ? null : c.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center justify-between ${
                      cat === c.id ? "bg-brand text-brand-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <span>
                      {c.emoji} {c.name}
                    </span>
                    <span
                      className={`text-xs ${cat === c.id ? "opacity-80" : "text-muted-foreground"}`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {neighborhoods.length > 0 && (
            <div className="rounded-2xl bg-card border border-border p-5">
              <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Bairros
              </h3>
              <div className="space-y-1 max-h-72 overflow-y-auto">
                <button
                  onClick={() => setNeighborhood(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    neighborhood === null ? "bg-brand text-brand-foreground" : "hover:bg-muted"
                  }`}
                >
                  Todos
                </button>
                {neighborhoods.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setNeighborhood(n.id === neighborhood ? null : n.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      neighborhood === n.id ? "bg-brand text-brand-foreground" : "hover:bg-muted"
                    }`}
                  >
                    {n.name}{" "}
                    <span
                      className={`text-xs ${neighborhood === n.id ? "opacity-80" : "text-muted-foreground"}`}
                    >
                      · {n.city}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Results grid */}
        <div>
          {list.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border p-16 text-center">
              <p className="text-muted-foreground">Nenhum resultado encontrado.</p>
              <p className="text-sm text-muted-foreground mt-2">Tente outros filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {list.map((b) => (
                <Link
                  key={b.id}
                  to="/negocio/$id"
                  params={{ id: b.id }}
                  className="group block rounded-2xl bg-card border border-border overflow-hidden hover:-translate-y-1 hover:shadow-elevated transition"
                >
                  <div className="relative h-44 bg-muted overflow-hidden">
                    {b.image_url ? (
                      <img
                        src={b.image_url}
                        alt={b.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                        Sem foto
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <TierBadge tier={b.tier} />
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-display font-semibold text-base leading-tight line-clamp-1">
                      {b.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {b.category} · {b.neighborhood}
                    </p>
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
    </div>
  );
}
