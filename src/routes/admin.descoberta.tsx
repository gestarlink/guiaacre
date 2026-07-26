import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import {
  Search,
  MapPin,
  Phone,
  Star,
  ExternalLink,
  Sparkles,
  Globe,
  Loader2,
  Check,
  AlertTriangle,
  Eye,
  Download,
} from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  searchPlaces,
  getPlaceDetails,
  importPlace,
  type PlaceSummary,
  type PlaceDetails,
} from "@/lib/discovery.functions";

export const Route = createFileRoute("/admin/descoberta")({
  component: DescobertaPage,
});

const CIDADES = [
  { value: "_any", label: "Qualquer cidade" },
  { value: "Rio Branco", label: "Rio Branco" },
  { value: "Cruzeiro do Sul", label: "Cruzeiro do Sul" },
  { value: "Sena Madureira", label: "Sena Madureira" },
  { value: "Senador Guiomard", label: "Senador Guiomard" },
  { value: "Brasiléia", label: "Brasiléia" },
  { value: "Epitaciolândia", label: "Epitaciolândia" },
  { value: "Tarauacá", label: "Tarauacá" },
  { value: "Feijó", label: "Feijó" },
  { value: "Bujari", label: "Bujari" },
];

type CardState = "idle" | "importing" | "imported" | "duplicate";

