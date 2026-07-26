import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/data";

type Props = {
  phone: string;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
};

export function WhatsAppButton({ phone, size = "sm", label, className = "" }: Props) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-full bg-whatsapp text-whatsapp-foreground font-semibold shadow-pill active:scale-95 transition-transform";
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-14 px-6 text-base w-full",
  };
  return (
    <a
      href={waLink(phone)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`${base} ${sizes[size]} ${className}`}
    >
      <MessageCircle className="h-4 w-4" fill="currentColor" strokeWidth={0} />
      {label ?? "WhatsApp"}
    </a>
  );
}

export function WhatsAppIconButton({ phone }: { phone: string }) {
  return (
    <a
      href={waLink(phone)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-pill active:scale-95 transition-transform shrink-0"
      aria-label="WhatsApp"
    >
      <MessageCircle className="h-5 w-5" fill="currentColor" strokeWidth={0} />
    </a>
  );
}
