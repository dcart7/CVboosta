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
    <div className="nav-actions">
      <Link className="btn primary" href="/app">
        {t("hero.startWithCv")}
      </Link>
      {!isAuthed && (
        <Link className="btn secondary" href="/register">
          {t("hero.createAccount")}
        </Link>
      )}
    </div>
  );
}