function DescobertaPage() {
  const doSearch = useServerFn(searchPlaces);
  const doDetails = useServerFn(getPlaceDetails);
  const doImport = useServerFn(importPlace);

  const [query, setQuery] = useState("");
  const [city, setCity] = useState("_any");
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [cardState, setCardState] = useState<Record<string, CardState>>({});
  const [importedId, setImportedId] = useState<Record<string, string | undefined>>({});

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<PlaceDetails | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setPlaces([]);
    try {
      const cityArg = city && city !== "_any" ? city : undefined;
      const res = await doSearch({ data: { query: query.trim(), city: cityArg } });
      setPlaces(res.places);
      const initial: Record<string, CardState> = {};
      const ids: Record<string, string | undefined> = {};
      for (const p of res.places) {
        if (p.alreadyImported) {
          initial[p.placeId] = "duplicate";
          ids[p.placeId] = p.alreadyImported.id;
        }
      }
      setCardState(initial);
      setImportedId(ids);
      if (!res.places.length) toast.info("Nenhuma empresa encontrada para esta busca.");
    } catch (err: any) {
      toast.error(`Erro na busca: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  }

  async function openDetails(placeId: string) {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(null);
    try {
      const d = await doDetails({ data: { placeId } });
      setDetail(d);
    } catch (err: any) {
      toast.error(`Falha ao carregar detalhes: ${err?.message || err}`);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleImport(placeId: string, force = false) {
    setCardState((s) => ({ ...s, [placeId]: "importing" }));
    try {
      const res = await doImport({ data: { placeId, force } });
      if (res.ok) {
        setCardState((s) => ({ ...s, [placeId]: "imported" }));
        setImportedId((s) => ({ ...s, [placeId]: res.businessId }));
        toast.success("Empresa importada e publicada!");
      } else if (res.duplicate) {
        setCardState((s) => ({ ...s, [placeId]: "duplicate" }));
        setImportedId((s) => ({ ...s, [placeId]: res.businessId }));
        toast.warning("Empresa já cadastrada.");
      }
    } catch (err: any) {
      setCardState((s) => ({ ...s, [placeId]: "idle" }));
      toast.error(`Falha ao importar: ${err?.message || err}`);
    }
  }

  return (
    <AdminShell
      title="Importador Inteligente de Empresas"
      subtitle="Busque no Google e importe empresas reais para o GuiaAcre com um clique."
    >
      <Card className="p-4 mb-6">
        <form
          onSubmit={handleSearch}
          className="grid gap-3 md:grid-cols-[1fr_220px_auto] items-end"
        >
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              O que buscar
            </label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Ex.: "restaurantes", "barbearia", "academia"'
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Cidade</label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger>
                <SelectValue placeholder="Qualquer cidade" />
              </SelectTrigger>
              <SelectContent>
                {CIDADES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading || !query.trim()} size="lg">
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Buscar no Google
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />A IA escreve a descrição, baixa fotos, detecta
          categoria e publica a página automaticamente.
        </p>
      </Card>

      {loading && (
        <div className="text-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
          Buscando no Google Places…
        </div>
      )}

      {!loading && places.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((p) => {
            const state = cardState[p.placeId] || "idle";
            const businessId = importedId[p.placeId];
            return (
              <Card key={p.placeId} className="overflow-hidden flex flex-col">
                <div className="aspect-video bg-muted relative">
                  {p.photoUrl ? (
                    <img
                      src={p.photoUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      Sem foto
                    </div>
                  )}
                  {state === "duplicate" && (
                    <Badge className="absolute top-2 left-2 bg-amber-500/95 text-white border-0">
                      <AlertTriangle className="h-3 w-3 mr-1" /> Já cadastrada
                    </Badge>
                  )}
                  {state === "imported" && (
                    <Badge className="absolute top-2 left-2 bg-emerald-600 text-white border-0">
                      <Check className="h-3 w-3 mr-1" /> Importada
                    </Badge>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div>
                    <h3 className="font-semibold leading-snug line-clamp-2">{p.name}</h3>
                    {p.rating != null && (
                      <div className="flex items-center gap-1 text-xs mt-1">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span className="font-medium">{p.rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({p.ratingCount ?? 0})</span>
                        {p.primaryType && (
                          <span className="text-muted-foreground ml-1">
                            · {p.primaryType.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {p.formattedAddress && (
                    <p className="text-xs text-muted-foreground flex items-start gap-1.5 line-clamp-2">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      {p.formattedAddress}
                    </p>
                  )}
                  {p.shortDescription && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {p.shortDescription}
                    </p>
                  )}
                  <div className="mt-auto pt-3 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openDetails(p.placeId)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" /> Ver detalhes
                    </Button>
                    {state === "imported" || state === "duplicate" ? (
                      businessId ? (
                        <Button asChild size="sm" className="flex-1" variant="secondary">
                          <Link to="/negocio/$id" params={{ id: businessId }}>
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Ver página
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="flex-1"
                          onClick={() => handleImport(p.placeId, true)}
                        >
                          Importar mesmo assim
                        </Button>
                      )
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        className="flex-1"
                        disabled={state === "importing"}
                        onClick={() => handleImport(p.placeId)}
                      >
                        {state === "importing" ? (
                          <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        Importar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && places.length === 0 && (
        <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-xl">
          <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Pesquise para começar</p>
          <p className="text-sm mt-1">
            Ex.: "restaurantes em Rio Branco", "academias", "barbearias em Cruzeiro do Sul"
          </p>
        </div>
      )}

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{detail?.name || "Detalhes"}</SheetTitle>
            <SheetDescription>Dados encontrados no Google Places.</SheetDescription>
          </SheetHeader>
          {detailLoading && (
            <div className="py-12 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            </div>
          )}
          {detail && !detailLoading && (
            <div className="mt-4 space-y-4">
              {detail.photoUrls && detail.photoUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {detail.photoUrls.map((u, i) => (
                    <img
                      key={i}
                      src={u}
                      alt=""
                      className="aspect-square object-cover rounded-md"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}
              {detail.rating != null && (
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <strong>{detail.rating.toFixed(1)}</strong>
                  <span className="text-muted-foreground">
                    ({detail.ratingCount ?? 0} avaliações)
                  </span>
                </div>
              )}
              {detail.formattedAddress && (
                <Row
                  icon={<MapPin className="h-4 w-4" />}
                  label="Endereço"
                  value={detail.formattedAddress}
                />
              )}
              {(detail.internationalPhoneNumber || detail.nationalPhoneNumber) && (
                <Row
                  icon={<Phone className="h-4 w-4" />}
                  label="Telefone"
                  value={detail.internationalPhoneNumber || detail.nationalPhoneNumber!}
                />
              )}
              {detail.websiteUri && (
                <Row
                  icon={<Globe className="h-4 w-4" />}
                  label="Site"
                  value={detail.websiteUri}
                  link
                />
              )}
              {detail.regularOpeningHours?.weekdayDescriptions && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Horários
                  </p>
                  <ul className="text-sm space-y-0.5">
                    {detail.regularOpeningHours.weekdayDescriptions.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              {detail.editorialSummary?.text && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Resumo
                  </p>
                  <p className="text-sm">{detail.editorialSummary.text}</p>
                </div>
              )}
              {detail.reviews && detail.reviews.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Avaliações
                  </p>
                  <div className="space-y-2">
                    {detail.reviews.slice(0, 3).map((r, i) => (
                      <div key={i} className="text-sm border-l-2 border-border pl-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          {r.rating} · {r.authorAttribution?.displayName}
                        </div>
                        <p className="text-xs">{r.text?.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-2 flex gap-2">
                <Button
                  type="button"
                  className="flex-1"
                  disabled={cardState[detail.placeId] === "importing"}
                  onClick={() => handleImport(detail.placeId)}
                >
                  {cardState[detail.placeId] === "importing" ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Importar para GuiaAcre
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminShell>
  );
}

function Row({
  icon,
  label,
  value,
  link,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  link?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
        {link ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline break-all"
          >
            {value}
          </a>
        ) : (
          <p className="break-words">{value}</p>
        )}
      </div>
    </div>
  );
}
