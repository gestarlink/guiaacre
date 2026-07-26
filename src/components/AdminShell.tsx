import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Store,
  MapPinned,
  Tag,
  Building2,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  Users,
  MessageSquare,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo-guiaacre.png";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/descoberta", label: "IA Descoberta", icon: Sparkles, exact: false },
  { to: "/admin/empresas", label: "Empresas", icon: Store, exact: false },
  { to: "/admin/avaliacoes", label: "Avaliações", icon: MessageSquare, exact: false },
  { to: "/admin/usuarios", label: "Usuários", icon: Users, exact: false },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3, exact: false },
  { to: "/admin/categorias", label: "Categorias", icon: Tag, exact: false },
  { to: "/admin/municipios", label: "Municípios", icon: Building2, exact: false },
  { to: "/admin/bairros", label: "Bairros", icon: MapPinned, exact: false },
] as const;

export function AdminShell({
  children,
  title,
  subtitle,
  actions,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (to: string, exact: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-card border-r border-border">
        <div className="px-6 py-5 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2">
            <img src={logo} alt="GuiaAcre" className="h-9 w-9" draggable={false} />
            <div>
              <p className="font-display font-bold text-base leading-none">GuiaAcre</p>
              <p className="text-xs text-muted-foreground mt-0.5">Painel Admin</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.to, item.exact);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? "bg-brand text-brand-foreground"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao app
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
          {user?.email && (
            <p className="px-3 pt-2 text-xs text-muted-foreground truncate">{user.email}</p>
          )}
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-72 max-w-[80vw] bg-card flex flex-col shadow-xl">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={logo} alt="GuiaAcre" className="h-9 w-9" draggable={false} />
                <div>
                  <p className="font-display font-bold text-base leading-none">GuiaAcre</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Painel Admin</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.to, item.exact);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      active
                        ? "bg-brand text-brand-foreground"
                        : "text-foreground/70 hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-border space-y-1">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/70 hover:bg-muted"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao app
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-lg sm:text-xl truncate">{title}</h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
