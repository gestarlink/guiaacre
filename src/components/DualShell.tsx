import { ReactNode } from "react";
import { DesktopShell } from "@/components/DesktopShell";
import { MobileShell } from "@/components/MobileShell";

/**
 * Renders the same children inside a proper desktop shell (top nav + footer)
 * on md+ and inside the mobile phone shell on small screens.
 * Use for pages whose mobile body works fine when centered on desktop
 * (auth, profile, forms, etc.) — avoids the awkward "phone frame on desktop".
 */
export function DualShell({
  children,
  desktopMaxWidth = "max-w-2xl",
  desktopPadding = "py-10",
  showMobileBottomNav = true,
}: {
  children: ReactNode;
  desktopMaxWidth?: string;
  desktopPadding?: string;
  showMobileBottomNav?: boolean;
}) {
  return (
    <>
      <div className="hidden md:block">
        <DesktopShell>
          <div className={`mx-auto ${desktopMaxWidth} px-6 ${desktopPadding}`}>
            <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
              {children}
            </div>
          </div>
        </DesktopShell>
      </div>
      <div className="md:hidden">
        <MobileShell showBottomNav={showMobileBottomNav}>{children}</MobileShell>
      </div>
    </>
  );
}
