import { createServerFn } from "@tanstack/react-start";
import { query, queryOne, execute } from "./db.server";
import { requireAdmin, requireUser, getOptionalUser } from "./auth-utils.server";

// ---------- Businesses ----------

export const listBusinesses = createServerFn({ method: "GET" })
  .validator((d?: { status?: string; ownerId?: string }) => d)
  .handler(async ({ data }) => {
    const user = await getOptionalUser();
    let sql = "SELECT * FROM businesses";
    const params: unknown[] = [];
    const conditions: string[] = [];

    if (data?.ownerId) {
      conditions.push("owner_id = ?");
      params.push(data.ownerId);
    } else if (!user || user.role !== "admin") {
      conditions.push("status = 'approved'");
    }
    if (data?.status && data.status !== "all") {
      conditions.push("status = ?");
      params.push(data.status);
    }
    if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
    sql += " ORDER BY created_at DESC";

    return query(sql, ...params);
  });

export const getBusiness = createServerFn({ method: "GET" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    return queryOne<any>(
      "SELECT * FROM businesses WHERE id = ? OR slug = ?", data.id, data.id,
    );
  });

export const createBusiness = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    const user = await requireUser();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    data.owner_id = user.id;
    data.id = id;
    data.created_at = now;
    data.updated_at = now;

    const keys = Object.keys(data);
    const vals = Object.values(data);
    const placeholders = keys.map(() => "?").join(", ");
    await execute(
      `INSERT INTO businesses (${keys.join(", ")}) VALUES (${placeholders})`,
      ...vals,
    );
    return { id, slug: data.slug };
  });

export const updateBusiness = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    const user = await requireUser();
    const { id, ...rest } = data;
    rest.updated_at = new Date().toISOString();

    const keys = Object.keys(rest);
    const vals = Object.values(rest);
    const setClause = keys.map((k) => `${k} = ?`).join(", ");

    const existing = await queryOne<any>("SELECT owner_id FROM businesses WHERE id = ?", id);
    if (!existing) throw new Error("Negócio não encontrado");
    if (existing.owner_id !== user.id && user.role !== "admin") throw new Error("Acesso negado");
    await execute(`UPDATE businesses SET ${setClause} WHERE id = ?`, ...vals, id);
    return { ok: true };
  });

export const deleteBusiness = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    const user = await requireUser();
    const existing = await queryOne<any>("SELECT owner_id FROM businesses WHERE id = ?", data.id);
    if (!existing) throw new Error("Negócio não encontrado");
    if (existing.owner_id !== user.id && user.role !== "admin") throw new Error("Acesso negado");
    await execute("DELETE FROM businesses WHERE id = ?", data.id);
    return { ok: true };
  });

// ---------- Categories ----------

export const listCategories = createServerFn({ method: "GET" })
  .handler(async () => {
    return query<any>("SELECT * FROM categories ORDER BY name");
  });

export const createCategory = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    await execute("INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)",
      data.name, data.slug, data.description || null, data.icon || null);
    return { ok: true };
  });

export const updateCategory = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    await execute("UPDATE categories SET name = ?, slug = ?, description = ?, icon = ? WHERE id = ?",
      data.name, data.slug, data.description || null, data.icon || null, data.id);
    return { ok: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .validator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    await execute("DELETE FROM categories WHERE id = ?", data.id);
    return { ok: true };
  });

// ---------- Cities ----------

export const listCities = createServerFn({ method: "GET" })
  .handler(async () => {
    return query<any>("SELECT * FROM cities ORDER BY name");
  });

export const createCity = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    await execute("INSERT INTO cities (name, slug, state) VALUES (?, ?, ?)",
      data.name, data.slug, data.state || "AC");
    return { ok: true };
  });

export const updateCity = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    await execute("UPDATE cities SET name = ?, slug = ?, state = ? WHERE id = ?",
      data.name, data.slug, data.state || "AC", data.id);
    return { ok: true };
  });

export const deleteCity = createServerFn({ method: "POST" })
  .validator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    await execute("DELETE FROM cities WHERE id = ?", data.id);
    return { ok: true };
  });

// ---------- Neighborhoods ----------

export const listNeighborhoods = createServerFn({ method: "GET" })
  .validator((d?: { cityId?: number }) => d)
  .handler(async ({ data }) => {
    let sql = "SELECT * FROM neighborhoods";
    const params: unknown[] = [];
    if (data?.cityId) { sql += " WHERE city_id = ?"; params.push(data.cityId); }
    sql += " ORDER BY name";
    return query<any>(sql, ...params);
  });

export const createNeighborhood = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    await execute("INSERT INTO neighborhoods (name, slug, city_id) VALUES (?, ?, ?)",
      data.name, data.slug, data.city_id);
    return { ok: true };
  });

