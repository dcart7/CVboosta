"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useMotionEnabled } from "../lib/motion";

/**
 * Enables scroll-triggered reveals for existing `.fade-up` blocks.
 * - Triggers once per element
 * - Avoids layout thrash (IntersectionObserver only)
 */
export default function ScrollRevealLayer() {
  const enabled = useMotionEnabled();
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) return;
    // Progressive enhancement: only hide `.fade-up` content after JS is live.
    document.documentElement.classList.add("motion-ready");

    let raf = 0;
    let observer: IntersectionObserver | null = null;

    const scan = () => {
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>(".fade-up:not(.is-inview)"),
      );
      if (elements.length === 0) return;

      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const el = entry.target as HTMLElement;
            el.classList.add("is-inview");
            observer?.unobserve(el);
          }
        },
        { threshold: 0.08, rootMargin: "0px 0px -18% 0px" },
      );

      const viewportHeight = window.innerHeight || 0;
      for (const el of elements) {
        // Reveal immediately when already in viewport after navigation.
        const rect = el.getBoundingClientRect();
        if (rect.top < viewportHeight * 0.9) {
          el.classList.add("is-inview");
          continue;
        }
        observer.observe(el);
      }
    };

    // Defer one frame so route content is mounted before scanning.
    raf = window.requestAnimationFrame(scan);
    return () => {
      window.cancelAnimationFrame(raf);
      observer?.disconnect();
    };
  }, [enabled, pathname]);

  return null;
}
