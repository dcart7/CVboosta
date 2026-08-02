"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getApiBase } from "../lib/apiBase";
import { fetchWithRetry } from "../lib/fetchRetry";
import ThemeToggle from "./ThemeToggle";
import { useTranslation } from "../lib/LanguageContext";
import { Language } from "../lib/translations";
import {
  clearSensitiveFunnelData,
  createIdempotencyKey,
} from "../lib/funnelIntent";
import { clearAllWorkspaceBrowserData } from "../lib/workspaceStorage";

export default function TopNav() {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const isHiddenRef = useRef(false);
  const isScrolledRef = useRef(false);
  const apiBase = getApiBase();
  const { t, language, setLanguage } = useTranslation();
  const trackRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState({ transform: "translateX(0px)" });
  const desktopNavStyle =
    language === "uk"
      ? { display: "flex", gap: "14px", fontSize: "13px" }
      : { display: "flex", gap: "20px", fontSize: "14px" };

  const languages: { code: Language; flag: string }[] = [
    { code: "en", flag: "🇺🇸" },
    { code: "uk", flag: "🇺🇦" },
    { code: "pl", flag: "🇵🇱" },
    { code: "sk", flag: "🇸🇰" },
    { code: "cs", flag: "🇨🇿" },
    { code: "es", flag: "🇪🇸" },
  ];

  const activeIndex = languages.findIndex((l) => l.code === language);

  useEffect(() => {
    isHiddenRef.current = isHidden;
  }, [isHidden]);

  useEffect(() => {
    isScrolledRef.current = isScrolled;
  }, [isScrolled]);

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
    if (isMenuOpen) {
      isHiddenRef.current = false;
      setIsHidden(false);
      return;
    }
    let raf = 0;
    let lastY = window.scrollY || 0;
    let accDown = 0;
    let accUp = 0;

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY || 0;
        const dy = y - lastY;
        lastY = y;

        const nowScrolled = y > 6;
        if (nowScrolled !== isScrolledRef.current) {
          isScrolledRef.current = nowScrolled;
          setIsScrolled(nowScrolled);
        }

        if (dy > 0) {
          accDown += dy;
          accUp = 0;
        } else if (dy < 0) {
          accUp += -dy;
          accDown = 0;
        } else {
          return;
        }

        // Hysteresis to prevent flicker during tiny scrolls.
        const hideAfterY = 140;
        const hideThreshold = 18;
        const showThreshold = 4;
        const showOnUpDy = -2;

        if (y <= 0) {
          accDown = 0;
          accUp = 0;
          if (isHiddenRef.current) {
            isHiddenRef.current = false;
            setIsHidden(false);
          }
          return;
        }

        // Show immediately on slight upward scroll (feels instant on mobile).
        if (dy <= showOnUpDy) {
          accUp = 0;
          if (isHiddenRef.current) {
            isHiddenRef.current = false;
            setIsHidden(false);
          }
          return;
        }

        // If we're still near the top, keep it visible (prevents "vanish & never return" feel).
        if (y < hideAfterY && isHiddenRef.current) {
          isHiddenRef.current = false;
          setIsHidden(false);
          return;
        }

        if (y > hideAfterY && accDown >= hideThreshold) {
          if (!isHiddenRef.current) {
            isHiddenRef.current = true;
            setIsHidden(true);
          }
        }
        if (accUp >= showThreshold) {
          if (isHiddenRef.current) {
            isHiddenRef.current = false;
            setIsHidden(false);
          }
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMenuOpen]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchWithRetry(
          `${apiBase}/auth/me`,
          undefined,
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

  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  const logout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    setLogoutError("");
    try {
      const response = await fetchWithRetry(
        `${apiBase}/auth/logout`,
        {
          method: "POST",
          headers: { "Idempotency-Key": createIdempotencyKey("logout") },
        },
        { attempts: 3, baseDelayMs: 250, timeoutMs: 10_000 },
      );
      if (!response.ok) throw new Error("logout_failed");
    } catch {
      setLogoutError(
        "We could not end your server session. Check your connection and try logout again.",
      );
      setLogoutLoading(false);
      return;
    }

    clearSensitiveFunnelData();
    clearAllWorkspaceBrowserData();

    setEmail(null);
    setUserName(null);
    window.dispatchEvent(new Event("auth-change"));
    // Redirect to home or refresh to clear state
    window.location.href = "/";
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <header className={`nav${isHidden ? " nav-hidden" : ""}${isScrolled ? " nav-scrolled" : ""}`}>
        <div className="nav-inner">
          <Link className="brand" href="/">
            <Image
              src="/logo.png"
              alt="CVboosta logo"
              width={40}
              height={40}
              className="brand-logo"
              priority
              sizes="40px"
            />
            <span className="brand-text">CVboosta</span>
          </Link>

        {/* Desktop Links */}
        <nav className="nav-links cv-desktop-only" style={desktopNavStyle}>
          <Link className={`nav-link${isActive("/app") ? " is-active" : ""}`} href="/app">
            {t("nav.dashboard")}
          </Link>
          <Link className={`nav-link${isActive("/results") ? " is-active" : ""}`} href="/results">
            {t("nav.results")}
          </Link>
          <Link className={`nav-link${isActive("/history") ? " is-active" : ""}`} href="/history">
            {t("nav.history")}
          </Link>
          <Link className={`nav-link${isActive("/pricing") ? " is-active" : ""}`} href="/pricing">
            {t("nav.pricing")}
          </Link>
          <Link className={`nav-link${isActive("/about") ? " is-active" : ""}`} href="/about">
            {t("nav.about")}
          </Link>
          <Link className={`nav-link${isActive("/blog") ? " is-active" : ""}`} href="/blog">
            {t("nav.blog")}
          </Link>
        </nav>

        <div className="nav-actions">
          <div className="lang-switcher cv-desktop-only" style={{ display: "flex" }}>
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
              <Link className="btn ghost cv-user-pill" href="/account" title={userName || email || ""}>
                <span className="cv-desktop-only">{userName || email}</span>
                <span className="cv-mobile-only">{userName ? userName.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : "U")}</span>
              </Link>
              <button className="btn primary cv-desktop-only" style={{ display: "inline-flex" }} onClick={logout} type="button" disabled={logoutLoading}>
                {logoutLoading ? "…" : t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <Link className="btn ghost cv-desktop-only" style={{ display: "inline-flex" }} href="/login">
                {t("nav.login")}
              </Link>
              <Link className="btn primary cv-desktop-only" style={{ display: "inline-flex" }} href="/register">
                {t("nav.register")}
              </Link>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="btn ghost cv-mobile-only nav-menu-btn" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
             {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
      </header>
      <div className="nav-spacer" aria-hidden="true" />
      {logoutError ? (
        <div className="toast is-error" role="alert" aria-live="assertive">
          {logoutError}
        </div>
      ) : null}

      {/* Mobile Menu Overlay — Glass Shutter */}
      {isMenuOpen && (
        <div className="mobile-shutter">
          <div className="mobile-shutter-content">
            <div className="mobile-shutter-scroll">
              <div className="mobile-shutter-auth-inline">
                {email ? (
                  <button
                    className="btn primary"
                    type="button"
                    onClick={async () => {
                      setIsMenuOpen(false);
                      await logout();
                    }}
                    disabled={logoutLoading}
                    style={{ width: "100%", justifyContent: "center", padding: "16px", fontSize: "16px", borderRadius: "14px" }}
                  >
                    {logoutLoading ? "…" : t("nav.logout")}
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
              {/* Navigation links */}
              <nav style={{ display: "flex", flexDirection: "column" }}>
                <Link href="/app" className={`mobile-shutter-link${isActive("/app") ? " is-active" : ""}`} onClick={() => setIsMenuOpen(false)}>{t("nav.dashboard")}</Link>
                <Link href="/results" className={`mobile-shutter-link${isActive("/results") ? " is-active" : ""}`} onClick={() => setIsMenuOpen(false)}>{t("nav.results")}</Link>
                <Link href="/history" className={`mobile-shutter-link${isActive("/history") ? " is-active" : ""}`} onClick={() => setIsMenuOpen(false)}>{t("nav.history")}</Link>
                <Link href="/pricing" className={`mobile-shutter-link${isActive("/pricing") ? " is-active" : ""}`} onClick={() => setIsMenuOpen(false)}>{t("nav.pricing")}</Link>
                <Link href="/about" className={`mobile-shutter-link${isActive("/about") ? " is-active" : ""}`} onClick={() => setIsMenuOpen(false)}>{t("nav.about")}</Link>
                <Link href="/blog" className={`mobile-shutter-link${isActive("/blog") ? " is-active" : ""}`} onClick={() => setIsMenuOpen(false)}>{t("nav.blog")}</Link>
              </nav>

              {/* Language switcher */}
              <div style={{ marginTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--muted)" }}>Language</span>
                <div className="lang-switcher">
                  <div className="lang-slider-track" style={{ position: "relative" }}>
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
            </div>
          </div>
        </div>
      )}
    </>
  );
}
