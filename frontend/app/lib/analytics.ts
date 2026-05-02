"use client";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<string, string | number | boolean | null | undefined>;

export function pushDataLayerEvent(event: string, params?: EventParams): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  const payload: Record<string, unknown> = { event };
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      payload[key] = value;
    }
  }
  window.dataLayer.push(payload);
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | null>,
): void {
  if (typeof window === "undefined") {
    return;
  }
  pushDataLayerEvent(eventName, params);
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== "function") {
    return;
  }
  gtag("event", eventName, params ?? {});
}
