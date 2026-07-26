import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, MousePointerClick, Phone, MapPin, Heart, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AdminShell } from "@/components/AdminShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin GuiaAcre" }] }),
  component: AdminAnalyticsPage,
});

type Event = {
  id: string;
  event_type: string;
  business_id: string | null;
  created_at: string;
};

const RANGES = [
  { key: 7, label: "7 dias" },
  { key: 30, label: "30 dias" },
  { key: 90, label: "90 dias" },
] as const;

function AdminAnalyticsPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [businesses, setBusinesses] = useState<Record<string, string>>({});
  const [range, setRange] = useState<number>(30);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    if (!loading && user && !isAdmin) navigate({ to: "/" });
  }, [loading, user, isAdmin, navigate]);

  const load = useCallback(async () => {
    setBusy(true);
    const since = new Date(Date.now() - range * 86400000).toISOString();
    const { data } = await supabase
      .from("analytics_events")
      .select("id, event_type, business_id, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(5000);
    const list = (data ?? []) as Event[];
    setEvents(list);

    const bIds = [...new Set(list.map((e) => e.business_id).filter(Boolean))] as string[];
    if (bIds.length) {
      const { data: bs } = await supabase.from("businesses").select("id, name").in("id", bIds);
      const map: Record<string, string> = {};
      (bs ?? []).forEach((b) => (map[b.id] = b.name));
      setBusinesses(map);
    }
    setBusy(false);
  }, [range]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((e) => {
      counts[e.event_type] = (counts[e.event_type] ?? 0) + 1;
    });
    return counts;
  }, [events]);

  const topBusinesses = useMemo(() => {
    const counts = new Map<string, number>();
    events.forEach((e) => {
      if (!e.business_id) return;
      counts.set(e.business_id, (counts.get(e.business_id) ?? 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count]) => ({ id, name: businesses[id] ?? id, count }));
  }, [events, businesses]);

  if (loading || !isAdmin) {
    return (
      <AdminShell title="Analytics">
        <p className="text-muted-foreground">Carregando...</p>
      </AdminShell>
    );
  }

  const eventConfig: { key: string; label: string; icon: typeof Eye; color: string }[] = [
    { key: "business_view", label: "Visualizações", icon: Eye, color: "bg-blue-500/10 text-blue-600" },
    { key: "whatsapp_click", label: "WhatsApp", icon: MousePointerClick, color: "bg-green-500/10 text-green-600" },
    { key: "phone_click", label: "Telefone", icon: Phone, color: "bg-purple-500/10 text-purple-600" },
    { key: "map_click", label: "Mapa", icon: MapPin, color: "bg-orange-500/10 text-orange-600" },
    { key: "favorite_add", label: "Favoritos", icon: Heart, color: "bg-rose-500/10 text-rose-600" },
  ];

  return (
    <AdminShell
      title="Analytics"
      subtitle={`${events.length} eventos nos últimos ${range} dias ${busy ? "(carregando...)" : ""}`}
      actions={
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-md transition ${
                range === r.key ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {eventConfig.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.key} className="rounded-2xl bg-card border border-border p-4">
              <div className={`h-10 w-10 rounded-xl inline-flex items-center justify-center ${c.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-display font-bold mt-3">{stats[c.key] ?? 0}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl bg-card border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand" />
          <h2 className="font-display font-semibold">Top 10 empresas mais visualizadas</h2>
        </div>
        <div className="divide-y divide-border">
          {topBusinesses.map((b, i) => (
            <Link
              key={b.id}
              to="/negocio/$id"
              params={{ id: b.id }}
              className="flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition"
            >
              <span className="text-sm font-display font-bold text-muted-foreground w-6">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="flex-1 font-medium truncate">{b.name}</p>
              <span className="text-sm text-muted-foreground">{b.count} eventos</span>
            </Link>
          ))}
          {topBusinesses.length === 0 && (
            <p className="px-5 py-10 text-center text-muted-foreground">Sem dados no período</p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
