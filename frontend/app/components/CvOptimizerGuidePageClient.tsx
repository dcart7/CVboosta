"use client";

import Link from "next/link";
import TopNav from "./TopNav";
import MarkdownLite from "./MarkdownLite";
import type { CvOptimizerGuideButton, CvOptimizerGuidePage } from "../lib/cvOptimizerCluster";

type Props = {
  page: CvOptimizerGuidePage;
  relatedGuides: Array<{ slug: string; h1: string }>;
};

function renderButtons(buttons: CvOptimizerGuideButton[]) {
  return (
    <div className="nav-actions" style={{ marginTop: "12px" }}>
      {buttons.map((button) => (
        <Link key={`${button.href}-${button.label}`} className={`btn ${button.style}`} href={button.href}>
          {button.label}
        </Link>
      ))}
    </div>
  );
}

export default function CvOptimizerGuidePageClient({ page, relatedGuides }: Props) {
  const sectionPairs = [
    page.sections.slice(0, 1),
    page.sections.slice(1, 3),
    page.sections.slice(3, 4),
    page.sections.slice(4, 6),
  ];

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <article className="section fade-up blog-post-wrap">
          <div className="blog-post-head card">
            <Link className="btn ghost" href="/cv-optimizer">
              Back to CV optimizer
            </Link>
            <p className="pill" style={{ width: "fit-content", marginTop: "14px" }}>{page.badge}</p>
            <h1 className="hero-title blog-post-title">{page.h1}</h1>
            <p className="hero-subtitle blog-post-lead">{page.lead}</p>
            <p className="label blog-label">
              Updated: {page.updatedAt} • ~{page.estimatedWordCount} words
            </p>
            <div className="nav-actions" style={{ marginTop: "14px" }}>
              <Link className="btn primary" href="/free-ats-resume-checker">
                Free ATS resume checker
              </Link>
              <Link className="btn secondary" href="/app">
                Optimize my CV
              </Link>
              <Link className="btn ghost" href="/cv-optimizer">
                CV optimizer
              </Link>
              <Link className="btn ghost" href="/pricing">
                Pricing
              </Link>
              <Link className="btn ghost" href="/blog">
                Blog
              </Link>
            </div>
          </div>

          <div className="blog-post-section card resume-example-toc">
            <h2 className="seo-anchor" id="on-this-page">
              On this page
            </h2>
            <ul className="resume-example-toc-list">
              {page.sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
              <li>
                <a href="#frequently-asked-questions">FAQ</a>
              </li>
            </ul>
          </div>

          {sectionPairs[0].map((section) => (
            <div className="blog-post-section card" key={section.id}>
              <h2 className="seo-anchor" id={section.id}>{section.title}</h2>
              <MarkdownLite markdown={section.body} />
            </div>
          ))}

          <div className="blog-takeaway card">
            <h3>{page.ctas.soft.title}</h3>
            <MarkdownLite markdown={page.ctas.soft.body} />
            {renderButtons(page.ctaButtons.soft)}
          </div>

          {sectionPairs[1].map((section) => (
            <div className="blog-post-section card" key={section.id}>
              <h2 className="seo-anchor" id={section.id}>{section.title}</h2>
              <MarkdownLite markdown={section.body} />
            </div>
          ))}

          <div className="blog-takeaway card">
            <h3>{page.ctas.educational.title}</h3>
            <MarkdownLite markdown={page.ctas.educational.body} />
            {renderButtons(page.ctaButtons.educational)}
          </div>

          {sectionPairs[2].map((section) => (
            <div className="blog-post-section card" key={section.id}>
              <h2 className="seo-anchor" id={section.id}>{section.title}</h2>
              <MarkdownLite markdown={section.body} />
            </div>
          ))}

          <div className="blog-takeaway card">
            <h3>{page.ctas.product.title}</h3>
            <MarkdownLite markdown={page.ctas.product.body} />
            {renderButtons(page.ctaButtons.product)}
          </div>

          {relatedGuides.length > 0 && (
            <div className="blog-takeaway card">
              <h3>Related CV optimizer guides</h3>
              <p>Use the next page only if it solves the next bottleneck in your workflow.</p>
              <div className="rk-related-grid" style={{ marginTop: "10px" }}>
                {relatedGuides.map((guide) => (
                  <Link key={guide.slug} className="rk-related-link" href={`/cv-optimizer/${guide.slug}`}>
                    <span>{guide.h1}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {sectionPairs[3].map((section) => (
            <div className="blog-post-section card" key={section.id}>
              <h2 className="seo-anchor" id={section.id}>{section.title}</h2>
              <MarkdownLite markdown={section.body} />
            </div>
          ))}

          <div className="blog-takeaway card">
            <h3>{page.ctas.strong.title}</h3>
            <MarkdownLite markdown={page.ctas.strong.body} />
            {renderButtons(page.ctaButtons.strong)}
          </div>

          <div className="blog-post-section card">
            <h2 className="seo-anchor" id="frequently-asked-questions">
              Frequently asked questions
            </h2>
            <div className="rk-faq-list">
              {page.faqItems.map((item) => (
                <details key={item.question} className="rk-faq-item">
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="blog-takeaway card">
            <h3>{page.ctas.final.title}</h3>
            <MarkdownLite markdown={page.ctas.final.body} />
            {renderButtons(page.ctaButtons.final)}
          </div>
        </article>
      </div>
    </main>
  );
}
