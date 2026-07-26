import { Star } from "lucide-react";

export function Stars({
  value,
  size = 16,
  onChange,
  className = "",
}: {
  value: number;
  size?: number;
  onChange?: (v: number) => void;
  className?: string;
}) {
  const interactive = !!onChange;
  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(n)}
            className={interactive ? "cursor-pointer active:scale-90 transition" : "cursor-default"}
            aria-label={`${n} estrelas`}
          >
            <Star
              style={{ width: size, height: size }}
              className={filled ? "text-highlight-foreground" : "text-muted-foreground/40"}
              fill={filled ? "currentColor" : "none"}
            />
          </button>
        );
      })}
    </div>
  );
}
