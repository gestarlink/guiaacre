import { useEffect, useState, useCallback } from "react";
import { listCities } from "@/lib/crud.server";
import type { City } from "@/lib/types";

export type DBCity = City;

export function useCities() {
  const [data, setData] = useState<DBCity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const rows = await listCities();
    setData((rows as DBCity[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, loading, refetch: fetchAll };
}
