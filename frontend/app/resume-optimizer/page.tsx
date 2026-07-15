import Link from "next/link";
import type { Metadata } from "next";
import TopNav from "../components/TopNav";
import ResumeOptimizerStructuredData from "./components/ResumeOptimizerStructuredData";
import {
  RESUME_OPTIMIZER_CATEGORIES,
  RESUME_OPTIMIZER_HUB_FAQ,
  getResumeOptimizerPagesByCategory,
  type ResumeOptimizerCategory,
} from "./data";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Resume Optimizer: Improve Your Resume for ATS and Recruiters | CVBoosta",
  description:
    "Use a resume optimizer to check ATS readability, match a job description, find missing keywords, and improve weak bullets. Try CVBoosta today.",
  alternates: {
    canonical: "/resume-optimizer",
  },
  openGraph: {
    title: "Resume Optimizer: Improve Your Resume for ATS and Recruiters | CVBoosta",
    description:
      "Use a resume optimizer to check ATS readability, match a job description, find missing keywords, and improve weak bullets. Try CVBoosta today.",
    url: "/resume-optimizer",
    type: "website",
    siteName: "CVboosta",
  },
};

const CATEGORY_LABELS: Record<ResumeOptimizerCategory, string> = {
  "by profession": "By profession",
  "by experience level": "By experience level",
  "by career situation": "By career situation",
  "by resume section": "By resume section",
  "by ATS platform": "By ATS platform and hiring process",
  "by industry": "By industry",
  "by country": "By country",
  "by file format and workflow": "By file format and workflow",
};

function ProductCta({ heading, copy }: { heading: string; copy: string }) {
  return (
    <section className="blog-takeaway card">
      <h2 className="section-title">{heading}</h2>
      <p>{copy}</p>
      <div className="nav-actions rk-hero-actions">
        <Link className="btn primary" href="/app">
          Optimize my resume
        </Link>
        <Link className="btn secondary" href="/free-ats-resume-checker">
          Run a free ATS check
        </Link>
        <Link className="btn ghost" href="/pricing">
          Review pricing
        </Link>
      </div>
      <p className="hero-mini-text">Start with your current resume. Review every suggestion before applying.</p>
    </section>
  );
}

