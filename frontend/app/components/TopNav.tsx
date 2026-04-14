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
              <Link className="btn ghost cv-user-pill cv-hide-on-mobile" href="/account" title={userName || email || ""}>
                <span className="cv-desktop-only">{userName || email}</span>
                <span className="cv-mobile-only">{userName ? userName.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : "U")}</span>
              </Link>
              <button className="btn primary cv-desktop-only" onClick={logout} type="button">
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <Link className="btn ghost cv-desktop-only" href="/login">
                {t("nav.login")}
              </Link>
              <Link className="btn primary cv-desktop-only" href="/register">
                {t("nav.register")}
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="btn ghost cv-mobile-only" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{ padding: "8px 12px", fontSize: "20px" }}
          >
             {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay — Glass Shutter */}
      {isMenuOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(248, 248, 250, 0.55)",
          backdropFilter: "blur(36px) saturate(200%)",
          WebkitBackdropFilter: "blur(36px) saturate(200%)",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          borderBottom: "1px solid rgba(255,255,255,0.4)",
          animation: "slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}>
          <div style={{
            padding: "88px 28px 40px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            height: "100%",
            overflowY: "auto",
          }}>
            {/* Navigation links */}
            <nav style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {[
                { href: "/app", label: t("nav.dashboard") },
                { href: "/results", label: t("nav.results") },
                { href: "/history", label: t("nav.history") },
                { href: "/pricing", label: t("nav.pricing") },
                { href: "/about", label: t("nav.about") },
              ].map(({ href, label }) => (
                <Link key={href} href={href} onClick={() => setIsMenuOpen(false)} style={{
                  display: "block",
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: "var(--ink)",
                  padding: "14px 0",
                  borderBottom: "1px solid var(--line)",
                  letterSpacing: "-0.02em",
                  textDecoration: "none",
                }}>
                  {label}
                </Link>
              ))}
            </nav>

            {/* Language switcher */}
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)" }}>Language</span>
              <div className="lang-slider-track" ref={undefined} style={{ position: "relative" }}>
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

            {/* Auth actions pushed to bottom */}
            <div style={{
              marginTop: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              paddingBottom: "40px",
              paddingTop: "24px",
            }}>
              {email ? (
                <button className="btn primary" onClick={logout} style={{ width: "100%", justifyContent: "center", padding: "16px", fontSize: "16px", borderRadius: "14px" }}>
                  {t("nav.logout")}
                </button>
              ) : (
                <>
                  <Link className="btn primary" href="/register" onClick={() => setIsMenuOpen(false)} style={{ width: "100%", justifyContent: "center", padding: "16px", fontSize: "16px", borderRadius: "14px", textAlign: "center" }}>
                    {t("nav.register")}
                  </Link>
                  <Link className="btn ghost" href="/login" onClick={() => setIsMenuOpen(false)} style={{ width: "100%", justifyContent: "center", padding: "16px", fontSize: "16px", borderRadius: "14px", textAlign: "center" }}>
                    {t("nav.login")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
