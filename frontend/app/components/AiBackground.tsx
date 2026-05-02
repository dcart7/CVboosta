"use client";

import { useMotionEnabled } from "../lib/motion";

export default function AiBackground() {
  const enabled = useMotionEnabled();
  // Keep background extremely subtle; still render in reduced motion but stop animation via CSS.
  return <div className={`ai-bg${enabled ? "" : " ai-bg-static"}`} aria-hidden="true" />;
}

