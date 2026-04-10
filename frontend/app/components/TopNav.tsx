"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getApiBase } from "../lib/apiBase";
import ThemeToggle from "./ThemeToggle";
import { useTranslation } from "../lib/LanguageContext";
import { Language } from "../lib/translations";

export default function TopNav() {
  const [email, setEmail] = useState<string | null>(null);
  const apiBase = getApiBase();
  const { t, language, setLanguage } = useTranslation();

  const languages: { code: Language; flag: string }[] = [
    { code: "en", flag: "🇺🇸" },
    { code: "uk", flag: "🇺🇦" },
    { code: "pl", flag: "🇵🇱" },
    { code: "sk", flag: "🇸🇰" },
    { code: "es", flag: "🇪🇸" },
  ];

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setEmail(null);
      return;
    }
    fetch(`${apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.email) {
          setEmail(data.email);
        } else {
          setEmail(null);
        }
      })
      .catch(() => setEmail(null));
  }, [apiBase]);

  const logout = () => {
    localStorage.removeItem("auth_token");
    setEmail(null);
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link className="brand" href="/">
          <span className="brand-mark">CV</span>
          <span>Smart CV Optimizer</span>
        </Link>
        <nav className="nav-links">
          <Link href="/app">{t("nav.dashboard")}</Link>
          <Link href="/results">{t("nav.results")}</Link>
          <Link href="/history">{t("nav.history")}</Link>
          <Link href="/about">{t("nav.about")}</Link>
        </nav>
        <div className="nav-actions">
          <div className="lang-switcher">
            {languages.map((l) => (
              <button
                key={l.code}
                className={`lang-btn ${language === l.code ? "active" : ""}`}
                onClick={() => setLanguage(l.code)}
                title={l.code.toUpperCase()}
              >
                {l.flag}
              </button>
            ))}
          </div>
          <ThemeToggle />
          {email ? (
            <>
              <Link className="btn ghost" href="/account">
                {email}
              </Link>
              <button className="btn" onClick={logout} type="button">
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <Link className="btn ghost" href="/login">
                {t("nav.login")}
              </Link>
              <Link className="btn primary" href="/register">
                {t("nav.register")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
