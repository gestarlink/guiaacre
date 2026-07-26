let _db: D1Database | null = null;

export function setDB(db: D1Database) {
  _db = db;
}

export function getDB(): D1Database {
  if (_db) return _db;
  const g = globalThis as any;
  if (g.__env__?.DB) {
    _db = g.__env__.DB;
    return _db;
  }
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
