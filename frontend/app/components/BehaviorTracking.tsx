"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "../lib/analytics";

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
  const pageType = useMemo(() => getPageType(pathname), [pathname]);
  const firedScroll = useRef(new Set<number>());
  const firedTime = useRef(false);
  const firedExit = useRef(false);

  useEffect(() => {
    firedScroll.current = new Set();
    firedTime.current = false;
    firedExit.current = false;
    trackEvent("page_view", { page_path: pathname, page_type: pageType });
  }, [pathname]);

  useEffect(() => {
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
          trackEvent(`scroll_${t}`, { page_type: pageType });
        }
      }
    };

    const onMouseOut = (event: MouseEvent) => {
      // Classic "exit intent": cursor leaves top of viewport.
      if (firedExit.current) return;
      if (event.clientY <= 0) {
        firedExit.current = true;
        trackEvent("exit_intent", { page_type: pageType });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onMouseOut);

    const timer = window.setTimeout(() => {
      if (firedTime.current) return;
      firedTime.current = true;
      trackEvent("time_30s", { page_type: pageType });
    }, 30_000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onMouseOut);
      window.clearTimeout(timer);
    };
  }, [pageType]);

  return null;
}
