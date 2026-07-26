import { Link, useLocation } from "@tanstack/react-router";
import { Home, Search, MapPin, Heart, User } from "lucide-react";

const items = [
  { to: "/", label: "Início", icon: Home },
  { to: "/buscar", label: "Buscar", icon: Search },
  { to: "/bairros", label: "Bairros", icon: MapPin },
  { to: "/favoritos", label: "Favoritos", icon: Heart },
  { to: "/perfil", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border safe-bottom md:absolute md:inset-x-0 md:rounded-b-[2.5rem]">
      <ul className="mx-auto max-w-md md:max-w-none grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to;
          return (
            <li key={to}>
              <Link
                to={to}
                className="flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors"
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    active ? "text-brand" : "text-muted-foreground"
                  }`}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span className={active ? "text-brand" : "text-muted-foreground"}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
