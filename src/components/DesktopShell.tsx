import { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Search, MapPin, Heart, User, LogIn, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo-guiaacre.png";

const navLinks = [
  { to: "/", label: "Início" },
  { to: "/buscar", label: "Explorar" },
  { to: "/bairros", label: "Bairros" },
  { to: "/cadastrar", label: "Anuncie grátis" },
] as const;

export function DesktopShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top bar */}
      <div className="bg-brand text-brand-foreground text-xs">
        <div className="mx-auto max-w-7xl px-6 h-9 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="opacity-90">O guia de negócios mais completo do Acre</span>
          </div>
          <div className="hidden md:flex items-center gap-4 opacity-90">
            <span>📱 (68) 9999-9999</span>
            <span>•</span>
            <span>contato@guiaacre.com</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-card/90">
        <div className="mx-auto max-w-7xl px-6 h-20 flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <img src={logo} alt="GuiaAcre" className="h-10 w-10" draggable={false} />
            <div className="leading-tight">
              <p className="font-display font-bold text-xl">GuiaAcre</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Marketplace Acreano</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const active =
                link.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    active
                      ? "text-brand bg-brand/10"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Link
            to="/buscar"
            className="flex-1 max-w-md ml-auto h-11 rounded-full bg-muted/60 hover:bg-muted border border-border px-4 flex items-center gap-3 text-sm text-muted-foreground transition"
          >
            <Search className="h-4 w-4" />
            Buscar negócios, categorias ou bairros...
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/favoritos"
              className="h-10 w-10 rounded-full hover:bg-muted flex items-center justify-center text-foreground/70 hover:text-foreground transition"
              title="Favoritos"
            >
              <Heart className="h-5 w-5" />
            </Link>
            {user ? (
              <Link
                to="/perfil"
                className="h-10 px-3 rounded-full bg-muted hover:bg-muted/80 flex items-center gap-2 text-sm font-medium transition"
              >
                <User className="h-4 w-4" />
                Minha conta
              </Link>
            ) : (
              <Link
                to="/auth"
                className="h-10 px-4 rounded-full bg-brand text-brand-foreground hover:opacity-90 flex items-center gap-2 text-sm font-semibold transition"
              >
                <LogIn className="h-4 w-4" />
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-foreground text-background mt-16">
        <div className="mx-auto max-w-7xl px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="GuiaAcre" className="h-10 w-10" />
              <p className="font-display font-bold text-xl">GuiaAcre</p>
            </div>
            <p className="text-sm opacity-70 mt-4 leading-relaxed">
              O marketplace que conecta você aos melhores negócios, serviços e profissionais
              do Acre. Tudo em um só lugar.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Explorar</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/buscar" className="hover:opacity-100">Todos os negócios</Link></li>
              <li><Link to="/bairros" className="hover:opacity-100">Bairros</Link></li>
              <li><Link to="/favoritos" className="hover:opacity-100">Favoritos</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Para empresas</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li><Link to="/cadastrar" className="hover:opacity-100">Cadastre seu negócio</Link></li>
              <li><Link to="/meus-negocios" className="hover:opacity-100">Meus negócios</Link></li>
              <li><Link to="/auth" className="hover:opacity-100">Acessar minha conta</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-3">Contato</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Rio Branco, AC</li>
              <li>contato@guiaacre.com</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background/10">
          <div className="mx-auto max-w-7xl px-6 py-5 text-xs opacity-60 flex flex-col md:flex-row items-center justify-between gap-2">
            <p>© {new Date().getFullYear()} GuiaAcre. Todos os direitos reservados.</p>
            <p>Feito no Acre, para o Acre.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
