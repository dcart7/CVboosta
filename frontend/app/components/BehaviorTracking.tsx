"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  ANALYTICS_EVENTS,
  trackEvent,
} from "../lib/analytics";
import {
  CONSENT_UPDATED_EVENT,
  hasAnalyticsConsent,
  type ConsentPreferences,
} from "../lib/consent";
import { isSensitiveCredentialRoute } from "../lib/sensitiveRoutes";

function getPageType(pathname: string): string {
  if (pathname.startsWith("/resume-keywords")) return "seo";
  if (pathname.startsWith("/pricing")) return "pricing";
  if (pathname.startsWith("/results")) return "results";
  if (pathname.startsWith("/app")) return "app";
  if (pathname.startsWith("/free-ats-resume-checker")) return "ats";
  return "site";
}

export default function BehaviorTracking() {
  const pathname = usePathname();
  const sensitiveRoute = isSensitiveCredentialRoute(pathname);
  const pageType = useMemo(() => getPageType(pathname), [pathname]);
  const firedScroll = useRef(new Set<number>());
  const firedTime = useRef(false);
  const firedExit = useRef(false);
  const pageViewTracked = useRef(false);

  useEffect(() => {
    if (sensitiveRoute) return;
    firedScroll.current = new Set();
    firedTime.current = false;
    firedExit.current = false;
    pageViewTracked.current = hasAnalyticsConsent();
    trackEvent(ANALYTICS_EVENTS.pageView, {
      page_path: pathname,
      page_type: pageType,
    });
  }, [pageType, pathname, sensitiveRoute]);

  useEffect(() => {
    if (sensitiveRoute) return;
    const onConsentUpdated = (event: Event) => {
      const preferences = (event as CustomEvent<ConsentPreferences>).detail;
      if (!preferences?.analytics) {
        pageViewTracked.current = false;
        return;
      }
      if (pageViewTracked.current) return;
      pageViewTracked.current = true;
      trackEvent(ANALYTICS_EVENTS.pageView, {
        page_path: pathname,
        page_type: pageType,
        consent_granted_on_page: true,
      });
    };
    window.addEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
  }, [pageType, pathname, sensitiveRoute]);

  useEffect(() => {
    if (sensitiveRoute) return;
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const maxScroll = (doc.scrollHeight || 0) - (window.innerHeight || 0);
      if (maxScroll <= 0) return;
      const pct = Math.round((scrollTop / maxScroll) * 100);
      const thresholds = [25, 50, 75] as const;
      for (const t of thresholds) {
        if (pct >= t && !firedScroll.current.has(t)) {
          firedScroll.current.add(t);
          trackEvent(ANALYTICS_EVENTS.scrollDepth, {
            page_type: pageType,
            percent_scrolled: t,
          });
        }
      }
    };

    const onMouseOut = (event: MouseEvent) => {
      // Classic "exit intent": cursor leaves top of viewport.
      if (firedExit.current || document.visibilityState !== "visible") return;
      if (event.clientY <= 0 && event.relatedTarget === null) {
        firedExit.current = true;
        trackEvent(ANALYTICS_EVENTS.exitIntent, { page_type: pageType });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onMouseOut);

    const timer = window.setTimeout(() => {
      if (firedTime.current) return;
      firedTime.current = true;
      if (document.visibilityState !== "visible") return;
      trackEvent(ANALYTICS_EVENTS.engagedSession, {
        page_type: pageType,
        engagement_time_seconds: 30,
      });
    }, 30_000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onMouseOut);
      window.clearTimeout(timer);
    };
  }, [pageType, sensitiveRoute]);

  return null;
}
