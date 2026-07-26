import { Star, Crown } from "lucide-react";
import type { BusinessTier } from "@/hooks/useBusinesses";

export function TierBadge({ tier, size = "sm" }: { tier: BusinessTier; size?: "sm" | "md" }) {
  if (tier === "basic") return null;
  const px = size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[11px]";
  if (tier === "premium") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md ${px} font-semibold text-white shadow-sm`}
        style={{
          background: "linear-gradient(135deg, oklch(0.78 0.16 75) 0%, oklch(0.65 0.18 50) 100%)",
        }}
      >
        <Crown className="h-3 w-3" fill="currentColor" /> Premium
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-highlight/40 ${px} font-semibold text-highlight-foreground`}
    >
      <Star className="h-3 w-3" fill="currentColor" /> Destaque
    </span>
  );
}
