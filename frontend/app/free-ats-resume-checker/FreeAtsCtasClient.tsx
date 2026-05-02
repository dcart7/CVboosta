"use client";

import Link from "next/link";
import { trackEvent } from "../lib/analytics";

export default function FreeAtsCtasClient() {
  return (
    <div className="nav-actions">
      <Link
        className="btn primary"
        href="/app"
        onClick={() => trackEvent("cta_click", { cta_type: "check_ats", location: "hero" })}
      >
        Start free analysis
      </Link>
      <Link
        className="btn ghost"
        href="/app"
        onClick={() => trackEvent("cta_click", { cta_type: "check_ats", location: "hero_secondary" })}
      >
        Open dashboard
      </Link>
    </div>
  );
}

