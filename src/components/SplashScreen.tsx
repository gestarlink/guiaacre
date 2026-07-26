import { useEffect, useState } from "react";
import logo from "@/assets/logo-guiaacre.png";

const SHOWN_KEY = "guiaacre.splash-shown";

export function SplashScreen() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(SHOWN_KEY) !== "1";
  });
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const t1 = window.setTimeout(() => setLeaving(true), 1600);
    const t2 = window.setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem(SHOWN_KEY, "1");
    }, 2100);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-brand via-brand to-whatsapp transition-opacity duration-500 ${
        leaving ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={leaving}
    >
      <div className="splash-logo-wrap">
        <img
          src={logo}
          alt="GuiaAcre"
          className="splash-logo h-32 w-32 sm:h-40 sm:w-40 drop-shadow-2xl"
          draggable={false}
        />
        <div className="splash-pulse" />
      </div>
      <p className="splash-title mt-6 font-display font-bold text-3xl text-white tracking-tight">
        GuiaAcre
      </p>
      <div className="splash-loader mt-6">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
