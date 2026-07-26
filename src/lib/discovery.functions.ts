import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GMAPS_GATEWAY = "https://connector-gateway.lovable.dev/google_maps";
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const ACRE_BIAS = {
  rectangle: {
    low: { latitude: -11.15, longitude: -74.0 },
    high: { latitude: -7.1, longitude: -66.6 },
  },
};

// --------- types ---------

export type PlaceSummary = {
  placeId: string;
  name: string;
  formattedAddress?: string;
  primaryType?: string;
  types?: string[];
  rating?: number;
  ratingCount?: number;
  photoUrl?: string;
  location?: { lat: number; lng: number };
  shortDescription?: string;
  alreadyImported?: { id: string; slug?: string | null } | null;
};

export type PlaceDetails = PlaceSummary & {
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  addressComponents?: Array<{ longText: string; shortText: string; types: string[] }>;
  editorialSummary?: { text: string };
  reviews?: Array<{
    rating: number;
    text?: { text: string };
    authorAttribution?: { displayName: string };
    relativePublishTimeDescription?: string;
  }>;
  photos?: Array<{ name: string }>;
  photoUrls?: string[];
};

// --------- helpers ---------

function assertEnv() {
  const lovable = process.env.LOVABLE_API_KEY;
  const gmaps = process.env.GOOGLE_MAPS_API_KEY;
  if (!lovable) throw new Error("LOVABLE_API_KEY ausente");
  if (!gmaps) throw new Error("GOOGLE_MAPS_API_KEY ausente — conecte o Google Maps Platform");
  return { lovable, gmaps };
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || !data) throw new Error("Forbidden: admin only");
}

function gmapsHeaders(extra: Record<string, string> = {}) {
  const { lovable, gmaps } = assertEnv();
  return {
    Authorization: `Bearer ${lovable}`,
    "X-Connection-Api-Key": gmaps,
    "Content-Type": "application/json",
    ...extra,
  };
}

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const CITY_SLUGS: Record<string, string> = {
  "rio branco": "rio-branco",
  "cruzeiro do sul": "cruzeiro-do-sul",
  "sena madureira": "sena-madureira",
  "senador guiomard": "senador-guiomard",
  bujari: "bujari",
  brasileia: "brasileia",
  "brasiléia": "brasileia",
  epitaciolândia: "epitaciolandia",
  epitaciolandia: "epitaciolandia",
  tarauacá: "tarauaca",
  tarauaca: "tarauaca",
  feijó: "feijo",
  feijo: "feijo",
};

function detectCity(address: string | undefined, components: PlaceDetails["addressComponents"] | undefined): {
  name: string;
  slug: string;
} {
  let cityName: string | undefined;
  if (components) {
    const c = components.find((c) => c.types.includes("administrative_area_level_2") || c.types.includes("locality"));
    cityName = c?.longText;
  }
  if (!cityName && address) {
    const m = address.match(/,\s*([^,-]+?)\s*-\s*AC/i);
    if (m) cityName = m[1].trim();
  }
  const fallback = "Rio Branco";
  const name = cityName || fallback;
  const slug = CITY_SLUGS[name.toLowerCase()] || slugify(name);
  return { name, slug };
}

const TYPE_TO_CATEGORY: Record<string, string> = {
  restaurant: "alimentacao",
  cafe: "alimentacao",
  bakery: "alimentacao",
  bar: "alimentacao",
  meal_takeaway: "alimentacao",
  meal_delivery: "alimentacao",
  food: "alimentacao",
  store: "lojas",
  clothing_store: "lojas",
  shoe_store: "lojas",
  furniture_store: "lojas",
  electronics_store: "lojas",
  shopping_mall: "lojas",
  supermarket: "lojas",
  beauty_salon: "beleza",
  hair_care: "beleza",
  barber_shop: "beleza",
  spa: "beleza",
  nail_salon: "beleza",
  gym: "servicos",
  car_repair: "servicos",
  lodging: "servicos",
  hotel: "servicos",
  travel_agency: "servicos",
  laundry: "servicos",
  hospital: "saude",
  doctor: "saude",
  dentist: "saude",
  pharmacy: "saude",
  physiotherapist: "saude",
  veterinary_care: "saude",
};

