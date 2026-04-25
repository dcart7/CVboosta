"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "../lib/LanguageContext";
import { getApiBase } from "../lib/apiBase";
import { fetchWithRetry } from "../lib/fetchRetry";

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
      <Link className="btn primary hero-cta-primary" href="/app">
        {t("hero.startWithCv")}
      </Link>
      <Link className="btn ghost hero-cta-secondary" href="/free-ats-resume-checker">
        Free ATS checker
      </Link>
      {!isAuthed && (
        <Link className="btn primary hero-cta-register" href="/register">
          {t("nav.register")}
        </Link>
      )}
    </div>
  );
}
