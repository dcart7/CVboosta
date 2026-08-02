"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import TopNav from "../../components/TopNav";
import { useTranslation } from "../../lib/LanguageContext";
import { ANALYTICS_EVENTS, trackEvent } from "../../lib/analytics";
import {
  CONSENT_UPDATED_EVENT,
  hasAnalyticsConsent,
  type ConsentPreferences,
} from "../../lib/consent";

function parsePercent(raw: string | null): number | null {
  if (!raw || !/^\d{1,3}$/.test(raw)) return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.min(100, value));
}

export default function ShareResultClient() {
  const { t, language } = useTranslation();
  const searchParams = useSearchParams();

  const before = useMemo(() => parsePercent(searchParams.get("before")), [searchParams]);
  const after = useMemo(() => parsePercent(searchParams.get("after")), [searchParams]);
  const lift = before !== null && after !== null ? after - before : null;
  const publicSummaryText =
    {
      en: "Public summary only. No personal CV data is shown on this page.",
      uk: "Лише публічне резюме результату. Персональні дані CV на цій сторінці не показуються.",
      pl: "Tylko publiczne podsumowanie wyniku. Dane osobowe z CV nie są wyświetlane na tej stronie.",
      sk: "Iba verejné zhrnutie výsledku. Osobné údaje z CV sa na tejto stránke nezobrazujú.",
      cs: "Pouze veřejné shrnutí výsledku. Osobní údaje z CV se na této stránce nezobrazují.",
      es: "Solo resumen público del resultado. No se muestran datos personales del CV en esta página.",
    }[language] || "Public summary only. No personal CV data is shown on this page.";
  const scoreLiftLabel =
    {
      en: "score lift",
      uk: "зростання бала",
      pl: "wzrost wyniku",
      sk: "nárast skóre",
      cs: "nárůst skóre",
      es: "mejora del puntaje",
    }[language] || "score lift";
  const verificationNotice =
    {
      en: "Scores were submitted by the person sharing this link and are not independently verified by CVboosta.",
      uk: "Бали вказані людиною, яка поділилася посиланням, і не перевірені CVboosta незалежно.",
      pl: "Wyniki podała osoba udostępniająca link i nie zostały niezależnie zweryfikowane przez CVboosta.",
      sk: "Skóre uviedla osoba, ktorá zdieľala odkaz, a CVboosta ho nezávisle neoverila.",
      cs: "Skóre uvedla osoba, která odkaz sdílela, a CVboosta je nezávisle neověřila.",
      es: "Las puntuaciones las proporcionó quien compartió el enlace y CVboosta no las verificó de forma independiente.",
    }[language] ||
    "Scores were submitted by the person sharing this link and are not independently verified by CVboosta.";

  useEffect(() => {
    let tracked = hasAnalyticsConsent();
    const emit = () => trackEvent(ANALYTICS_EVENTS.sharedResultViewed, {
      score_included: before !== null && after !== null,
    });
    emit();
    const onConsentUpdated = (event: Event) => {
      const preferences = (event as CustomEvent<ConsentPreferences>).detail;
      if (!preferences?.analytics) {
        tracked = false;
        return;
      }
      if (tracked) return;
      tracked = true;
      emit();
    };
    window.addEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, onConsentUpdated);
  }, [after, before]);

  return (
    <main className="page">
      <TopNav />
      <div className="shell" style={{ maxWidth: "920px" }}>
        <section className="hero-card fade-up" style={{ textAlign: "center" }}>
          <p className="pill">CVboosta</p>
          <h1 className="hero-title" style={{ marginBottom: "8px" }}>{t("results.shareYourResult")}</h1>
          <p className="hero-subtitle">{publicSummaryText}</p>
        </section>

        <section className="section fade-up" style={{ marginTop: "14px" }}>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <div className="kpi">
              <h3>{before !== null ? `${before}%` : "—"}</h3>
              <p>{t("results.fitBefore")}</p>
            </div>
            <div className="kpi">
              <h3>{after !== null ? `${after}%` : "—"}</h3>
              <p>{t("results.fitAfter")}</p>
            </div>
            <div className="kpi">
              <h3>
                {lift !== null
                  ? `${lift >= 0 ? "+" : ""}${lift}%`
                  : "—"}
              </h3>
              <p>{scoreLiftLabel}</p>
            </div>
          </div>
          {before !== null || after !== null ? (
            <p className="hero-subtitle" style={{ marginTop: "12px", textAlign: "center", fontSize: "0.9rem" }}>
              {verificationNotice}
            </p>
          ) : null}
        </section>

        <section className="section fade-up" style={{ marginTop: "8px" }}>
          <div className="nav-actions" style={{ justifyContent: "center" }}>
            <Link
              className="btn primary"
              href="/app"
              onClick={() => trackEvent(ANALYTICS_EVENTS.sharedResultCtaClicked, {
                cta_type: "start_cv_match",
              })}
            >
              {t("common.runAnalysis")}
            </Link>
            <Link
              className="btn ghost"
              href="/pricing"
              onClick={() => trackEvent(ANALYTICS_EVENTS.sharedResultCtaClicked, {
                cta_type: "view_pricing",
              })}
            >
              {t("nav.pricing")}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
