import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown, MoreHorizontal, Search, ListFilter, Clock } from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { DesktopShell } from "@/components/DesktopShell";
import { DesktopNeighborhood } from "@/components/desktop/DesktopNeighborhood";
import { BusinessRow } from "@/components/BusinessCard";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useNeighborhoods } from "@/hooks/useNeighborhoods";

export const Route = createFileRoute("/bairro/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Tudo no bairro — GuiaAcre` },
      {
        name: "description",
        content: `Explore negócios em ${params.id} no Acre.`,
      },
    ],
  }),
  component: NeighborhoodPage,
});

function NeighborhoodPage() {
  const { id } = Route.useParams();
  const { data: neighborhoods, loading: nLoading } = useNeighborhoods();
  const { data } = useBusinesses();
  const neighborhood = neighborhoods.find((n) => n.slug === id);
  const list = data.filter((b) => b.neighborhood_id === id);

  if (!nLoading && !neighborhood) {
    return (
      <MobileShell>
        <div className="p-8 text-center">
          <p>Bairro não encontrado.</p>
          <Link to="/" className="text-brand underline">
            Voltar
          </Link>
        </div>
      </MobileShell>
    );
  }

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden md:block">
        <DesktopShell>
          <DesktopNeighborhood slug={id} />
        </DesktopShell>
      </div>

      {/* MOBILE — intacto */}
      <div className="md:hidden">
        <MobileShell>
          <header className="px-5 pt-12 pb-3 flex items-center justify-between bg-background">
            <Link to="/" className="h-9 w-9 -ml-2 flex items-center justify-center">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-display font-bold text-lg">
              Tudo na {neighborhood?.name ?? "..."}
            </h1>
            <button className="h-9 w-9 flex items-center justify-center">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </header>

          <div className="px-4 space-y-3">
            <div className="flex items-center gap-2 rounded-xl bg-input px-3.5 py-2.5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-sm text-muted-foreground">{neighborhood?.name}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              <Chip icon={<ListFilter className="h-3.5 w-3.5" />} label="Categoria" caret />
              <Chip icon={<Clock className="h-3.5 w-3.5" />} label="Aberto agora" />
              <Chip icon={<ListFilter className="h-3.5 w-3.5" />} label="Mais" />
            </div>
          </div>

          <section className="px-4 mt-5 space-y-3 pb-6">
            {list.map((b) => (
              <BusinessRow key={b.id} b={b} />
            ))}
            {list.length === 0 && (
              <p className="text-center text-muted-foreground py-12 text-sm">
                Nenhum negócio cadastrado neste bairro ainda.
              </p>
            )}
          </section>
        </MobileShell>
      </div>
    </>
  );
}

function Chip({ icon, label, caret }: { icon: React.ReactNode; label: string; caret?: boolean }) {
  return (
    <button className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium shrink-0 shadow-card">
      {icon}
      {label}
      {caret && <ChevronDown className="h-3 w-3" />}
    </button>
  );
}