function detectCategorySlug(types: string[] = [], primary?: string): string {
  if (primary && TYPE_TO_CATEGORY[primary]) return TYPE_TO_CATEGORY[primary];
  for (const t of types) {
    if (TYPE_TO_CATEGORY[t]) return TYPE_TO_CATEGORY[t];
  }
  return "servicos";
}

function categoryLabel(slug: string): string {
  return ({
    alimentacao: "Alimentação",
    lojas: "Lojas",
    beleza: "Beleza",
    servicos: "Serviços",
    saude: "Saúde",
  } as Record<string, string>)[slug] || "Serviços";
}

function extractWhatsapp(phone?: string): string | undefined {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  if (digits.length >= 10) return `55${digits}`;
  return undefined;
}

function instagramHandle(websiteOrUrl?: string): string | undefined {
  if (!websiteOrUrl) return undefined;
  const m = websiteOrUrl.match(/instagram\.com\/(@?[A-Za-z0-9_.]+)/);
  return m ? m[1].replace(/^@/, "") : undefined;
}

async function photoMediaUrl(photoName: string, max = 1600): Promise<string | null> {
  const res = await fetch(
    `${GMAPS_GATEWAY}/places/v1/${photoName}/media?maxWidthPx=${max}&skipHttpRedirect=true`,
    { headers: gmapsHeaders() },
  );
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  return (json && (json.photoUri as string)) || null;
}

// --------- SEARCH ---------

const SEARCH_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.types",
  "places.primaryType",
  "places.rating",
  "places.userRatingCount",
  "places.photos.name",
  "places.location",
  "places.editorialSummary",
  "nextPageToken",
].join(",");

