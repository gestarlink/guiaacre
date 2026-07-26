import { useEffect, useState, useCallback } from "react";
import { listBusinesses } from "@/lib/crud.server";

export type BusinessTier = "basic" | "featured" | "premium";

export type DBBusiness = {
  id: string;
  owner_id: string;
  name: string;
  category: string;
  category_id: string;
  neighborhood: string;
  neighborhood_id: string;
  address: string | null;
  description: string | null;
  hours: string | null;
  whatsapp: string;
  image_url: string | null;
  highlight: boolean;
  tier: BusinessTier;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  latitude: number | null;
  longitude: number | null;
};

export function useBusinesses(filter?: { status?: "approved" | "pending" | "all"; ownerId?: string }) {
  const [data, setData] = useState<DBBusiness[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const rows = await listBusinesses({ data: filter });
    setData((rows as DBBusiness[]) ?? []);
    setLoading(false);
  }, [filter?.status, filter?.ownerId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, loading, refetch: fetchAll };
}
