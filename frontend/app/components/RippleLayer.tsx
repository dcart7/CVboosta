"use client";

import { useEffect } from "react";
import { useMotionEnabled } from "../lib/motion";

/**
 * Lightweight ripple/press feedback for clickable surfaces.
 * - No libraries
 * - Uses a single DOM span appended on pointerdown
 */
export default function RippleLayer() {
  const enabled = useMotionEnabled();

  useEffect(() => {
    if (!enabled) return;

    const onDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const host = target.closest?.(".btn, .card, [data-ripple='true']");
      if (!host) return;
      if (host.getAttribute("data-ripple") === "false") return;

      const rect = host.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.2;
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const ripple = document.createElement("span");
      ripple.className = "ripple-ink";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      host.classList.add("ripple-host");
      host.appendChild(ripple);

      window.setTimeout(() => ripple.remove(), 650);
    };

    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onDown);
  }, [enabled]);

  return null;
}

