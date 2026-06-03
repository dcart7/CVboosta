"use client";

import Link from "next/link";
import TopNav from "../../components/TopNav";
import MarkdownLite from "../../components/MarkdownLite";
import { useTranslation } from "../../lib/LanguageContext";
import { getResumeExamplesUi } from "../../lib/resumeExamplesI18n";
import type { ResumeExampleSeoPage } from "../../lib/resumeExamplePages";
import { localizeRoleName } from "../../lib/resumeKeywordsI18n";

type Props = {
  page: ResumeExampleSeoPage;
  roleSlug: string;
  roleName: string;
};

export default function ResumeExampleRoleClient({ page, roleSlug, roleName }: Props) {
  const { language, t } = useTranslation();
  const ui = getResumeExamplesUi(language);
  const localizedRoleName = localizeRoleName(roleName, language);

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const toc = page.sections.map((section, index) => {
    const title = section.title.replace(roleName, localizedRoleName);
    const base = slugify(title);
    const id = `${base || "section"}-${index + 1}`;
    return { id, title };
  });

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <article className="section fade-up blog-post-wrap">
          <div className="blog-post-head card">
            <Link className="btn ghost" href="/resume-examples">
              {ui.backToHub}
            </Link>
            <h1 className="hero-title blog-post-title">{page.h1.replace(roleName, localizedRoleName)}</h1>
            <p className="hero-subtitle blog-post-lead">{page.lead.replace(roleName, localizedRoleName)}</p>
            <p className="label blog-label">
              {ui.updatedLabel}: {page.updatedAt} • ~{page.estimatedWordCount} {ui.wordsLabel}
            </p>
            <div className="nav-actions" style={{ marginTop: "14px" }}>
              <Link className="btn primary" href="/free-ats-resume-checker">
                {ui.freeChecker}
              </Link>
              <Link className="btn secondary" href="/app">
                {ui.optimizeCv}
              </Link>
              <Link className="btn ghost" href="/register">
                {ui.register}
              </Link>
              <Link className="btn ghost" href="/login">
                {t("nav.login")}
              </Link>
              <Link className="btn ghost" href={`/resume-keywords/${roleSlug}`}>
                {ui.resumeKeywordsForRole(localizedRoleName)}
              </Link>
            </div>
          </div>

          <div className="blog-post-section card resume-example-toc">
            <h2 className="seo-anchor" id="on-this-page">
              {ui.onThisPageTitle}
            </h2>
            <ul className="resume-example-toc-list">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`}>{item.title}</a>
                </li>
              ))}
            </ul>
          </div>

          {page.sections.map((section, index) => {
            const title = section.title.replace(roleName, localizedRoleName);
            const id = toc[index]?.id || `section-${index + 1}`;
            return (
            <div className="blog-post-section card" key={`${page.slug}-${index}`}>
              <h2 className="seo-anchor" id={id}>{title}</h2>
              <MarkdownLite markdown={section.body.replaceAll(roleName, localizedRoleName)} />
            </div>
            );
          })}

          {page.relatedPages.length > 0 && (
            <div className="blog-takeaway card">
              <h3>{ui.relatedExamplesTitle}</h3>
              <p>{ui.relatedExamplesLead}</p>
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

          {page.similarRoles.length > 0 && (
            <div className="blog-takeaway card">
              <h3>{ui.similarKeywordGuidesTitle}</h3>
              <p>{ui.similarKeywordGuidesLead}</p>
              <div className="rk-related-grid" style={{ marginTop: "10px" }}>
                {page.similarRoles.map((item) => (
                  <Link
                    key={item.slug}
                    className="rk-related-link"
                    href={`/resume-keywords/${item.slug}`}
                  >
                    <span>{ui.resumeKeywordsForRole(item.role)}</span>
                    <span aria-hidden="true">→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="blog-takeaway card">
            <h3>Take the next step on CVboosta</h3>
            <p>
              Run a scan, open the optimizer, or create an account before you apply so you can
              fix parsing issues, keyword gaps, and weak bullets in one flow.
            </p>
            <div className="nav-actions" style={{ marginTop: "12px" }}>
              <Link className="btn primary" href="/free-ats-resume-checker">
                {ui.freeChecker}
              </Link>
              <Link className="btn secondary" href="/app">
                {ui.optimizeCv}
              </Link>
              <Link className="btn ghost" href="/register">
                {ui.register}
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
