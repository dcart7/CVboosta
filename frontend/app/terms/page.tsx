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
                <h3>Data and File Handling</h3>
                <p>
                  CVboosta does not persistently store user-uploaded CV files or job-description files. Files are processed
                  only for generating optimization outputs and are removed from transient processing context after
                  completion.
                </p>
              </div>
              <div className="legal-block">
                <h3>Merchant of Record and Billing</h3>
                <p>
                  Paddle is the Merchant of Record for purchases made through this service. Paddle manages checkout, tax,
                  and payment processing operations. Any billing dispute or refund request is handled under Paddle-enabled
                  billing policies shown at checkout and in your invoice records.
                </p>
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
