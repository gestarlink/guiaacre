import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { BusinessRow } from "@/components/BusinessCard";
import { useFavorites } from "@/hooks/useFavorites";
import { useBusinesses } from "@/hooks/useBusinesses";

export const Route = createFileRoute("/favoritos")({
  head: () => ({ meta: [{ title: "Favoritos — GuiaAcre" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favs } = useFavorites();
  const { data } = useBusinesses();
  const list = data.filter((b) => favs.includes(b.id));

  return (
    <MobileShell>
      <header className="px-5 pt-12 pb-3 flex items-center gap-2">
        <Heart className="h-6 w-6 text-destructive" fill="currentColor" />
        <h1 className="font-display font-bold text-2xl">Favoritos</h1>
      </header>
      <section className="px-4 mt-3 space-y-3">
        {list.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">
            Nenhum favorito ainda. Toque no ❤️ nos cards.
          </p>
        )}
        {list.map((b) => (
          <BusinessRow key={b.id} b={b} />
        ))}
      </section>
    </MobileShell>
  );
}
