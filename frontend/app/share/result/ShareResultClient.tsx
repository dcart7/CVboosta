"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "../../lib/LanguageContext";

function parsePercent(raw: string | null): number | null {
  if (!raw) return null;
  const value = Number.parseInt(raw, 10);
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

  return (
    <main className="page">
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
        </section>

        <section className="section fade-up" style={{ marginTop: "8px" }}>
          <div className="nav-actions" style={{ justifyContent: "center" }}>
            <Link className="btn primary" href="/free-ats-resume-checker">
              {t("common.runAnalysis")}
            </Link>
            <Link className="btn ghost" href="/pricing">
              {t("nav.pricing")}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
