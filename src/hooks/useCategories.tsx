import { useQuery } from "@tanstack/react-query";
import { listCategories } from "@/lib/crud.server";
import type { Category } from "@/lib/types";

export type DBCategory = Category;

export function useCategories() {
  const q = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await listCategories();
      return (data ?? []) as DBCategory[];
    },
  });
  return { data: q.data ?? [], isLoading: q.isLoading, refetch: q.refetch };
}
