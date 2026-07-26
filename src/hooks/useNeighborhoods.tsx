import { useEffect, useState, useCallback } from "react";
import { listNeighborhoods } from "@/lib/crud.server";
import type { Neighborhood } from "@/lib/types";

export type DBNeighborhood = Neighborhood;

export function useNeighborhoods() {
  const [data, setData] = useState<DBNeighborhood[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const rows = await listNeighborhoods();
    setData((rows as DBNeighborhood[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, loading, refetch: fetchAll };
}
