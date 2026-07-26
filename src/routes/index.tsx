import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Bell, MapPin, ChevronDown, Mic, Flame, ChevronRight, Check } from "lucide-react";
import { useState, useRef } from "react";
import Autoplay from "embla-carousel-autoplay";
import { MobileShell } from "@/components/MobileShell";
import { DesktopShell } from "@/components/DesktopShell";
import { DesktopHome } from "@/components/desktop/DesktopHome";
import { categories } from "@/lib/data";
import { FeaturedCard, BusinessRow } from "@/components/BusinessCard";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useNeighborhoods } from "@/hooks/useNeighborhoods";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import logo from "@/assets/logo-guiaacre.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GuiaAcre — Encontre negócios locais no Acre" },
      {
        name: "description",
        content:
          "Descubra restaurantes, lojas e serviços no Acre. Fale direto pelo WhatsApp em segundos.",
      },
      { property: "og:title", content: "GuiaAcre — Negócios locais no Acre" },
      {
        property: "og:description",
        content: "Encontre negócios por bairro e fale no WhatsApp.",
      },
    ],
  }),
  component: HomePage,
});

const STORAGE_KEY = "guiaacre.selected-neighborhood";

function HomePage() {
  const { data: all } = useBusinesses();
  const { data: neighborhoods } = useNeighborhoods();
  const [selectedSlug, setSelectedSlug] = useState<string>(() => {
    if (typeof window === "undefined") return "sobral";
    return localStorage.getItem(STORAGE_KEY) || "sobral";
  });
  const [open, setOpen] = useState(false);
  const autoplay = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true }),
  );

  const selected = neighborhoods.find((n) => n.slug === selectedSlug);
  const premium = all.filter((b) => b.tier === "premium");
  const featured = all.filter((b) => b.tier === "featured" || b.tier === "premium");
  const nearby = all.slice(0, 3);

  const pick = (slug: string) => {
    setSelectedSlug(slug);
    localStorage.setItem(STORAGE_KEY, slug);
    setOpen(false);
  };

  return (
    <>
      {/* DESKTOP */}
      <div className="hidden md:block">
        <DesktopShell>
          <DesktopHome />
        </DesktopShell>
      </div>

      {/* MOBILE — intacto */}
      <div className="md:hidden">
        <MobileShell>
          <header className="bg-brand text-brand-foreground rounded-b-3xl px-5 pt-12 pb-20 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={logo} alt="GuiaAcre" className="h-9 w-9 drop-shadow" draggable={false} />
                <h1 className="font-display font-bold text-2xl tracking-tight">GuiaAcre</h1>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/buscar"
                  className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center"
                >
                  <Search className="h-4.5 w-4.5" />
                </Link>
                <button className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
                  <Bell className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </header>

          <div className="px-4 -mt-14 space-y-3 relative z-10">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="w-full flex items-center justify-between rounded-2xl bg-card shadow-elevated px-4 py-3 border border-border/60 active:scale-[0.99] transition">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-brand" />
                    <div className="text-sm text-left">
                      <span className="font-semibold">{selected?.name ?? "Escolher"}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {selected?.city ?? "Rio Branco"}
                      </span>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl">
                <SheetHeader>
                  <SheetTitle>Escolher bairro</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-1 max-h-[60vh] overflow-y-auto">
                  {neighborhoods.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => pick(n.slug)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted/60 active:bg-muted transition text-left"
                    >
                      <MapPin className="h-4 w-4 text-brand shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{n.name}</p>
                        <p className="text-xs text-muted-foreground">{n.city}</p>
                      </div>
                      {n.slug === selectedSlug && <Check className="h-4 w-4 text-whatsapp" />}
                    </button>
                  ))}
                  {neighborhoods.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-6">
                      Nenhum bairro disponível.
                    </p>
                  )}
                </div>
                {selected && (
                  <Link
                    to="/bairro/$id"
                    params={{ id: selected.slug }}
                    onClick={() => setOpen(false)}
                    className="mt-3 block w-full text-center rounded-xl bg-brand text-brand-foreground py-3 font-semibold text-sm"
                  >
                    Ver tudo em {selected.name}
                  </Link>
                )}
              </SheetContent>
            </Sheet>

            <Link
              to="/buscar"
              className="flex items-center gap-3 rounded-2xl bg-card shadow-card px-4 py-3.5 border border-border/60"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-sm text-muted-foreground">
                O que você procura no Acre?
              </span>
              <Mic className="h-5 w-5 text-brand" />
            </Link>
          </div>

          <section className="mt-6 px-4">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to="/buscar"
                  search={{ cat: c.id }}
                  className="flex flex-col items-center gap-2 shrink-0 w-16"
                >
                  <div
                    className="h-16 w-16 rounded-full flex items-center justify-center shadow-card overflow-hidden"
                    style={{ backgroundColor: c.color }}
                  >
                    <img
                      src={c.icon}
                      alt={c.name}
                      loading="lazy"
                      width={56}
                      height={56}
                      className="h-14 w-14 object-contain"
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground text-center leading-tight">
                    {c.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {premium.length > 0 && (
            <section className="mt-6">
              <div className="flex items-center justify-end px-4 mb-2">
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                  Patrocinado
                </span>
              </div>
              <Carousel
                opts={{ loop: true, align: "center" }}
                plugins={[autoplay.current]}
                className="px-4"
              >
                <CarouselContent className="-ml-3">
                  {premium.map((b) => (
                    <CarouselItem key={b.id} className="pl-3 basis-full">
                      <div className="w-full">
                        <FeaturedCard b={b} fullWidth />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </section>
          )}

          {featured.length > 0 && (
            <section className="mt-6">
              <div className="flex items-center justify-between px-4 mb-3">
                <h2 className="font-display font-bold text-lg flex items-center gap-2">
                  <Flame className="h-5 w-5 text-highlight-foreground" fill="currentColor" />
                  Destaques
                </h2>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2">
                {featured.map((b) => (
                  <FeaturedCard key={b.id} b={b} />
                ))}
              </div>
            </section>
          )}

          <section className="mt-6 px-4">
            <h2 className="font-display font-bold text-lg flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-brand" />
              Explorar <span className="font-medium text-muted-foreground">bairros</span>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {neighborhoods.slice(0, 4).map((n) => (
                <Link
                  key={n.id}
                  to="/bairro/$id"
                  params={{ id: n.slug }}
                  className="relative h-32 rounded-2xl overflow-hidden shadow-card bg-muted"
                >
                  {n.image_url && (
                    <img
                      src={n.image_url}
                      alt={n.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-white font-display font-bold text-lg">
                    {n.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-6 px-4 pb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-destructive" fill="currentColor" />
                Perto de você
              </h2>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {nearby.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum negócio cadastrado ainda. Seja o primeiro!
                </p>
              )}
              {nearby.map((b) => (
                <BusinessRow key={b.id} b={b} />
              ))}
            </div>
          </section>
        </MobileShell>
      </div>
    </>
  );
}
