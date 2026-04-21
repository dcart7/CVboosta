"use client";

import Link from "next/link";
import { useMemo } from "react";
import TopNav from "../../components/TopNav";
import { useTranslation } from "../../lib/LanguageContext";
import type { ResumeKeywordCluster } from "../../lib/resumeKeywordClusters";
import {
  getResumeKeywordsUi,
  localizeResumeKeywordCluster,
} from "../../lib/resumeKeywordsI18n";

type Props = {
  cluster: ResumeKeywordCluster;
  longTailPhrases: string[];
};

export default function ResumeKeywordRoleClient({ cluster, longTailPhrases }: Props) {
  const { language } = useTranslation();
  const ui = getResumeKeywordsUi(language);
  const localized = useMemo(
    () => localizeResumeKeywordCluster(cluster, language),
    [cluster, language],
  );

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="hero fade-up blog-hero rk-hero">
          <div className="blog-hero-panel rk-hero-panel">
            <p className="pill">{ui.roleGuideKicker}</p>
            <h1 className="hero-title">{ui.pageTitle(localized.role)}</h1>
            <p className="hero-subtitle rk-hero-subtitle">{ui.pageDescription(localized.role)}</p>
            <div className="nav-actions rk-hero-actions">
              <Link className="btn primary" href="/free-ats-resume-checker">
                {ui.freeChecker}
              </Link>
              <Link className="btn ghost" href="/pricing">
                {ui.optimizeCv}
              </Link>
            </div>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{ui.topKeywordsTitle(localized.role)}</h2>
            <p className="rk-copy">{ui.topKeywordsText(localized.role)}</p>
            <div className="rk-chip-grid">
              {localized.keywords.map((item) => (
                <div key={item} className="rk-chip">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{ui.mistakesTitle(localized.role)}</h2>
            <p className="rk-copy">{ui.mistakesText(localized.role)}</p>
            <ol className="rk-mistakes-list">
              {localized.mistakes.map((mistake) => (
                <li key={mistake} className="rk-mistake-item">
                  {mistake}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{ui.examplesTitle(localized.role)}</h2>
            <p className="rk-copy">{ui.examplesText}</p>
            <div className="grid rk-example-grid">
              {localized.examples.map((example, index) => (
                <article key={`${localized.slug}-${index}`} className="card rk-example-card">
                  <p className="rk-example-line rk-before">
                    <strong>{ui.before}</strong>
                    {" "}
                    {example.before}
                  </p>
                  <p className="rk-example-line rk-after">
                    <strong>{ui.after}</strong>
                    {" "}
                    {example.after}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{ui.fifteenMinTitle(localized.role)}</h2>
            <p className="rk-copy">{ui.fifteenMinText}</p>
            <p className="rk-copy rk-muted">
              {ui.longTailText}: {longTailPhrases.join(", ")}.
            </p>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">{ui.faqTitle}</h2>
            <div className="rk-faq-list">
              {localized.faq.map((item) => (
                <details key={item.question} className="rk-faq-item">
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel rk-cta-panel">
            <h2 className="section-title">{ui.nextStepTitle}</h2>
            <p className="rk-copy">{ui.nextStepText}</p>
            <div className="nav-actions rk-hero-actions">
              <Link className="btn primary" href="/free-ats-resume-checker">
                {ui.freeChecker}
              </Link>
              <Link className="btn ghost" href="/optimize">
                {ui.optimizeCv}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
