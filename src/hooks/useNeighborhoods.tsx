import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type DBNeighborhood = {
  id: string;
  slug: string;
  name: string;
  city: string;
  image_url: string | null;
  created_at: string;
};

export function useNeighborhoods() {
  const [data, setData] = useState<DBNeighborhood[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from("neighborhoods")
      .select("*")
      .order("name", { ascending: true });
    setData((rows as DBNeighborhood[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { data, loading, refetch: fetchAll };
}
