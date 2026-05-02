"use client";

import { useEffect, useMemo, useState } from "react";

function readFlag(value: string | undefined): boolean | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (["0", "false", "off", "no"].includes(normalized)) return false;
  if (["1", "true", "on", "yes"].includes(normalized)) return true;
  return null;
}

/**
 * Global motion toggle with reduced-motion safety.
 * - Default: enabled.
 * - Set `NEXT_PUBLIC_MOTION=0` to disable animations entirely.
 */
export function useMotionEnabled(): boolean {
  const envOverride = useMemo(() => readFlag(process.env.NEXT_PUBLIC_MOTION), []);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReduced(!!query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);

  if (envOverride === false) return false;
  if (prefersReduced) return false;
  return true;
}

export function isTouchLikeDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    (navigator.maxTouchPoints ?? 0) > 0 ||
    window.matchMedia?.("(pointer: coarse)")?.matches === true
  );
}