export default function ResumeOptimizerHubPage() {
  return (
    <>
      <ResumeOptimizerStructuredData />
      <main className="page">
        <TopNav />
        <div className="shell">
          <section className="hero fade-up rk-hero">
            <div className="rk-hero-panel">
              <p className="pill">Resume optimizer</p>
              <h1 className="hero-title">Optimize Your Resume for ATS and Real Recruiters</h1>
              <p className="hero-subtitle rk-hero-subtitle">
                Compare your current resume with a real job description, check ATS-readable structure,
                find missing keywords, and strengthen the bullets that make your experience easy to trust.
              </p>
              <div className="nav-actions rk-hero-actions">
                <Link className="btn primary" href="/app">
                  Optimize my resume
                </Link>
                <Link className="btn secondary" href="/free-ats-resume-checker">
                  Run a free ATS check
                </Link>
                <Link className="btn ghost" href="/cv-optimizer">
                  See the CV optimizer
                </Link>
              </div>
              <p className="hero-mini-text">Keep your experience truthful. No need to rebuild your resume from scratch.</p>
            </div>
          </section>

          <section className="section fade-up">
            <div className="blog-post-section card">
              <h2 className="section-title">What is a resume optimizer?</h2>
              <p>
                A resume optimizer is a focused review workflow for the document you already have. It checks how
                your resume is likely to be read, compares it with the language and priorities of a target vacancy,
                and helps you make the strongest evidence easier to find. It is not a promise of an interview and it
                should never invent skills, metrics, titles, or achievements.
              </p>
              <p>
                CVBoosta brings ATS analysis, job-description matching, keyword gap detection, bullet-point guidance,
                and recruiter-facing clarity into one path. The useful question is not “How do I add more keywords?”
                but “Which true parts of my experience should be clearer for this role?”
              </p>
              <div className="rk-chip-grid">
                <span className="rk-chip">ATS readability</span>
                <span className="rk-chip">Job description match</span>
                <span className="rk-chip">Missing keywords</span>
                <span className="rk-chip">Stronger bullets</span>
                <span className="rk-chip">Recruiter clarity</span>
              </div>
            </div>
          </section>

          <section className="section fade-up">
            <div className="blog-post-section card">
              <h2 className="section-title">How resume optimization works</h2>
              <p>
                Start with one real resume and one real vacancy. A useful optimization pass moves from structure to
                relevance to wording, so a prettier layout does not hide a genuine role mismatch.
              </p>
              <div className="steps">
                {[
                  ["01", "Start with your current resume", "Keep the experience, dates, and titles you can defend."],
                  ["02", "Add the target job description", "Separate required skills, responsibilities, and outcomes."],
                  ["03", "Review ATS and keyword signals", "Find parsing risks and gaps that affect the first read."],
                  ["04", "Improve and verify", "Rewrite the highest-value lines, then review every suggestion."],
                ].map(([number, title, copy]) => (
                  <div className="step" key={title}>
                    <span>{number}</span>
                    <strong>{title}</strong>
                    <p>{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="section fade-up">
            <div className="grid">
              <article className="card">
                <h2>ATS analysis</h2>
                <p>
                  Check selectable text, conventional section labels, dates, reading order, and file instructions.
                  ATS-friendly structure is a baseline; it does not replace relevant experience.
                </p>
              </article>
              <article className="card">
                <h2>Job description matching</h2>
                <p>
                  Group the vacancy into responsibilities, must-have skills, preferred language, and outcomes. Then
                  adjust emphasis where your current experience genuinely matches.
                </p>
              </article>
              <article className="card">
                <h2>Missing keywords</h2>
                <p>
                  Find terms that are absent or buried, then connect supported wording to the summary, skills, and
                  evidence sections instead of repeating a phrase everywhere.
                </p>
              </article>
              <article className="card">
                <h2>Better bullet points</h2>
                <p>
                  Replace duties-only lines with a clear action, context, decision, and result. Use real metrics when
                  you have them; a concrete workflow change is also valid evidence.
                </p>
              </article>
            </div>
          </section>

          <section className="section fade-up">
            <div className="blog-post-section card">
              <h2 className="section-title">Before and after: make the evidence clearer</h2>
              <div className="before-after">
                <div className="before-after-card before-card">
                  <span className="before-after-label">Before</span>
                  <p className="before-after-text">Responsible for marketing campaigns and helping the team.</p>
                </div>
                <div className="before-after-card after-card">
                  <span className="before-after-label">After</span>
                  <p className="before-after-text">
                    Coordinated paid-search and lifecycle campaign briefs, aligned landing-page updates with search
                    intent, and reviewed channel performance for the next test.
                  </p>
                </div>
              </div>
              <p>
                The revision adds channel, audience, and an optimization loop without inventing a performance claim.
                Use only facts and metrics from your own work; the point is to demonstrate structure, not to borrow a
                result that is not yours.
              </p>
            </div>
          </section>

          <ProductCta
            heading="Use your current resume as the starting point"
            copy="Run a free check for a quick diagnosis, or open the full CVBoosta workflow when you want to compare, edit, and review one application version."
          />

          <section className="section fade-up">
            <div className="blog-post-section card">
              <h2 className="section-title">Free resume optimizer vs paid workflow</h2>
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Option</th>
                      <th>Useful for</th>
                      <th>What to expect</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Free ATS check</td>
                      <td>Quick parsing, match, and keyword diagnosis</td>
                      <td>A starting point for deciding which edits deserve attention</td>
                    </tr>
                    <tr>
                      <td>CVBoosta optimizer</td>
                      <td>Role-specific comparison, rewrite guidance, and a repeatable application workflow</td>
                      <td>More room to review, edit, and keep a truthful version for the target job</td>
                    </tr>
                    <tr>
                      <td>Manual editing</td>
                      <td>Candidates who already know the gap and want full control</td>
                      <td>Useful when paired with a real vacancy and a clear checklist</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="section fade-up">
            <div className="blog-post-section card">
              <h2 className="section-title">Explore resume optimizer guides by intent</h2>
              <p>
                Each guide below targets a narrower question. The pages share a consistent workflow but use different
                role, career, section, ATS, industry, country, and file-format evidence so you can start where your
                actual bottleneck is.
              </p>
              {RESUME_OPTIMIZER_CATEGORIES.map((category) => {
                const pages = getResumeOptimizerPagesByCategory(category);
                return (
                  <section className="rk-category-block" key={category}>
                    <h3 className="rk-category-title">{CATEGORY_LABELS[category]} ({pages.length})</h3>
                    <div className="rk-role-grid">
                      {pages.map((page) => (
                        <article className="rk-role-card" key={page.slug}>
                          <p className="rk-role-card-kicker">{page.title}</p>
                          <h4 className="rk-role-card-title">{page.h1}</h4>
                          <p className="rk-role-card-copy">
                            Focus: {page.keywords.slice(0, 2).join(" and ")}.
                          </p>
                          <Link className="btn ghost rk-role-card-btn" href={`/resume-optimizer/${page.slug}`}>
                            Read this guide →
                          </Link>
                        </article>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>

          <section className="section fade-up">
            <div className="blog-post-section card">
              <h2 className="section-title">Frequently asked questions</h2>
              <div className="rk-faq-list">
                {RESUME_OPTIMIZER_HUB_FAQ.map((item) => (
                  <details className="rk-faq-item" key={item.question}>
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <ProductCta
            heading="Turn a resume diagnosis into a better application"
            copy="Open CVBoosta, compare your resume with the job you want, and make the changes you can support with real experience."
          />
        </div>
      </main>
    </>
  );
}
