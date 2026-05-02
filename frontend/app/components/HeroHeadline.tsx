"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMotionEnabled } from "../lib/motion";

type Props = {
  text: string;
  className?: string;
};

function splitOnEmDash(text: string): { left: string; right: string | null } {
  const parts = text.split("—");
  if (parts.length < 2) return { left: text, right: null };
  const left = parts.shift() ?? "";
  const right = parts.join("—");
  return { left: left.trim(), right: right.trim() || null };
}

export default function HeroHeadline({ text, className }: Props) {
  const enabled = useMotionEnabled();
  const ref = useRef<HTMLHeadingElement | null>(null);
  const split = useMemo(() => splitOnEmDash(text), [text]);

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
      { threshold: 0.2, rootMargin: "0px 0px -20% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);

  return (
    <h1 ref={ref} className={["hh", className || ""].join(" ").trim()}>
      <span className="hh-main">{split.left}</span>
      {split.right ? (
        <>
          <span className="hh-dash" aria-hidden="true">
            {" "}
            —{" "}
          </span>
          <span className="hh-sub">{split.right}</span>
        </>
      ) : null}
      <span className="hh-sheen" aria-hidden="true" />
    </h1>
  );
}

