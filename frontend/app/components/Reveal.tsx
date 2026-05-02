"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMotionEnabled } from "../lib/motion";

type Props = {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
  /**
   * Reveal once (default). When false, re-animates when leaving/entering.
   */
  once?: boolean;
  /**
   * Extra delay for this block in ms.
   */
  delayMs?: number;
  /**
   * Apply stagger to direct children.
   */
  staggerChildren?: boolean;
  /**
   * Stagger step in ms (50–100 recommended).
   */
  staggerMs?: number;
};

export default function Reveal({
  as = "div",
  className,
  children,
  once = true,
  delayMs = 0,
  staggerChildren = false,
  staggerMs = 70,
}: Props) {
  const enabled = useMotionEnabled();
  const ref = useRef<HTMLElement | null>(null);

  const Tag = as as any;

  const style = useMemo(() => {
    return {
      ["--reveal-delay" as any]: `${Math.max(0, delayMs)}ms`,
      ["--stagger-step" as any]: `${Math.max(0, staggerMs)}ms`,
    } as React.CSSProperties;
  }, [delayMs, staggerMs]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!enabled) {
      el.classList.add("is-revealed");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-revealed");
            if (once) observer.disconnect();
          } else if (!once) {
            el.classList.remove("is-revealed");
          }
        }
      },
      { root: null, threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, once]);

  return (
    <Tag
      ref={(node: HTMLElement | null) => {
        ref.current = node;
      }}
      className={[
        "reveal",
        staggerChildren ? "reveal-stagger" : "",
        className || "",
      ].join(" ").trim()}
      style={style}
    >
      {staggerChildren ? (
        <RevealChildren>{children}</RevealChildren>
      ) : (
        children
      )}
    </Tag>
  );
}

function RevealChildren({ children }: { children: React.ReactNode }) {
  // Wrap direct children so CSS can stagger them reliably.
  const items = Array.isArray(children) ? children : [children];
  return (
    <>
      {items.map((child, index) => (
        <div key={index} className="reveal-item" style={{ ["--i" as any]: index } as any}>
          {child}
        </div>
      ))}
    </>
  );
}
