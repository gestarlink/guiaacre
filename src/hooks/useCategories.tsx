import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DBCategory = {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
  color: string | null;
  icon_url: string | null;
  sort_order: number;
};

export function useCategories() {
  const q = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, slug, name, emoji, color, icon_url, sort_order")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DBCategory[];
    },
  });
  return { data: q.data ?? [], isLoading: q.isLoading, refetch: q.refetch };
}
