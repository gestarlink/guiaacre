import { createServerFn } from "@tanstack/react-start";
import { requireAdmin } from "./auth-utils.server";
import { query, queryOne, execute } from "./db.server";

const GMAPS_API = "https://places.googleapis.com/v1";
const ACRE_BIAS = {
  rectangle: {
    low: { latitude: -11.15, longitude: -74.0 },
    high: { latitude: -7.1, longitude: -66.6 },
  },
};

function getGmapsKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("GOOGLE_MAPS_API_KEY ausente");
  return key;
}

function gmapsHeaders(fieldMask: string) {
  return {
    "X-Goog-Api-Key": getGmapsKey(),
    "X-Goog-FieldMask": fieldMask,
    "Content-Type": "application/json",
  };
}

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
  brasiléia: "brasileia",
  epitaciolândia: "epitaciolandia",
  epitaciolandia: "epitaciolandia",
  tarauacá: "tarauaca",
  tarauaca: "tarauaca",
  feijó: "feijo",
  feijo: "feijo",
};

function detectCity(
  address: string | undefined,
  components: PlaceDetails["addressComponents"] | undefined,
) {
  let cityName: string | undefined;
  if (components) {
    const c = components.find(
      (c) => c.types.includes("administrative_area_level_2") || c.types.includes("locality"),
    );
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
  return (
    (
      {
        alimentacao: "Alimentação",
        lojas: "Lojas",
        beleza: "Beleza",
        servicos: "Serviços",
        saude: "Saúde",
      } as Record<string, string>
    )[slug] || "Serviços"
  );
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
    `${GMAPS_API}/${photoName}/media?maxWidthPx=${max}&skipHttpRedirect=true`,
    { headers: { "X-Goog-Api-Key": getGmapsKey() } },
  );
  if (!res.ok) return null;
  const json = await res.json().catch(() => null);
  return (json && (json.photoUri as string)) || null;
}

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
  .validator((d: { query: string; city?: string }) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    const fullQuery = data.city
      ? `${data.query} em ${data.city}, Acre`
      : `${data.query}, Acre, Brasil`;

    const res = await fetch(`${GMAPS_API}/places:searchText`, {
      method: "POST",
      headers: gmapsHeaders(SEARCH_MASK),
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

    const placeIds = rawPlaces.map((p) => p.id).filter(Boolean);
    const existing = placeIds.length
      ? await query<{ id: string; place_id: string; slug: string | null }>(
          "SELECT id, place_id, slug FROM businesses WHERE place_id IN (" +
            placeIds.map(() => "?").join(",") +
            ")",
          ...placeIds,
        )
      : [];
    const existingMap = new Map(existing.map((r) => [r.place_id, { id: r.id, slug: r.slug }]));

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
  .validator((d: { placeId: string }) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    const res = await fetch(
      `${GMAPS_API}/places/${encodeURIComponent(data.placeId)}?languageCode=pt-BR&regionCode=BR`,
      { headers: gmapsHeaders(DETAILS_MASK) },
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

export const importPlace = createServerFn({ method: "POST" })
  .validator((d: { placeId: string; force?: boolean }) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    const details = await getPlaceDetails({ data: { placeId: data.placeId } });

    if (!data.force) {
      const existing = await queryOne<{ id: string; slug: string | null }>(
        "SELECT id, slug FROM businesses WHERE place_id = ?",
        data.placeId,
      );
      if (existing) {
        return { ok: false, duplicate: true, businessId: existing.id, slug: existing.slug };
      }
    }

    const { name: cityName, slug: citySlug } = detectCity(
      details.formattedAddress,
      details.addressComponents,
    );
    const categorySlug = detectCategorySlug(details.types, details.primaryType);
    const categoryName = categoryLabel(categorySlug);

    const base = slugify(details.name);
    let slug = base || `empresa-${Date.now()}`;
    for (let i = 0; i < 5; i++) {
      const hit = await queryOne<{ id: string }>("SELECT id FROM businesses WHERE slug = ?", slug);
      if (!hit) break;
      slug = `${base}-${Math.floor(Math.random() * 1000)}`;
    }

    const whatsapp = extractWhatsapp(
      details.internationalPhoneNumber || details.nationalPhoneNumber,
    );
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const photoUrls = details.photoUrls || [];

    await execute(
      `INSERT INTO businesses (id, name, slug, category, category_id, city, city_id, address, description, tags, hours, opening_hours, whatsapp, phone, website, instagram, latitude, longitude, rating, rating_count, place_id, image_url, gallery, source, status, owner_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      details.name,
      slug,
      categoryName,
      categorySlug,
      cityName,
      citySlug,
      details.formattedAddress || null,
      details.editorialSummary?.text || null,
      JSON.stringify([]),
      details.regularOpeningHours?.weekdayDescriptions?.join("\n") || null,
      JSON.stringify(details.regularOpeningHours || null),
      whatsapp || null,
      details.internationalPhoneNumber || details.nationalPhoneNumber || null,
      details.websiteUri || null,
      instagramHandle(details.websiteUri),
      details.location?.lat ?? null,
      details.location?.lng ?? null,
      details.rating ?? null,
      details.ratingCount ?? null,
      details.placeId,
      photoUrls[0] || null,
      JSON.stringify(photoUrls),
      "google_places",
      "approved",
      "00000000-0000-0000-0000-000000000000",
      now,
      now,
    );

    return { ok: true, businessId: id, slug };
  });
