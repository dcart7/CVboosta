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
          <div style={{ maxWidth: "1200px", width: "100%" }}>
            <p className="pill">{t("home.pill")}</p>
            <h1 className="hero-title">{t("home.heroTitle")}</h1>
            <p className="hero-subtitle">{t("home.heroSubtitle")}</p>
            <HeroActions />
          </div>
        </section>

        <section className="fade-up" style={{ marginBottom: "4rem" }}>
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
        </section>

        <section className="section fade-up" style={{ marginBottom: "6rem" }}>
          <h2 className="section-title">{t("home.whatYouGet.title")}</h2>
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

        <section className="section fade-up" style={{ marginTop: "4rem" }}>
          <h2 className="section-title" style={{ textAlign: "center", marginBottom: "3rem" }}>
            {t("testimonials.title")}
          </h2>
          
          <div className="marquee-wrapper">
            <div className="marquee-track">
              {/* Render 12 items (6 reviews duplicated) for seamless infinite loop */}
              {[1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6].map((num, idx) => (
                <div key={`${num}-${idx}`} className="card testi-card shadow-soft">
                  <p style={{ fontStyle: "italic", opacity: 0.9, marginBottom: "2rem", fontSize: "1.1rem", lineHeight: "1.6" }}>
                    "{t(`testimonials.quote${num}`)}"
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent-light, #6366f1))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "white" }}>
                      {t(`testimonials.author${num}`)[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "14px" }}>{t(`testimonials.author${num}`)}</div>
                      <div style={{ fontSize: "12px", opacity: 0.6 }}>Verified User</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
