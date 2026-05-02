"use client";

import { useEffect } from "react";
import { useMotionEnabled } from "../lib/motion";

/**
 * Enables scroll-triggered reveals for existing `.fade-up` blocks.
 * - Triggers once per element
 * - Avoids layout thrash (IntersectionObserver only)
 */
export default function ScrollRevealLayer() {
  const enabled = useMotionEnabled();

  useEffect(() => {
    if (!enabled) return;
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".fade-up"));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          el.classList.add("is-inview");
          observer.unobserve(el);
        }
      },
      // Faster perceived reveal: trigger slightly earlier with a lower threshold.
      { threshold: 0.08, rootMargin: "0px 0px -18% 0px" },
    );

    for (const el of elements) {
      // Skip if already revealed (e.g., above the fold on initial paint)
      if (el.classList.contains("is-inview")) continue;
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, [enabled]);

  return null;
}
