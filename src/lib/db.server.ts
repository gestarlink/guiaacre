let _db: D1Database | null = null;

export function setDB(db: D1Database) {
  _db = db;
}

export function getDB(): D1Database {
  if (_db) return _db;
  try {
    const storage =
      (globalThis as any)[Symbol.for("tanstack-start:event-storage")];
    const store = storage?.getStore();
    const h3Event = store?.h3Event;
    const env =
      (h3Event as any)?.req?.runtime?.cloudflare?.env ??
      (globalThis as any).__env__;
    if (env?.DB) {
      _db = env.DB;
      return _db;
    }
  } catch {}
  throw new Error("D1 not available");
}

export async function query<T>(sql: string, ...params: unknown[]): Promise<T[]> {
  const db = getDB();
  const stmt = db.prepare(sql);
  const bound = params.reduce((s, p) => s.bind(p), stmt);
  const result = await bound.all<T>();
  return result.results;
}

export async function queryOne<T>(sql: string, ...params: unknown[]): Promise<T | null> {
  const rows = await query<T>(sql, ...params);
  return rows[0] ?? null;
}

export async function execute(sql: string, ...params: unknown[]): Promise<D1Result> {
  const db = getDB();
  const stmt = db.prepare(sql);
  const bound = params.reduce((s, p) => s.bind(p), stmt);
  return bound.run();
}
