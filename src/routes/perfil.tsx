import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  User,
  Plus,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Store,
  LogIn,
} from "lucide-react";
import { MobileShell } from "@/components/MobileShell";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useBusinesses } from "@/hooks/useBusinesses";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Perfil — GuiaAcre" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading, signOut } = useAuth();
  const { profile } = useProfile();
  const { data: myBusinesses } = useBusinesses({ ownerId: user?.id, status: "all" });

  useEffect(() => {
    if (!loading && isAdmin) navigate({ to: "/admin", replace: true });
  }, [loading, isAdmin, navigate]);

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Visitante";
  const firstApproved = myBusinesses.find((b) => b.status === "approved");
  const businessLabel =
    firstApproved?.name ||
    (myBusinesses[0]?.name ? `${myBusinesses[0].name} (aguardando)` : null);

  return (
    <MobileShell>
      <header className="bg-brand text-brand-foreground rounded-b-3xl px-5 pt-12 pb-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-white/15 flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-xl truncate">{displayName}</p>
            {user ? (
              <>
                {businessLabel && (
                  <p className="text-sm opacity-90 truncate flex items-center gap-1">
                    <Store className="h-3.5 w-3.5" /> {businessLabel}
                  </p>
                )}
                <p className="text-xs opacity-70 mt-0.5">
                  {profile?.phone || user.email}
                </p>
              </>
            ) : (
              <p className="text-sm opacity-80">Faça login para gerenciar seus negócios</p>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 -mt-4 relative space-y-3">
        {!user ? (
          <Link
            to="/auth"
            className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-elevated border border-border/60"
          >
            <div className="h-11 w-11 rounded-xl bg-brand/15 flex items-center justify-center">
              <LogIn className="h-5 w-5 text-brand" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <p className="font-display font-semibold">Entrar ou cadastrar</p>
              <p className="text-xs text-muted-foreground">Acesse para listar seu negócio</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        ) : (
          <Link
            to="/cadastrar"
            className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-elevated border border-border/60"
          >
            <div className="h-11 w-11 rounded-xl bg-whatsapp/15 flex items-center justify-center">
              <Plus className="h-5 w-5 text-whatsapp" strokeWidth={3} />
            </div>
            <div className="flex-1">
              <p className="font-display font-semibold">Cadastrar minha empresa</p>
              <p className="text-xs text-muted-foreground">Apareça no GuiaAcre</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        )}

        <div className="rounded-2xl bg-card border border-border/60 shadow-card divide-y divide-border overflow-hidden">
          {user && (
            <ItemLink to="/meus-negocios" icon={<Store className="h-5 w-5" />} label="Meus negócios" />
          )}
          <Item icon={<Settings className="h-5 w-5" />} label="Configurações" />
          <Item icon={<HelpCircle className="h-5 w-5" />} label="Ajuda" />
          {user && (
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
            >
              <span className="text-destructive">
                <LogOut className="h-5 w-5" />
              </span>
              <span className="flex-1 text-sm font-medium text-destructive">Sair</span>
            </button>
          )}
        </div>
      </div>
    </MobileShell>
  );
}

function Item({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}

function ItemLink({
  to,
  icon,
  label,
  accent,
}: {
  to: "/meus-negocios" | "/admin" | "/admin/bairros" | "/admin/categorias" | "/cadastrar";
  icon: React.ReactNode;
  label: string;
  accent?: boolean;
}) {
  return (
    <Link to={to} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
      <span className={accent ? "text-brand" : "text-muted-foreground"}>{icon}</span>
      <span className={`flex-1 text-sm font-medium ${accent ? "text-brand" : ""}`}>{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