export const updateNeighborhood = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    await execute("UPDATE neighborhoods SET name = ?, slug = ?, city_id = ? WHERE id = ?",
      data.name, data.slug, data.city_id, data.id);
    return { ok: true };
  });

export const deleteNeighborhood = createServerFn({ method: "POST" })
  .validator((d: { id: number }) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    await execute("DELETE FROM neighborhoods WHERE id = ?", data.id);
    return { ok: true };
  });

// ---------- Reviews ----------

export const listReviews = createServerFn({ method: "GET" })
  .validator((d?: { businessId?: string }) => d)
  .handler(async ({ data }) => {
    let sql = "SELECT r.*, u.name as user_name FROM reviews r LEFT JOIN users u ON r.user_id = u.id";
    const params: unknown[] = [];
    if (data?.businessId) { sql += " WHERE r.business_id = ?"; params.push(data.businessId); }
    sql += " ORDER BY r.created_at DESC";
    return query<any>(sql, ...params);
  });

export const createReview = createServerFn({ method: "POST" })
  .validator((d: { business_id: string; rating: number; comment?: string }) => d)
  .handler(async ({ data }) => {
    const user = await requireUser();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await execute(
      "INSERT INTO reviews (id, business_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      id, data.business_id, user.id, data.rating, data.comment || null, now,
    );
    return { ok: true };
  });

export const deleteReview = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    await execute("DELETE FROM reviews WHERE id = ?", data.id);
    return { ok: true };
  });

// ---------- Favorites ----------

export const listFavorites = createServerFn({ method: "GET" })
  .validator((d: { userId: string }) => d)
  .handler(async ({ data }) => {
    return query<any>(
      "SELECT f.*, b.name as business_name, b.slug as business_slug, b.image_url FROM favorites f JOIN businesses b ON f.business_id = b.id WHERE f.user_id = ? ORDER BY f.created_at DESC",
      data.userId,
    );
  });

export const toggleFavorite = createServerFn({ method: "POST" })
  .validator((d: { business_id: string }) => d)
  .handler(async ({ data }) => {
    const user = await requireUser();
    const existing = await queryOne<{ id: string }>(
      "SELECT id FROM favorites WHERE user_id = ? AND business_id = ?", user.id, data.business_id,
    );
    if (existing) {
      await execute("DELETE FROM favorites WHERE id = ?", existing.id);
      return { favorited: false };
    }
    const id = crypto.randomUUID();
    await execute("INSERT INTO favorites (id, user_id, business_id, created_at) VALUES (?, ?, ?, ?)",
      id, user.id, data.business_id, new Date().toISOString());
    return { favorited: true };
  });

// ---------- Analytics ----------

export const createAnalyticsEvent = createServerFn({ method: "POST" })
  .validator((d: { event: string; business_id?: string; metadata?: string }) => d)
  .handler(async ({ data }) => {
    const user = await getOptionalUser();
    await execute(
      "INSERT INTO analytics_events (event, business_id, user_id, metadata, created_at) VALUES (?, ?, ?, ?, ?)",
      data.event, data.business_id || null, user?.id || null, data.metadata || null, new Date().toISOString(),
    );
    return { ok: true };
  });

// ---------- Profile ----------

export const getProfile = createServerFn({ method: "GET" })
  .handler(async () => {
    const user = await requireUser();
    return queryOne<any>("SELECT id, email, name, avatar_url, role, created_at FROM users WHERE id = ?", user.id);
  });

export const updateProfile = createServerFn({ method: "POST" })
  .validator((d: { name?: string; avatar_url?: string }) => d)
  .handler(async ({ data }) => {
    const user = await requireUser();
    const updates: string[] = [];
    const vals: unknown[] = [];
    if (data.name !== undefined) { updates.push("name = ?"); vals.push(data.name); }
    if (data.avatar_url !== undefined) { updates.push("avatar_url = ?"); vals.push(data.avatar_url); }
    if (updates.length === 0) return { ok: true };
    updates.push("updated_at = ?");
    vals.push(new Date().toISOString());
    vals.push(user.id);
    await execute(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, ...vals);
    return { ok: true };
  });

// ---------- Admin: users ----------

export const listUsers = createServerFn({ method: "GET" })
  .handler(async () => {
    await requireAdmin();
    return query<any>("SELECT id, email, name, avatar_url, role, created_at FROM users ORDER BY created_at DESC");
  });

export const updateUserRole = createServerFn({ method: "POST" })
  .validator((d: { id: string; role: string }) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    await execute("UPDATE users SET role = ?, updated_at = ? WHERE id = ?",
      data.role, new Date().toISOString(), data.id);
    return { ok: true };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .validator((d: { id: string }) => d)
  .handler(async ({ data }) => {
    await requireAdmin();
    await execute("DELETE FROM users WHERE id = ?", data.id);
    return { ok: true };
  });
