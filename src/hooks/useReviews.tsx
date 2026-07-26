import { useEffect, useState, useCallback } from "react";
import { listReviews, createReview as serverCreateReview } from "@/lib/crud.server";

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
    const rows = await listReviews({ data: { businessId } });
    setReviews((rows ?? []) as Review[]);
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return { reviews, loading, avg, count: reviews.length, refetch: fetchReviews };
}

export async function createReview(input: {
  business_id: string;
  rating: number;
  comment?: string;
}) {
  await serverCreateReview({ data: input });
}
