import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type DBCity = {
  id: string;
  slug: string;
  name: string;
  uf: string;
  sort_order: number;
  created_at: string;
};

export function useCities() {
  const [data, setData] = useState<DBCity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from("cities")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    setData((rows as DBCity[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, loading, refetch: fetchAll };
}
