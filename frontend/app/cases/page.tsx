"use client";

import Link from "next/link";
import { useTranslation } from "../lib/LanguageContext";

type CaseStudy = {
  role: string;
  before: { ats: string; outcome: string };
  after: { ats: string; outcome: string };
  changes: string[];
  insight: string;
};

function StatLine({
  label,
  from,
  to,
}: {
  label: string;
  from: string;
  to: string;
}) {
  return (
    <div className="cases-statline">
      <span className="cases-statlabel">{label}</span>
      <span className="cases-statvalue">
        <span className="cases-num">{from}</span>
        <span className="cases-arrow">→</span>
        <span className="cases-num">{to}</span>
      </span>
    </div>
  );
}

export default function CasesPage() {
  const { t } = useTranslation();

  const cases: CaseStudy[] = [
    {
      role: t("cases.caseStudies.backend.role"),
      before: { ats: "48%", outcome: t("cases.caseStudies.backend.beforeOutcome") },
      after: { ats: "91%", outcome: t("cases.caseStudies.backend.afterOutcome") },
      changes: [
        t("cases.caseStudies.backend.change1"),
        t("cases.caseStudies.backend.change2"),
        t("cases.caseStudies.backend.change3"),
      ],
      insight: t("cases.caseStudies.backend.insight"),
    },
    {
      role: t("cases.caseStudies.analyst.role"),
      before: { ats: "52%", outcome: t("cases.caseStudies.analyst.beforeOutcome") },
      after: { ats: "88%", outcome: t("cases.caseStudies.analyst.afterOutcome") },
      changes: [
        t("cases.caseStudies.analyst.change1"),
        t("cases.caseStudies.analyst.change2"),
        t("cases.caseStudies.analyst.change3"),
      ],
      insight: t("cases.caseStudies.analyst.insight"),
    },
    {
      role: t("cases.caseStudies.marketing.role"),
      before: { ats: "45%", outcome: t("cases.caseStudies.marketing.beforeOutcome") },
      after: { ats: "84%", outcome: t("cases.caseStudies.marketing.afterOutcome") },
      changes: [
        t("cases.caseStudies.marketing.change1"),
        t("cases.caseStudies.marketing.change2"),
        t("cases.caseStudies.marketing.change3"),
      ],
      insight: t("cases.caseStudies.marketing.insight"),
    },
  ];

  return (
    <main className="page cases-page">
      <div className="shell">
        <section className="hero cases-hero fade-up">
          <div className="cases-hero-copy">
            <h1 className="hero-title cases-hero-title">{t("cases.hero.title")}</h1>
            <p className="hero-subtitle cases-hero-subtitle">
              {t("cases.hero.subtitle")}
            </p>
            <p className="cases-micro">{t("cases.hero.micro")}</p>
            <div className="nav-actions" style={{ marginTop: 18 }}>
              <a className="btn primary" href="#cases">
                {t("cases.hero.ctaSeeMissing")}
              </a>
              <Link className="btn ghost" href="/app">
                {t("cases.hero.ctaAnalyze")}
              </Link>
            </div>
          </div>

          <div className="hero-card cases-trust-card">
            <div className="cases-trust-strip">
              <div className="cases-trust-item">
                <div className="cases-trust-kpi">100+</div>
                <div className="cases-trust-label">{t("cases.trust.testedOn")}</div>
              </div>
              <div className="cases-trust-item">
                <div className="cases-trust-kpi">91%</div>
                <div className="cases-trust-label">{t("cases.trust.atsMatch")}</div>
              </div>
              <div className="cases-trust-item">
                <div className="cases-trust-kpi">{t("cases.trust.daysKpi")}</div>
                <div className="cases-trust-label">{t("cases.trust.toInterviews")}</div>
              </div>
            </div>
            <p className="cases-trust-note">
              {t("cases.trust.note")}
            </p>
          </div>
        </section>

        <section id="cases" className="section fade-up">
          <h2 className="section-title">{t("cases.sections.casesTitle")}</h2>
          <div className="cases-grid">
            {cases.map((cs) => (
              <article key={cs.role} className="card case-card">
                <div className="case-head">
                  <div className="case-badge">{t("cases.labels.caseBadge")}</div>
                  <h3 className="case-role">{cs.role}</h3>
                </div>

                <div className="case-beforeafter">
                  <div className="case-pane">
                    <div className="case-pane-title">{t("cases.labels.before")}</div>
                    <StatLine
                      label={t("cases.labels.atsMatch")}
                      from={cs.before.ats}
                      to={cs.after.ats}
                    />
                    <div className="cases-statline">
                      <span className="cases-statlabel">{t("cases.labels.outcome")}</span>
                      <span className="cases-outcome">{cs.before.outcome}</span>
                    </div>
                  </div>

                  <div className="case-pane">
                    <div className="case-pane-title">{t("cases.labels.after")}</div>
                    <div className="cases-statline">
                      <span className="cases-statlabel">{t("cases.labels.atsMatch")}</span>
                      <span className="cases-statvalue">
                        <span className="cases-num">{cs.after.ats}</span>
                      </span>
                    </div>
                    <div className="cases-statline">
                      <span className="cases-statlabel">{t("cases.labels.outcome")}</span>
                      <span className="cases-outcome">{cs.after.outcome}</span>
                    </div>
                  </div>
                </div>

                <div className="case-divider" aria-hidden="true" />

                <div className="case-changes">
                  <div className="case-subhead">{t("cases.labels.whatChanged")}</div>
                  <ul className="case-list">
                    {cs.changes.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>

                <div className="case-insight">
                  <div className="case-subhead">{t("cases.labels.insight")}</div>
                  <p className="case-insight-text">{cs.insight}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section fade-up">
          <div className="hero-card cases-truth">
            <h2 className="cases-truth-title">{t("cases.sections.coreTruthTitle")}</h2>
            <p className="cases-truth-text">
              {t("cases.sections.coreTruthText")}
            </p>
          </div>
        </section>

        <section className="section fade-up">
          <h2 className="section-title">{t("cases.sections.whatActuallyChangesTitle")}</h2>
          <div className="grid">
            <div className="card cases-bullets">
              <h3 className="cases-bullets-title">
                {t("cases.sections.whatSeparatesTitle")}
              </h3>
              <ul className="case-list cases-list-compact">
                <li>{t("cases.bullets.b1")}</li>
                <li>{t("cases.bullets.b2")}</li>
                <li>{t("cases.bullets.b3")}</li>
                <li>{t("cases.bullets.b4")}</li>
              </ul>
            </div>
            <div className="card cases-testimonials">
              <h3 className="cases-bullets-title">{t("cases.sections.testimonialsTitle")}</h3>
              <div className="cases-quote">{t("cases.testimonials.q1")}</div>
              <div className="cases-quote">{t("cases.testimonials.q2")}</div>
              <div className="cases-quote">{t("cases.testimonials.q3")}</div>
            </div>
          </div>
        </section>

        <section className="section fade-up">
          <div className="hero-card cases-final">
            <h2 className="cases-final-title">{t("cases.sections.finalTitle")}</h2>
            <p className="cases-final-sub">
              {t("cases.sections.finalSub")}
            </p>
            <div className="nav-actions" style={{ marginTop: 18 }}>
              <Link className="btn primary" href="/app">
                {t("cases.hero.ctaAnalyze")}
              </Link>
              <Link className="btn ghost" href="/pricing">
                {t("cases.sections.pricingLink")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
