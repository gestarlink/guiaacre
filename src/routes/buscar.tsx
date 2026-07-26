import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { MobileShell } from "@/components/MobileShell";
import { DesktopShell } from "@/components/DesktopShell";
import { DesktopSearch } from "@/components/desktop/DesktopSearch";
import { categories } from "@/lib/data";
import { BusinessRow } from "@/components/BusinessCard";
import { useBusinesses } from "@/hooks/useBusinesses";

const searchSchema = z.object({
  cat: z.string().optional(),
});

export const Route = createFileRoute("/buscar")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Buscar — GuiaAcre" }] }),
  component: SearchPage,
});

function SearchPage() {
  const { cat: initialCat } = Route.useSearch();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(initialCat ?? null);
  const { data } = useBusinesses();
  const list = data.filter(
    (b) =>
      (!cat || b.category_id === cat) &&
      (!q || b.name.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden md:block">
        <DesktopShell>
          <DesktopSearch initialCat={initialCat} />
        </DesktopShell>
      </div>

      {/* MOBILE — intacto */}
      <div className="md:hidden">
        <MobileShell>
          <header className="px-5 pt-12 pb-3">
            <h1 className="font-display font-bold text-2xl mb-3">Buscar</h1>
            <div className="flex items-center gap-3 rounded-2xl bg-card shadow-card px-4 py-3 border border-border/60">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="O que você procura no Acre?"
                className="flex-1 bg-transparent text-sm focus:outline-none"
              />
            </div>
          </header>

          <div className="px-4 mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setCat(null)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border ${
                cat === null
                  ? "bg-brand text-brand-foreground border-brand"
                  : "bg-card border-border"
              }`}
            >
              Todos
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border ${
                  cat === c.id
                    ? "bg-brand text-brand-foreground border-brand"
                    : "bg-card border-border"
                }`}
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>

          <section className="px-4 mt-4 space-y-3">
            {list.map((b) => (
              <BusinessRow key={b.id} b={b} />
            ))}
            {list.length === 0 && (
              <p className="text-center text-muted-foreground py-12 text-sm">
                Nenhum resultado encontrado.
              </p>
            )}
          </section>
        </MobileShell>
      </div>
    </>
  );
}
