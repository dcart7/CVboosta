"use client";

import Link from "next/link";
import TopNav from "../components/TopNav";
import { useTranslation } from "../lib/LanguageContext";

type CaseStudy = {
  role: string;
  before: { ats: string; outcome: string };
  after: { ats: string; outcome: string };
  changes: string[];
  insight: string;
};

function percentToInt(value: string) {
  const n = parseInt(value.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function StatLine({
  label,
  from,
  to,
}: {
  label: string;
  from: string;
  to: string;
}) {
  const fromInt = percentToInt(from);
  const toInt = percentToInt(to);
  const delta = toInt > 0 && fromInt > 0 ? toInt - fromInt : null;
  return (
    <div className="cases-statline">
      <span className="cases-statlabel">{label}</span>
      <span className="cases-statvalue">
        <span className="cases-num cases-num-muted">{from}</span>
        <span className="cases-arrow" aria-hidden="true">
          →
        </span>
        <span className="cases-num cases-num-up">{to}</span>
        {delta !== null ? (
          <span className="cases-delta" aria-label={`Improved by ${delta} points`}>
            +{delta}
          </span>
        ) : null}
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
      <TopNav />
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
          <p className="cases-section-subtitle">{t("cases.sections.casesSubtitle")}</p>
          <div className="cases-grid">
            {cases.map((cs) => (
              <article key={cs.role} className="card case-card">
                <div className="case-head">
                  <div className="case-badge">{t("cases.labels.caseBadge")}</div>
                  <h3 className="case-role">{cs.role}</h3>
                </div>

                <div className="case-beforeafter">
                  <div className="case-pane case-pane-before">
                    <div className="case-pane-title">{t("cases.labels.before")}</div>
                    <StatLine
                      label={t("cases.labels.atsMatch")}
                      from={cs.before.ats}
                      to={cs.after.ats}
                    />
                  </div>

                  <div className="case-pane case-pane-after">
                    <div className="case-pane-title">{t("cases.labels.after")}</div>
                    <div className="cases-statline">
                      <span className="cases-statlabel">{t("cases.labels.atsMatch")}</span>
                      <span className="cases-statvalue">
                        <span className="cases-num cases-num-up">{cs.after.ats}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="case-mini">
                  <div className="case-mini-changes">
                    <div className="case-subhead">{t("cases.labels.whatChanged")}</div>
                    <ul className="case-list">
                      {cs.changes.slice(0, 2).map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="case-mini-result">
                    <div className="case-subhead">{t("cases.labels.result")}</div>
                    <p className="case-result-text">{cs.after.outcome}</p>
                  </div>
                  <div className="case-mini-insight">
                    <div className="case-subhead">{t("cases.labels.insight")}</div>
                    <p className="case-insight-text">{cs.insight}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="cases-cta-card hero-card fade-up">
            <h3 className="cases-cta-title">{t("cases.sections.ctaTitle")}</h3>
            <p className="cases-cta-sub">{t("cases.sections.ctaSub")}</p>
            <div className="nav-actions" style={{ marginTop: 16 }}>
              <Link className="btn primary" href="/app">
                {t("cases.sections.ctaButton")}
              </Link>
            </div>
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
