import { useCallback } from "react";
import { createAnalyticsEvent } from "@/lib/crud.server";

export type AnalyticsEvent =
  | "page_view"
  | "business_view"
  | "whatsapp_click"
  | "phone_click"
  | "map_click"
  | "favorite_add"
  | "share_click"
  | "category_click"
  | "search";

function getSessionId() {
  if (typeof window === "undefined") return null;
  let id = sessionStorage.getItem("ga_sid");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("ga_sid", id);
  }
  return id;
}

function deviceType() {
  if (typeof window === "undefined") return null;
  return window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
}

export function useAnalytics() {
  const track = useCallback(
    async (
      event_type: AnalyticsEvent,
      data?: { business_id?: string; metadata?: Record<string, unknown> },
    ) => {
      try {
        await createAnalyticsEvent({
          data: {
            event: event_type,
            business_id: data?.business_id ?? null,
            metadata: JSON.stringify({
              session_id: getSessionId(),
              path: typeof window !== "undefined" ? window.location.pathname : null,
              referrer: typeof document !== "undefined" ? document.referrer || null : null,
              device_type: deviceType(),
              user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
              ...(data?.metadata ?? {}),
            }),
          },
        });
      } catch {
        // silent
      }
    },
    [],
  );
  return { track };
}
