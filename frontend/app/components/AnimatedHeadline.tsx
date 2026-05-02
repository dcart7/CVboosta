"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMotionEnabled } from "../lib/motion";

type Props = {
  text: string;
  className?: string;
  /**
   * Base delay before first word animates (ms).
   */
  delayMs?: number;
  /**
   * Word stagger step (ms).
   */
  staggerMs?: number;
};

function tokenize(input: string): string[] {
  // Keep punctuation with the word to avoid weird line breaks.
  return input.split(/\s+/).filter(Boolean);
}

export default function AnimatedHeadline({
  text,
  className,
  delayMs = 30,
  staggerMs = 55,
}: Props) {
  const enabled = useMotionEnabled();
  const ref = useRef<HTMLHeadingElement | null>(null);
  const tokens = useMemo(() => tokenize(text), [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!enabled) {
      el.classList.add("is-inview");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          el.classList.add("is-inview");
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  return (
    <h1
      ref={ref}
      className={["headline-anim", className || ""].join(" ").trim()}
      style={
        {
          ["--headline-delay" as any]: `${delayMs}ms`,
          ["--headline-step" as any]: `${staggerMs}ms`,
        } as React.CSSProperties
      }
    >
      {tokens.map((token, index) => (
        <span
          key={`${token}-${index}`}
          className="headline-word"
          style={{ ["--i" as any]: index } as any}
        >
          {token}
          {index < tokens.length - 1 ? " " : ""}
        </span>
      ))}
      <span className="headline-sheen" aria-hidden="true" />
    </h1>
  );
}

