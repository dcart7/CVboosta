"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "../lib/LanguageContext";

export default function HeroActions() {
  const [isAuthed, setIsAuthed] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setIsAuthed(Boolean(localStorage.getItem("auth_token")));
  }, []);

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
