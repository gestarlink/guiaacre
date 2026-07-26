import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Review = {
  id: string;
  business_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  author_name?: string | null;
  author_avatar?: string | null;
};

export function useReviews(businessId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    const { data: rows } = await supabase
      .from("reviews")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    const list = (rows ?? []) as Review[];
    if (list.length) {
      const userIds = [...new Set(list.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);
      const map = new Map((profiles ?? []).map((p) => [p.user_id, p]));
      list.forEach((r) => {
        const p = map.get(r.user_id);
        r.author_name = p?.display_name ?? "Usuário";
        r.author_avatar = p?.avatar_url ?? null;
      });
    }
    setReviews(list);
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return { reviews, loading, avg, count: reviews.length, refetch: fetchReviews };
}

export async function upsertReview(input: {
  businessId: string;
  userId: string;
  rating: number;
  comment: string;
}) {
  const { error } = await supabase.from("reviews").upsert(
    {
      business_id: input.businessId,
      user_id: input.userId,
      rating: input.rating,
      comment: input.comment || null,
    },
    { onConflict: "business_id,user_id" },
  );
  return { error };
}
