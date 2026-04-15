"use client";

import TopNav from "../components/TopNav";
import { useTranslation } from "../lib/LanguageContext";

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <main className="page">
      <TopNav />
      <div className="shell legal-page-shell">
        <section className="legal-section fade-up" style={{ padding: "80px 0 56px" }}>
          <div className="legal-hero">
            <h1 className="hero-title" style={{ fontSize: "48px", marginBottom: "20px" }}>
              {t("legal.termsTitle")}
            </h1>
            <p className="hero-subtitle" style={{ maxWidth: "860px", marginBottom: 0 }}>
              {t("legal.termsIntro")}
            </p>
          </div>

          <div className="legal-doc">
            <div className="legal-meta">
              <span className="legal-chip">Legal Document</span>
              <span className="legal-chip">Last updated: April 15, 2026</span>
            </div>

            <div className="legal-content">
              <div className="legal-block">
                <h3>{t("legal.termsUsageTitle")}</h3>
                <p>{t("legal.termsUsage")}</p>
              </div>
              <div className="legal-block">
                <h3>{t("legal.termsDisclaimerTitle")}</h3>
                <p>{t("legal.termsDisclaimer")}</p>
              </div>
              <div className="legal-block">
                <h3>{t("legal.termsLiabilityTitle")}</h3>
                <p>{t("legal.termsLiability")}</p>
              </div>
              <div className="legal-block">
                <h3>{t("legal.termsUserRespTitle")}</h3>
                <p>{t("legal.termsUserRespDesc")}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
