import { Link } from "@tanstack/react-router";
import {
  Search,
  MapPin,
  ArrowRight,
  Star,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { categories } from "@/lib/data";
import { useBusinesses } from "@/hooks/useBusinesses";
import { useNeighborhoods } from "@/hooks/useNeighborhoods";
import { TierBadge } from "@/components/TierBadge";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export function DesktopHome() {
  const { data: all } = useBusinesses();
  const { data: neighborhoods } = useNeighborhoods();

  const premium = all.filter((b) => b.tier === "premium").slice(0, 6);
  const featured = all.filter((b) => b.tier === "featured" || b.tier === "premium").slice(0, 8);
  const recent = all.slice(0, 12);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand via-brand to-brand/80 text-brand-foreground">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.2) 0%, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              {all.length}+ negócios cadastrados no Acre
            </div>
            <h1 className="font-display font-bold text-5xl lg:text-6xl leading-[1.05] tracking-tight">
              Descubra o melhor do
              <span className="block bg-gradient-to-r from-yellow-200 to-orange-200 bg-clip-text text-transparent">
                comércio acreano
              </span>
            </h1>
            <p className="mt-6 text-lg opacity-90 leading-relaxed max-w-xl">
              Restaurantes, lojas, serviços e profissionais perto de você. Encontre, avalie e fale
              direto pelo WhatsApp.
            </p>

            <Link
              to="/buscar"
              className="mt-8 inline-flex items-center w-full max-w-xl bg-card text-foreground rounded-2xl shadow-elevated p-2 pl-5 gap-3 group"
            >
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm text-muted-foreground py-3">
                O que você procura no Acre?
              </span>
              <span className="h-12 px-5 rounded-xl bg-brand text-brand-foreground font-semibold text-sm inline-flex items-center gap-2 group-hover:opacity-90">
                Buscar <ArrowRight className="h-4 w-4" />
              </span>
            </Link>

            <div className="mt-8 flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Negócios verificados
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" /> Contato em 1 clique
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" /> Avaliações reais
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="grid grid-cols-2 gap-4">
              {neighborhoods.slice(0, 4).map((n, i) => (
                <Link
                  key={n.id}
                  to="/bairro/$id"
                  params={{ id: n.slug }}
                  className={`relative rounded-2xl overflow-hidden shadow-elevated group ${
                    i % 2 === 0 ? "h-48" : "h-64"
                  } ${i === 1 ? "mt-8" : ""}`}
                >
                  {n.image_url && (
                    <img
                      src={n.image_url}
                      alt={n.name}
                      className="h-full w-full object-cover group-hover:scale-110 transition duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                    <p className="text-xs opacity-80">{n.city}</p>
                    <p className="font-display font-bold text-lg">{n.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-brand font-semibold">Categorias</p>
            <h2 className="font-display font-bold text-3xl mt-1">Encontre por categoria</h2>
          </div>
          <Link
            to="/buscar"
            className="text-sm text-brand font-semibold hover:underline inline-flex items-center gap-1"
          >
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/buscar"
              search={{ cat: c.id }}
              className="group relative rounded-2xl bg-card border border-border hover:border-brand hover:shadow-elevated p-6 text-center transition"
            >
              <div
                className="mx-auto h-20 w-20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition"
                style={{ backgroundColor: c.color }}
              >
                <img src={c.icon} alt={c.name} className="h-16 w-16 object-contain" />
              </div>
              <p className="font-display font-semibold">{c.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {all.filter((b) => b.category_id === c.id).length} negócios
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* PREMIUM */}
      {premium.length > 0 && (
        <section className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-yellow-950/20 py-14">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-wider text-amber-600 font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Premium
                </p>
                <h2 className="font-display font-bold text-3xl mt-1">Negócios em destaque</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {premium.map((b) => (
                <DesktopBusinessCard key={b.id} b={b} variant="premium" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-wider text-brand font-semibold flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" /> Em alta
              </p>
              <h2 className="font-display font-bold text-3xl mt-1">Mais procurados</h2>
            </div>
            <Link
              to="/buscar"
              className="text-sm text-brand font-semibold hover:underline inline-flex items-center gap-1"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featured.map((b) => (
              <DesktopBusinessCard key={b.id} b={b} />
            ))}
          </div>
        </section>
      )}

      {/* NEIGHBORHOODS */}
      <section className="bg-muted/40 py-14">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-wider text-brand font-semibold flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Por região
              </p>
              <h2 className="font-display font-bold text-3xl mt-1">Explore por bairro</h2>
            </div>
            <Link
              to="/bairros"
              className="text-sm text-brand font-semibold hover:underline inline-flex items-center gap-1"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {neighborhoods.map((n) => (
              <Link
                key={n.id}
                to="/bairro/$id"
                params={{ id: n.slug }}
                className="relative h-48 rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition group"
              >
                {n.image_url && (
                  <img
                    src={n.image_url}
                    alt={n.name}
                    className="h-full w-full object-cover group-hover:scale-110 transition duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                  <p className="text-xs opacity-80">{n.city}</p>
                  <p className="font-display font-bold text-xl">{n.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT */}
      {recent.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-wider text-brand font-semibold">Novidades</p>
              <h2 className="font-display font-bold text-3xl mt-1">Adicionados recentemente</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {recent.map((b) => (
              <DesktopBusinessCard key={b.id} b={b} />
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-3xl bg-gradient-to-r from-brand to-brand/80 text-brand-foreground p-10 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-elevated">
          <div>
            <h3 className="font-display font-bold text-3xl lg:text-4xl">Tem um negócio no Acre?</h3>
            <p className="mt-3 opacity-90 text-lg">
              Cadastre grátis e seja encontrado por milhares de clientes.
            </p>
          </div>
          <Link
            to="/cadastrar"
            className="h-14 px-8 rounded-full bg-card text-brand font-bold text-base inline-flex items-center gap-2 hover:scale-105 transition shadow-elevated"
          >
            Anunciar grátis <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function DesktopBusinessCard({
  b,
  variant,
}: {
  b: ReturnType<typeof useBusinesses>["data"][number];
  variant?: "premium";
}) {
  const isPremium = variant === "premium" || b.tier === "premium";
  return (
    <Link
      to="/negocio/$id"
      params={{ id: b.id }}
      className={`group block rounded-2xl bg-card overflow-hidden border transition hover:-translate-y-1 hover:shadow-elevated ${
        isPremium ? "border-amber-400/60 ring-1 ring-amber-400/30" : "border-border"
      }`}
    >
      <div
        className={`relative overflow-hidden ${variant === "premium" ? "h-52" : "h-44"} bg-muted`}
      >
        {b.image_url ? (
          <img
            src={b.image_url}
            alt={b.name}
            loading="lazy"
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
  );
}