export const searchPlaces = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { query: string; city?: string }) => d)
  .handler(async ({ data, context }): Promise<{ places: PlaceSummary[] }> => {
    await assertAdmin(context as any);
    const fullQuery = data.city ? `${data.query} em ${data.city}, Acre` : `${data.query}, Acre, Brasil`;

    const res = await fetch(`${GMAPS_GATEWAY}/places/v1/places:searchText`, {
      method: "POST",
      headers: gmapsHeaders({ "X-Goog-FieldMask": SEARCH_MASK }),
      body: JSON.stringify({
        textQuery: fullQuery,
        languageCode: "pt-BR",
        regionCode: "BR",
        locationBias: ACRE_BIAS,
        maxResultCount: 20,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Places search ${res.status}: ${text.slice(0, 300)}`);
    }
    const json = await res.json();
    const rawPlaces: any[] = json.places || [];

    // duplicidade
    const placeIds = rawPlaces.map((p) => p.id).filter(Boolean);
    let existingMap = new Map<string, { id: string; slug?: string | null }>();
    if (placeIds.length) {
      const { data: existing } = await (context as any).supabase
        .from("businesses")
        .select("id, place_id, slug")
        .in("place_id", placeIds);
      for (const row of existing || []) {
        existingMap.set(row.place_id, { id: row.id, slug: row.slug });
      }
    }

    const out: PlaceSummary[] = await Promise.all(
      rawPlaces.map(async (p) => {
        const firstPhoto = p.photos?.[0]?.name;
        const photoUrl = firstPhoto ? await photoMediaUrl(firstPhoto, 800) : undefined;
        return {
          placeId: p.id,
          name: p.displayName?.text || p.displayName || "Sem nome",
          formattedAddress: p.formattedAddress,
          primaryType: p.primaryType,
          types: p.types,
          rating: p.rating,
          ratingCount: p.userRatingCount,
          photoUrl: photoUrl || undefined,
          location: p.location
            ? { lat: p.location.latitude, lng: p.location.longitude }
            : undefined,
          shortDescription: p.editorialSummary?.text,
          alreadyImported: existingMap.get(p.id) || null,
        };
      }),
    );
    return { places: out };
  });

// --------- DETAILS ---------

const DETAILS_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "addressComponents",
  "types",
  "primaryType",
  "rating",
  "userRatingCount",
  "internationalPhoneNumber",
  "nationalPhoneNumber",
  "websiteUri",
  "googleMapsUri",
  "regularOpeningHours",
  "editorialSummary",
  "reviews",
  "photos",
  "location",
].join(",");

export const getPlaceDetails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { placeId: string }) => d)
  .handler(async ({ data, context }): Promise<PlaceDetails> => {
    await assertAdmin(context as any);
    const res = await fetch(
      `${GMAPS_GATEWAY}/places/v1/places/${encodeURIComponent(data.placeId)}?languageCode=pt-BR&regionCode=BR`,
      { headers: gmapsHeaders({ "X-Goog-FieldMask": DETAILS_MASK }) },
    );
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Places details ${res.status}: ${text.slice(0, 300)}`);
    }
    const p = await res.json();
    const photos: any[] = p.photos || [];
    const photoUrls = (
      await Promise.all(photos.slice(0, 8).map((ph) => photoMediaUrl(ph.name, 1200)))
    ).filter((x): x is string => !!x);
    return {
      placeId: p.id,
      name: p.displayName?.text || p.displayName || "Sem nome",
      formattedAddress: p.formattedAddress,
      addressComponents: p.addressComponents,
      types: p.types,
      primaryType: p.primaryType,
      rating: p.rating,
      ratingCount: p.userRatingCount,
      internationalPhoneNumber: p.internationalPhoneNumber,
      nationalPhoneNumber: p.nationalPhoneNumber,
      websiteUri: p.websiteUri,
      googleMapsUri: p.googleMapsUri,
      regularOpeningHours: p.regularOpeningHours,
      editorialSummary: p.editorialSummary,
      reviews: p.reviews,
      photos,
      photoUrls,
      location: p.location ? { lat: p.location.latitude, lng: p.location.longitude } : undefined,
      shortDescription: p.editorialSummary?.text,
    };
  });

// --------- AI enrichment ---------

async function aiEnrich(place: PlaceDetails, categoryName: string, cityName: string) {
  const { lovable } = assertEnv();
  const sample = (place.reviews || [])
    .slice(0, 3)
    .map((r) => r.text?.text)
    .filter(Boolean)
    .join("\n---\n");
  const prompt = `Você é um redator do guia de empresas GuiaAcre. Reescreva uma descrição profissional, original e acolhedora (3 a 5 frases, sem clichês), para o negócio abaixo. Não copie. Retorne JSON: { "description": string, "meta_description": string (até 155 chars), "tags": string[] (5 a 8 palavras-chave em pt-BR, sem #), "subcategory": string (1-3 palavras) }.

Negócio: ${place.name}
Categoria: ${categoryName}
Cidade: ${cityName}
Endereço: ${place.formattedAddress || ""}
Site: ${place.websiteUri || ""}
Tipos Google: ${(place.types || []).join(", ")}
Resumo editorial: ${place.editorialSummary?.text || "-"}
Trechos de avaliações:
${sample || "-"}`;

  const res = await fetch(AI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": lovable,
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "Você gera textos comerciais em português do Brasil. Responda apenas com JSON válido." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    return { description: place.editorialSummary?.text || `${place.name} — referência em ${cityName}.`, meta_description: "", tags: [] as string[], subcategory: "" };
  }
  const json = await res.json();
  try {
    return JSON.parse(json.choices?.[0]?.message?.content || "{}");
  } catch {
    return { description: "", meta_description: "", tags: [] as string[], subcategory: "" };
  }
}

// --------- IMPORT ---------

async function uploadPhotoToStorage(
  supabaseAdmin: any,
  businessId: string,
  url: string,
  idx: number,
): Promise<string | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const blob = await r.arrayBuffer();
    const ext = (r.headers.get("content-type")?.includes("png") ? "png" : "jpg");
    const path = `${businessId}/${Date.now()}-${idx}.${ext}`;
    const { error } = await supabaseAdmin.storage
      .from("business-photos")
      .upload(path, new Uint8Array(blob), {
        contentType: r.headers.get("content-type") || "image/jpeg",
        upsert: true,
      });
    if (error) return null;
    const { data } = supabaseAdmin.storage.from("business-photos").getPublicUrl(path);
    return data.publicUrl;
  } catch {
    return null;
  }
}

