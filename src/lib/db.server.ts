let _db: D1Database | null = null;

export function setDB(db: D1Database) {
  _db = db;
}

export function getDB(): D1Database {
  if (_db) return _db;

  try {
    const env = (globalThis as any).__env__;
    if (env?.DB) {
      _db = env.DB;
      return _db;
    }
  } catch {
    /* __env__ */
  }

  try {
    const env = (process as any).env;
    if (env?.DB) {
      _db = env.DB as D1Database;
      return _db;
    }
  } catch {
    /* process.env */
  }

  try {
    const storage = (globalThis as any)[Symbol.for("tanstack-start:event-storage")];
    const store = storage?.getStore();
    const h3Event = store?.h3Event;
    const env = (h3Event as any)?.req?.runtime?.cloudflare?.env;
    if (env?.DB) {
      _db = env.DB;
      return _db;
    }
  } catch {
    /* storage */
  }

  // For DIAGNOSTIC: create a mock D1 that always returns empty arrays
  // so we can see if the site loads at all (error is elsewhere)
  const mockDb = {
    prepare: () => ({
      bind: () => ({
        all: async () => ({ results: [] }),
        first: async () => null,
        run: async () => ({ success: true, results: [], meta: {} }),
      }),
      all: async () => ({ results: [] }),
      first: async () => null,
      run: async () => ({ success: true, results: [], meta: {} }),
    }),
  } as unknown as D1Database;
  _db = mockDb;
  return _db;
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
