import Link from "next/link";
import Script from "next/script";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TopNav from "../../components/TopNav";
import {
  getResumeKeywordClusterBySlug,
  getResumeKeywordStaticSlugs,
} from "../../lib/resumeKeywordClusters";

export const revalidate = 3600;

type ResumeKeywordRolePageProps = {
  params: Promise<{ role: string }>;
};

export async function generateStaticParams() {
  return getResumeKeywordStaticSlugs().map((role) => ({ role }));
}

export async function generateMetadata({
  params,
}: ResumeKeywordRolePageProps): Promise<Metadata> {
  const { role } = await params;
  const cluster = getResumeKeywordClusterBySlug(role);

  if (!cluster) {
    return {
      title: "Resume Keywords | CVboosta",
      description: "Role-specific resume keywords and ATS optimization tips.",
    };
  }

  return {
    title: `Resume Keywords for ${cluster.role} | CVboosta`,
    description: `Top ATS keywords for ${cluster.role}, common resume mistakes, bullet rewrite examples, and practical FAQ.`,
    alternates: {
      canonical: `/resume-keywords/${cluster.slug}`,
    },
  };
}

function buildArticleSchema(siteUrl: string, slug: string, role: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Resume Keywords for ${role}`,
    description,
    author: {
      "@type": "Organization",
      name: "CVboosta",
    },
    publisher: {
      "@type": "Organization",
      name: "CVboosta",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: `${siteUrl}/resume-keywords/${slug}`,
  };
}

function buildFaqSchema(role: string, faq: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question.replace(/\{role\}/g, role),
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer.replace(/\{role\}/g, role),
      },
    })),
  };
}

export default async function ResumeKeywordRolePage({
  params,
}: ResumeKeywordRolePageProps) {
  const { role } = await params;
  const cluster = getResumeKeywordClusterBySlug(role);

  if (!cluster) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com";
  const pageDescription = `This guide shows how to build a stronger ${cluster.role} resume using ATS keyword alignment, measurable bullet rewrites, and role-specific quality checks.`;
  const articleSchema = buildArticleSchema(siteUrl, cluster.slug, cluster.role, pageDescription);
  const faqSchema = buildFaqSchema(cluster.role, cluster.faq);

  const longTailPhrases = [
    `resume keywords for ${cluster.role.toLowerCase()}`,
    `${cluster.role.toLowerCase()} resume examples`,
    `${cluster.role.toLowerCase()} ats resume tips`,
    `${cluster.role.toLowerCase()} bullet points resume`,
  ];

  return (
    <main className="page">
      <Script
        id={`article-schema-${cluster.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id={`faq-schema-${cluster.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <TopNav />
      <div className="shell">
        <section className="hero fade-up rk-hero">
          <div className="rk-hero-panel" style={{ maxWidth: "980px", width: "100%" }}>
            <p className="pill">Role Cluster</p>
            <h1 className="hero-title">Resume Keywords for {cluster.role}</h1>
            <p className="hero-subtitle rk-hero-subtitle">{pageDescription}</p>
            <div className="nav-actions rk-hero-actions">
              <Link className="btn primary" href="/free-ats-resume-checker">
                Free ATS Resume Checker
              </Link>
              <Link className="btn ghost" href="/pricing">
                Optimize CV
              </Link>
            </div>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">Top ATS Keywords for {cluster.role}</h2>
            <p className="rk-copy">
              For this role, keyword targeting is not about stuffing more words.
              It is about matching intent: responsibilities, tools, outcomes, and context.
              Start with repeated requirements in the job description, then place those terms
              where ATS and recruiters scan first: headline, summary, skills, and recent bullets.
              Your best resume version balances readability with relevance and avoids fake alignment.
              Each term should be supported by real work evidence, otherwise your application risks
              losing trust during recruiter review.
            </p>
            <div className="rk-chip-grid">
              {cluster.keywords.map((item) => (
                <div key={item} className="rk-chip">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">Common Resume Mistakes for {cluster.role}</h2>
            <p className="rk-copy">
              Most low-performance resumes fail on structure and proof quality, not on experience depth.
              For {cluster.role}, strong applicants usually lose matches because they describe activity
              instead of impact, use generic language instead of role terms, or skip metrics.
              Keep one message in mind: the reader should understand value in less than 20 seconds.
            </p>
            <ol className="rk-mistakes-list">
              {cluster.mistakes.map((mistake) => (
                <li key={mistake} className="rk-mistake-item">
                  {mistake}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">Example Bullet Rewrites for {cluster.role}</h2>
            <p className="rk-copy">
              Rewrite quality has the biggest effect on application outcomes.
              Use this pattern: action + context + measurable result.
              Replace vague “responsible for” statements with specific ownership and outcomes.
              The goal is to make your impact verifiable and relevant to the vacancy.
            </p>
            <div className="grid rk-example-grid">
              {cluster.examples.map((example, index) => (
                <article key={`${cluster.slug}-${index}`} className="card rk-example-card">
                  <p className="rk-example-line rk-before">
                    <strong>Before</strong>
                    {" "}
                    {example.before}
                  </p>
                  <p className="rk-example-line rk-after">
                    <strong>After</strong>
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
            <h2 className="section-title">How to Tailor a {cluster.role} Resume in 15 Minutes</h2>
            <p className="rk-copy">
              Step 1: copy full vacancy text and identify repeated signals: tools, responsibilities,
              seniority, domain language, and expected outcomes.
              Step 2: update your summary so role fit is explicit in the first lines.
              Step 3: reorder skills to match vacancy priorities.
              Step 4: rewrite top bullets with role terms and outcomes.
              Step 5: run a final ATS check and close the biggest keyword gaps.
              This loop is fast enough to run for every application and strong enough to improve
              consistency over time.
            </p>
            <p className="rk-copy rk-muted">
              Long-tail phrases this page targets:
              {" "}
              {longTailPhrases.join(", ")}.
              As indexing grows, these pages can bring stable intent-rich traffic to your funnel.
            </p>
          </div>
        </section>

        <section className="section fade-up rk-section">
          <div className="card rk-panel">
            <h2 className="section-title">FAQ</h2>
            <div className="rk-faq-list">
              {cluster.faq.map((item) => (
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
            <h2 className="section-title">Next Step</h2>
            <p className="rk-copy">
              Apply this guide on your own resume with live ATS feedback, missing keyword detection,
              and targeted rewrite recommendations.
            </p>
            <div className="nav-actions rk-hero-actions">
              <Link className="btn primary" href="/free-ats-resume-checker">
                Free ATS Resume Checker
              </Link>
              <Link className="btn ghost" href="/optimize">
                Optimize CV
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