export const importPlace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { placeId: string; force?: boolean }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const ctx = context as any;
    const { supabase, userId } = ctx;

    // detalhes
    const details = await getPlaceDetails({ data: { placeId: data.placeId } });

    // duplicata
    if (!data.force) {
      const { data: existing } = await supabase
        .from("businesses")
        .select("id, slug, place_id")
        .or(`place_id.eq.${data.placeId}`)
        .maybeSingle();
      if (existing) {
        return { ok: false, duplicate: true, businessId: existing.id, slug: existing.slug };
      }
    }

    const { name: cityName, slug: citySlug } = detectCity(details.formattedAddress, details.addressComponents);
    const categorySlug = detectCategorySlug(details.types, details.primaryType);
    const categoryName = categoryLabel(categorySlug);

    const enrichment = await aiEnrich(details, categoryName, cityName);

    // slug único
    const base = slugify(details.name);
    let slug = base || `empresa-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      const { data: hit } = await supabase
        .from("businesses")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!hit) break;
      slug = `${base}-${Math.floor(Math.random() * 1000)}`;
    }

    const whatsapp = extractWhatsapp(details.internationalPhoneNumber || details.nationalPhoneNumber);
    const insertRow: Record<string, unknown> = {
      owner_id: userId,
      name: details.name,
      slug,
      category: categoryName,
      category_id: categorySlug,
      city: cityName,
      city_id: citySlug,
      address: details.formattedAddress || null,
      description: enrichment.description || details.editorialSummary?.text || null,
      meta_description: enrichment.meta_description || null,
      tags: Array.isArray(enrichment.tags) ? enrichment.tags : [],
      hours: details.regularOpeningHours?.weekdayDescriptions?.join("\n") || null,
      opening_hours: details.regularOpeningHours || null,
      whatsapp: whatsapp || null,
      phone: details.internationalPhoneNumber || details.nationalPhoneNumber || null,
      website: details.websiteUri || null,
      instagram: instagramHandle(details.websiteUri),
      latitude: details.location?.lat ?? null,
      longitude: details.location?.lng ?? null,
      rating: details.rating ?? null,
      rating_count: details.ratingCount ?? null,
      place_id: details.placeId,
      source: "google_places",
      status: "approved",
    };

    const { data: inserted, error: insErr } = await supabase
      .from("businesses")
      .insert(insertRow as any)
      .select("id, slug")
      .single();
    if (insErr) throw new Error(`Falha ao inserir: ${insErr.message}`);

    // upload fotos com client admin
    const photoUrls = details.photoUrls || [];
    if (photoUrls.length) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const uploaded: string[] = [];
      for (let i = 0; i < photoUrls.length; i++) {
        const u = await uploadPhotoToStorage(supabaseAdmin, inserted.id, photoUrls[i], i);
        if (u) uploaded.push(u);
      }
      if (uploaded.length) {
        await supabase
          .from("businesses")
          .update({ image_url: uploaded[0], gallery: uploaded } as any)
          .eq("id", inserted.id);
      }
    }

    return { ok: true, businessId: inserted.id, slug: inserted.slug };
  });
