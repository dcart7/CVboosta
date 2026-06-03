"use client";

import Link from "next/link";
import TopNav from "./TopNav";
import MarkdownLite from "./MarkdownLite";
import { useTranslation } from "../lib/LanguageContext";
import type { SeoGuidePage } from "../lib/seoExpansion";

type Props = {
  page: SeoGuidePage;
  hubHref: string;
  hubLabel: string;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function SeoGuidePageClient({ page, hubHref, hubLabel }: Props) {
  const { t } = useTranslation();

  const toc = page.sections.map((section, index) => {
    const base = slugify(section.title);
    return {
      id: `${base || "section"}-${index + 1}`,
      title: section.title,
    };
  });

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <article className="section fade-up blog-post-wrap">
          <div className="blog-post-head card">
            <Link className="btn ghost" href={hubHref}>
              {hubLabel}
            </Link>
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
                Optimize my resume
              </Link>
              <Link className="btn ghost" href="/register">
                Create free account
              </Link>
              <Link className="btn ghost" href="/login">
                {t("nav.login")}
              </Link>
            </div>
          </div>

          <div className="blog-post-section card resume-example-toc">
            <h2 className="seo-anchor" id="on-this-page">
              On this page
            </h2>
            <ul className="resume-example-toc-list">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`}>{item.title}</a>
                </li>
              ))}
            </ul>
          </div>

          {page.sections.map((section, index) => (
            <div className="blog-post-section card" key={`${page.slug}-${index}`}>
              <h2 className="seo-anchor" id={toc[index]?.id || `section-${index + 1}`}>
                {section.title}
              </h2>
              <MarkdownLite markdown={section.body} />
            </div>
          ))}

          {page.relatedPages.length > 0 && (
            <div className="blog-takeaway card">
              <h3>Related pages</h3>
              <p>Keep exploring the same cluster so the next page matches your exact hiring problem.</p>
              <div className="rk-related-grid" style={{ marginTop: "10px" }}>
                {page.relatedPages.map((item) => (
                  <Link key={item.href} className="rk-related-link" href={item.href}>
                    <span>{item.title}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="blog-takeaway card">
            <h3>Turn this into action on CVboosta</h3>
            <p>
              Run a scan, open the optimizer, and fix the exact gaps before you apply so this page
              becomes a real resume improvement, not just another tab.
            </p>
            <div className="nav-actions" style={{ marginTop: "12px" }}>
              <Link className="btn primary" href="/free-ats-resume-checker">
                Free ATS resume checker
              </Link>
              <Link className="btn secondary" href="/app">
                Optimize my resume
              </Link>
              <Link className="btn ghost" href="/register">
                Create free account
              </Link>
              <Link className="btn ghost" href="/login">
                {t("nav.login")}
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
