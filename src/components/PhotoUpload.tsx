import { X } from "lucide-react";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  className?: string;
};

export function PhotoUpload({ value, onChange, className }: Props) {
  return (
    <div className={className}>
      {value ? (
        <div className="relative">
          <img src={value} alt="Foto" className="w-full h-44 object-cover rounded-xl border border-border" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-card/95 border border-border inline-flex items-center justify-center shadow"
            aria-label="Remover foto"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="url"
            placeholder="URL da foto..."
            onChange={(e) => onChange(e.target.value || null)}
            className="flex-1 h-10 rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
        </div>
      )}
    </div>
  );
}
