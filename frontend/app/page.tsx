"use client";

import TopNav from "./components/TopNav";
import HeroActions from "./components/HeroActions";
import { useTranslation } from "./lib/LanguageContext";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="hero fade-up">
          <div>
            <p className="pill">{t("home.pill")}</p>
            <h1 className="hero-title">{t("home.heroTitle")}</h1>
            <p className="hero-subtitle">{t("home.heroSubtitle")}</p>
            <HeroActions />
          </div>
          <div className="hero-card">
            <div className="hero-grid">
              <div className="kpi">
                <h3>92%</h3>
                <p>{t("home.stats.ats")}</p>
              </div>
              <div className="kpi">
                <h3>3 min</h3>
                <p>{t("home.stats.time")}</p>
              </div>
              <div className="kpi">
                <h3>5x</h3>
                <p>{t("home.stats.speed")}</p>
              </div>
            </div>
            <div className="section">
              <h3 className="section-title">{t("home.whatYouGet.title")}</h3>
              <div className="grid">
                <div className="card">
                  <h3>{t("home.whatYouGet.rewrite.title")}</h3>
                  <p>{t("home.whatYouGet.rewrite.desc")}</p>
                </div>
                <div className="card">
                  <h3>{t("home.whatYouGet.map.title")}</h3>
                  <p>{t("home.whatYouGet.map.desc")}</p>
                </div>
                <div className="card">
                  <h3>{t("home.whatYouGet.history.title")}</h3>
                  <p>{t("home.whatYouGet.history.desc")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section fade-up">
          <h2 className="section-title">{t("home.howItWorks.title")}</h2>
          <div className="steps">
            <div className="step">
              <span>1</span>
              <h3>{t("home.howItWorks.step1.title")}</h3>
              <p>{t("home.howItWorks.step1.desc")}</p>
            </div>
            <div className="step">
              <span>2</span>
              <h3>{t("home.howItWorks.step2.title")}</h3>
              <p>{t("home.howItWorks.step2.desc")}</p>
            </div>
            <div className="step">
              <span>3</span>
              <h3>{t("home.howItWorks.step3.title")}</h3>
              <p>{t("home.howItWorks.step3.desc")}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
