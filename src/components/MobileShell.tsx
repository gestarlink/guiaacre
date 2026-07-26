import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Toaster } from "@/components/ui/sonner";

export function MobileShell({
  children,
  showBottomNav = true,
}: {
  children: ReactNode;
  showBottomNav?: boolean;
}) {
  return (
    <div className="min-h-[100dvh] md:min-h-screen bg-surface md:bg-gradient-to-br md:from-brand/10 md:via-surface md:to-whatsapp/10">
      {/* Desktop: hero lateral com cara de website */}
      <div className="hidden md:flex fixed inset-y-0 left-0 w-1/2 lg:w-3/5 items-center justify-center p-12 pointer-events-none">
        <div className="max-w-lg text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 text-brand text-sm font-medium">
            📱 App mobile-first
          </div>
          <h2 className="font-display font-bold text-5xl lg:text-6xl text-foreground leading-tight">
            GuiaAcre
            <span className="block text-brand mt-2">no seu bolso</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Encontre negócios locais por bairro e fale direto pelo WhatsApp em segundos.
          </p>
          <p className="text-sm text-muted-foreground">
            👉 Acesse pelo celular para a melhor experiência
          </p>
        </div>
      </div>

      {/* App container: fullscreen no mobile, "phone frame" no desktop */}
      <div
        className="
        relative mx-auto bg-surface
        w-full min-h-[100dvh]
        md:my-8 md:mr-8 md:ml-auto md:w-[420px] md:min-h-0 md:h-[calc(100dvh-4rem)]
        md:rounded-[2.5rem] md:shadow-elevated md:overflow-hidden md:border md:border-border/60
        md:flex md:flex-col
      "
      >
        <div
          className={`flex-1 overflow-y-auto scrollbar-hide ${showBottomNav ? "pb-24" : "pb-6"}`}
        >
          {children}
        </div>
        {showBottomNav ? <BottomNav /> : null}
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
