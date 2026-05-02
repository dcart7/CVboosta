"use client";

import { useEffect, useRef } from "react";
import { isTouchLikeDevice, useMotionEnabled } from "../lib/motion";

const INTERACTIVE_SELECTOR =
  "a,button,.btn,input,textarea,select,summary,[role='button'],[data-interactive='true']";

export default function CursorGlow() {
  const enabled = useMotionEnabled();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    if (isTouchLikeDevice()) return;
    const node = ref.current;
    if (!node) return;

    let raf = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;
    let active = false;
    let intensity = 1;

    const tick = () => {
      // Fast, smooth follow without layout thrash (GPU transform only).
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      node.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate3d(-50%, -50%, 0)`;
      node.style.opacity = active ? String(0.16 * intensity) : "0";
      raf = window.requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      active = true;
    };
    const onLeave = () => {
      active = false;
    };
    const onOver = (e: Event) => {
      const el = e.target as HTMLElement | null;
      intensity = el?.closest?.(INTERACTIVE_SELECTOR) ? 1.35 : 1;
      node.dataset.active = intensity > 1 ? "interactive" : "base";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    raf = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerover", onOver);
      window.cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}

