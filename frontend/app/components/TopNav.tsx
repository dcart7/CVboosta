"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getApiBase } from "../lib/apiBase";
import { fetchWithRetry } from "../lib/fetchRetry";
import ThemeToggle from "./ThemeToggle";
import { useTranslation } from "../lib/LanguageContext";
import { Language } from "../lib/translations";

export default function TopNav() {
  const [email, setEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const apiBase = getApiBase();
  const { t, language, setLanguage } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState({ transform: "translateX(0px)" });

  const languages: { code: Language; flag: string }[] = [
    { code: "en", flag: "🇺🇸" },
    { code: "uk", flag: "🇺🇦" },
    { code: "pl", flag: "🇵🇱" },
    { code: "sk", flag: "🇸🇰" },
    { code: "es", flag: "🇪🇸" },
  ];

  const activeIndex = languages.findIndex((l) => l.code === language);

  // Slide the pill to the active button
  useEffect(() => {
    if (!trackRef.current) return;
    const buttons = trackRef.current.querySelectorAll<HTMLButtonElement>(".lang-btn");
    const btn = buttons[activeIndex >= 0 ? activeIndex : 0];
    if (!btn) return;
    const trackRect = trackRef.current.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const offset = btnRect.left - trackRect.left;
    setPillStyle({ transform: `translateX(${offset}px)` });
  }, [activeIndex]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setEmail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchWithRetry(
          `${apiBase}/auth/me`,
          { headers: { Authorization: `Bearer ${token}` } },
          { attempts: 5, baseDelayMs: 400, timeoutMs: 20_000 },
        );
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setEmail(data?.email ?? null);
          setUserName(data?.full_name ?? null);
        } else {
          setEmail(null);
          setUserName(null);
        }
      } catch {
        if (!cancelled) setEmail(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  const logout = () => {
    // Clear only CV-related data, keep theme and language
    const keysToKeep = ["theme", "app_lang"];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach((key) => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    setEmail(null);
    setUserName(null);
    window.dispatchEvent(new Event("auth-change"));
    // Redirect to home or refresh to clear state
    window.location.href = "/";
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link className="brand" href="/">
          <img src="/logo.png" alt="Logo" width={40} height={40} className="brand-logo" />
          <span>CVboosta</span>
        </Link>

        {/* Desktop Links */}
        <nav className="nav-links desktop-only">
          <Link href="/app">{t("nav.dashboard")}</Link>
          <Link href="/results">{t("nav.results")}</Link>
          <Link href="/history">{t("nav.history")}</Link>
          <Link href="/pricing">{t("nav.pricing")}</Link>
          <Link href="/about">{t("nav.about")}</Link>
        </nav>

        <div className="nav-actions">
          <div className="lang-switcher desktop-only">
            <div className="lang-slider-track" ref={trackRef}>
              <span className="lang-slider-pill" style={pillStyle} aria-hidden="true" />
              {languages.map((l) => (
                <button
                  key={l.code}
                  className={`lang-btn${language === l.code ? " active" : ""}`}
                  onClick={() => setLanguage(l.code)}
                  title={l.code.toUpperCase()}
                  type="button"
                >
                  {l.flag}
                </button>
              ))}
            </div>
          </div>
          <ThemeToggle />
          {email ? (
            <>
              <Link className="btn ghost" href="/account" title={userName || email || ""}>
                <span className="desktop-only">{userName || email}</span>
                <span className="mobile-only">{userName ? userName.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : "U")}</span>
              </Link>
              <button className="btn primary desktop-only" onClick={logout} type="button">
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

          {/* Mobile Menu Toggle */}
          <button 
            className="btn ghost mobile-only" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ padding: "8px 12px" }}
          >
             {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" style={{
          position: "fixed",
          top: "76px",
          left: 0,
          right: 0,
          bottom: 0,
          background: "var(--paper)",
          zIndex: 100,
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>
          <Link href="/app" onClick={() => setIsMenuOpen(false)} style={{ fontSize: "1.2rem", fontWeight: "600" }}>{t("nav.dashboard")}</Link>
          <Link href="/results" onClick={() => setIsMenuOpen(false)} style={{ fontSize: "1.2rem", fontWeight: "600" }}>{t("nav.results")}</Link>
          <Link href="/history" onClick={() => setIsMenuOpen(false)} style={{ fontSize: "1.2rem", fontWeight: "600" }}>{t("nav.history")}</Link>
          <Link href="/pricing" onClick={() => setIsMenuOpen(false)} style={{ fontSize: "1.2rem", fontWeight: "600" }}>{t("nav.pricing")}</Link>
          <Link href="/about" onClick={() => setIsMenuOpen(false)} style={{ fontSize: "1.2rem", fontWeight: "600" }}>{t("nav.about")}</Link>
          <hr style={{ border: "none", borderTop: "1px solid var(--line)", width: "100%" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
             <span>Language</span>
             <div className="lang-switcher">
                <div className="lang-slider-track">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      className={`lang-btn${language === l.code ? " active" : ""}`}
                      onClick={() => { setLanguage(l.code); setIsMenuOpen(false); }}
                      type="button"
                    >
                      {l.flag}
                    </button>
                  ))}
                </div>
             </div>
          </div>
          {email ? (
             <button className="btn primary" onClick={logout} style={{ marginTop: "auto" }}>
                {t("nav.logout")}
             </button>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "auto" }}>
               <Link className="btn primary" href="/register" onClick={() => setIsMenuOpen(false)}>
                  {t("nav.register")}
               </Link>
               <Link className="btn ghost" href="/login" onClick={() => setIsMenuOpen(false)}>
                  {t("nav.login")}
               </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
