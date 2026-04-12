"use client";

import TopNav from "../components/TopNav";
import { useTranslation } from "../lib/LanguageContext";

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="legal-section fade-up" style={{ padding: "80px 0" }}>
          <h1 className="hero-title" style={{ fontSize: "48px", marginBottom: "24px" }}>
            {t("legal.termsTitle")}
          </h1>
          <p className="hero-subtitle" style={{ maxWidth: "800px", marginBottom: "48px" }}>
            {t("legal.termsIntro")}
          </p>

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
        </section>
      </div>
      <style jsx>{`
        .legal-content {
          display: grid;
          gap: 40px;
          max-width: 800px;
        }
        .legal-block h3 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 12px;
          color: var(--primary);
        }
        .legal-block p {
          font-size: 16px;
          line-height: 1.7;
          color: var(--ink);
          opacity: 0.9;
        }
      `}</style>
    </main>
  );
}
