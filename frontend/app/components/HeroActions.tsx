"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "../lib/LanguageContext";
import { getApiBase } from "../lib/apiBase";
import { fetchWithRetry } from "../lib/fetchRetry";
import { ANALYTICS_EVENTS, trackEvent } from "../lib/analytics";

export default function HeroActions() {
  const [isAuthed, setIsAuthed] = useState(false);
  const { t } = useTranslation();
  const apiBase = getApiBase();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchWithRetry(
          `${apiBase}/auth/me`,
          undefined,
          { attempts: 2, baseDelayMs: 250, timeoutMs: 10_000 },
        );
        if (!cancelled) setIsAuthed(res.ok);
      } catch {
        if (!cancelled) setIsAuthed(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  return (
    <div className="nav-actions hero-actions">
      <Link
        className="btn primary hero-cta-primary"
        href="/app"
        onClick={() => trackEvent(ANALYTICS_EVENTS.ctaClicked, {
          cta_type: "start_cv_match",
          location: "home_hero",
          auth_state: isAuthed ? "authenticated" : "guest",
        })}
      >
        {t("hero.startWithCv")}
      </Link>
      <Link
        className="btn ghost hero-cta-cases"
        href="/cases"
        onClick={() => trackEvent(ANALYTICS_EVENTS.ctaClicked, {
          cta_type: "view_method_examples",
          location: "home_hero",
        })}
      >
        {t("cases.navCta")}
      </Link>
    </div>
  );
}
