import { useEffect, useState, useCallback } from "react";

const KEY = "guiaacre:favorites";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favs, setFavs] = useState<string[]>([]);

  useEffect(() => {
    setFavs(read());
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setFavs(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((id: string) => {
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFav = useCallback((id: string) => favs.includes(id), [favs]);

  return { favs, toggle, isFav };
}
