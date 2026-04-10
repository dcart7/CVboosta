"use client";

import TopNav from "../components/TopNav";
import { useTranslation } from "../lib/LanguageContext";

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <main className="page">
      <TopNav />
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
              <p className="quote">
                &ldquo;Careers belong to those who measure outcomes.&rdquo;
              </p>
              <p className="quote-sub">
                Great work is not enough if impact is invisible.
              </p>
            </div>
            <div className="hero-card">
              <p className="quote">&ldquo;HR doesn&apos;t read between the lines.&rdquo;</p>
              <p className="quote-sub">
                If you don&apos;t say it clearly, it doesn&apos;t count.
              </p>
            </div>
            <div className="hero-card">
              <p className="quote">
                &ldquo;Careers aren&apos;t made by the best, but by the clear.&rdquo;
              </p>
              <p className="quote-sub">
                Make the signal obvious: skills, scope, results.
              </p>
            </div>
            <div className="hero-card">
              <p className="quote">&ldquo;You&apos;re a fit — it just doesn&apos;t show.&rdquo;</p>
              <p className="quote-sub">
                The goal is not to exaggerate. The goal is to be seen.
              </p>
            </div>
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
