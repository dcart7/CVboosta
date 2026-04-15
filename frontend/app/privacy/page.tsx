"use client";

import TopNav from "../components/TopNav";
import { useTranslation } from "../lib/LanguageContext";

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <main className="page">
      <TopNav />
      <div className="shell legal-page-shell">
        <section className="legal-section fade-up" style={{ padding: "80px 0 56px" }}>
          <div className="legal-hero">
            <h1 className="hero-title" style={{ fontSize: "48px", marginBottom: "20px" }}>
              {t("legal.privacyTitle")}
            </h1>
            <p className="hero-subtitle" style={{ maxWidth: "860px", marginBottom: 0 }}>
              {t("legal.privacyIntro")}
            </p>
          </div>

          <div className="legal-doc">
            <div className="legal-meta">
              <span className="legal-chip">Legal Document</span>
              <span className="legal-chip">Last updated: April 15, 2026</span>
            </div>

            <div className="legal-content">
              <div className="legal-block">
                <h3>{t("legal.privacyDataTitle")}</h3>
                <p>{t("legal.privacyData")}</p>
              </div>
              <div className="legal-block">
                <h3>No Storage of Personal Files or Document Content</h3>
                <p>
                  CVboosta does not store uploaded CV files, CV document content, or job-description files in a persistent
                  file storage system. Documents are processed in transient runtime memory for analysis and output
                  generation, then discarded.
                </p>
              </div>
              <div className="legal-block">
                <h3>{t("legal.privacyRetentionTitle")}</h3>
                <p>{t("legal.privacyRetention")}</p>
              </div>
              <div className="legal-block">
                <h3>{t("legal.privacyAiTitle")}</h3>
                <p>{t("legal.privacyAiDesc")}</p>
              </div>
              <div className="legal-block">
                <h3>Billing and Payment Data</h3>
                <p>
                  Payments and subscription billing are provided by Paddle, which acts as Merchant of Record.
                  CVboosta does not collect or store full card numbers, CVV/CVC, or other raw payment instrument details.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
