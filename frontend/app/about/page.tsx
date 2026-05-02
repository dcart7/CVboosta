"use client";

import { useTranslation } from "../lib/LanguageContext";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <main className="page">
      <div className="shell">
        <section className="hero fade-up">
          <div>
            <p className="pill">{t("about.pill")}</p>
            <h1 className="hero-title">{t("about.title")}</h1>
            <p className="hero-subtitle">{t("about.subtitle")}</p>
          </div>

          <div className="hero-card">
            <h2 className="section-title">{t("about.whatWeFocus")}</h2>
            <div className="grid">
              <div className="card">
                <h3>{t("about.clarity")}</h3>
                <p>{t("about.clarityDesc")}</p>
              </div>
              <div className="card">
                <h3>{t("about.relevance")}</h3>
                <p>{t("about.relevanceDesc")}</p>
              </div>
              <div className="card">
                <h3>{t("about.control")}</h3>
                <p>{t("about.controlDesc")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section fade-up">
          <h2 className="section-title">{t("about.principles")}</h2>
          <div className="grid">
            <div className="hero-card">
              <p className="quote">{t("about.principle1Quote")}</p>
              <p className="quote-sub">{t("about.principle1Desc")}</p>
            </div>
            <div className="hero-card">
              <p className="quote">{t("about.principle2Quote")}</p>
              <p className="quote-sub">{t("about.principle2Desc")}</p>
            </div>
            <div className="hero-card">
              <p className="quote">{t("about.principle3Quote")}</p>
              <p className="quote-sub">{t("about.principle3Desc")}</p>
            </div>
            <div className="hero-card">
              <p className="quote">{t("about.principle4Quote")}</p>
              <p className="quote-sub">{t("about.principle4Desc")}</p>
            </div>
          </div>
        </section>

        <section className="section fade-up">
          <div className="card">
            <p>{t("about.createdBy")}</p>
          </div>
        </section>

        <section className="section fade-up">
          <h2 className="section-title">{t("about.howItWorks")}</h2>
          <div className="grid">
            <div className="card">
              <h3>{t("about.parse")}</h3>
              <p>{t("about.parseDesc")}</p>
            </div>
            <div className="card">
              <h3>{t("about.match")}</h3>
              <p>{t("about.matchDesc")}</p>
            </div>
            <div className="card">
              <h3>{t("about.rewrite")}</h3>
              <p>{t("about.rewriteDesc")}</p>
            </div>
          </div>
        </section>

        <section className="section fade-up">
          <h2 className="section-title">{t("about.privacy")}</h2>
          <div className="card">
            <p>{t("about.privacyDesc")}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
