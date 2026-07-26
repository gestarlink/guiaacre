import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2, ExternalLink } from "lucide-react";

type Props = {
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  height?: string;
  /** Called when coordinates are resolved from address (geocoding) */
  onResolved?: (coords: { lat: number; lng: number }) => void;
  /** Allow clicking the map to set/move the marker */
  interactive?: boolean;
  onPick?: (coords: { lat: number; lng: number }) => void;
};

/**
 * Lightweight Leaflet map. Uses lat/lng if provided, otherwise geocodes the
 * address via OpenStreetMap Nominatim (no API key).
 */
export function MapView({
  address,
  lat,
  lng,
  height = "h-56",
  onResolved,
  interactive = false,
  onPick,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    lat != null && lng != null ? { lat, lng } : null,
  );

  // Geocode when no coords provided
  useEffect(() => {
    if (lat != null && lng != null) {
      setCoords({ lat, lng });
      return;
    }
    if (!address || address.trim().length < 4) {
      setCoords(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
      `${address}, Rio Branco, Acre, Brasil`,
    )}`;
    fetch(url, { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((rows: Array<{ lat: string; lon: string }>) => {
        if (cancelled) return;
        if (!rows?.length) {
          setError("Endereço não encontrado no mapa");
          setCoords(null);
        } else {
          const c = { lat: parseFloat(rows[0].lat), lng: parseFloat(rows[0].lon) };
          setCoords(c);
          onResolved?.(c);
        }
      })
      .catch(() => !cancelled && setError("Falha ao buscar mapa"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, lat, lng]);

  // Init / update map
  useEffect(() => {
    if (!coords || !containerRef.current) return;
    let disposed = false;

    void (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (disposed || !containerRef.current) return;

      // Fix default icon path issue with bundlers
      const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
      const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
      const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";
      const DefaultIcon = L.icon({
        iconUrl,
        iconRetinaUrl,
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      if (!mapRef.current) {
        const map = L.map(containerRef.current, {
          zoomControl: true,
          attributionControl: false,
          scrollWheelZoom: false,
        }).setView([coords.lat, coords.lng], 16);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
        const marker = L.marker([coords.lat, coords.lng], { icon: DefaultIcon, draggable: interactive }).addTo(map);
        if (interactive) {
          map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
            marker.setLatLng(e.latlng);
            onPick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
          });
          marker.on("dragend", () => {
            const ll = marker.getLatLng();
            onPick?.({ lat: ll.lat, lng: ll.lng });
          });
        }
        mapRef.current = map;
        markerRef.current = marker;
      } else {
        const map = mapRef.current as L.Map;
        const marker = markerRef.current as L.Marker;
        map.setView([coords.lat, coords.lng], 16);
        marker.setLatLng([coords.lat, coords.lng]);
      }
    })();

    return () => {
      disposed = true;
    };
  }, [coords, interactive, onPick]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        (mapRef.current as L.Map).remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <div className={`${height} w-full rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-sm`}>
        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Carregando mapa...
      </div>
    );
  }

  if (!coords) {
    return (
      <div className={`${height} w-full rounded-xl bg-muted/60 border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground text-sm gap-1`}>
        <MapPin className="h-5 w-5" />
        {error ?? "Informe um endereço para ver no mapa"}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={containerRef} className={`${height} w-full rounded-xl overflow-hidden border border-border z-0`} />
      <a
        href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-xs text-brand font-semibold"
      >
        Abrir no Google Maps <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
