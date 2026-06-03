import type { Metadata } from "next";
import Link from "next/link";
import TopNav from "../components/TopNav";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Resume Summary Examples (ATS-Friendly) | CVboosta",
  description:
    "ATS-safe resume summary examples and formulas. Learn what recruiters scan first and how to tailor a summary to a specific job description.",
  alternates: {
    canonical: "/resume-summary",
  },
};

export default function ResumeSummaryHubPage() {
  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="hero fade-up blog-hero">
          <div className="blog-hero-panel">
            <p className="pill">SUMMARY</p>
            <h1 className="hero-title">Resume Summary Examples</h1>
            <p className="hero-subtitle">
              Short, recruiter-readable summaries that pass ATS parsing and make role fit obvious fast.
            </p>
            <div className="nav-actions">
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
                Log in
              </Link>
            </div>
          </div>
        </section>

        <section className="section fade-up">
          <div className="card blog-post-section">
            <h2>The best summary formula (ATS + recruiter-safe)</h2>
            <p>
              Keep it to <strong>2–4 sentences</strong>. Use job language once, then prove it in experience bullets.
            </p>
            <ul>
              <li><strong>Sentence 1:</strong> Target title + lane (what you do).</li>
              <li><strong>Sentence 2:</strong> 2–4 must-have keywords from the vacancy.</li>
              <li><strong>Sentence 3:</strong> One credibility signal (metric, scope, or outcome).</li>
              <li><strong>Optional:</strong> Domain context (industry, product type) if relevant.</li>
            </ul>
          </div>
        </section>

        <section className="section fade-up">
          <div className="card blog-post-section">
            <h2>Start here</h2>
            <ul>
              <li>
                <Link href="/blog/resume-summary-for-career-switch">Resume summary for a career switch</Link>
              </li>
              <li>
                <Link href="/resume-examples">Resume examples by role (includes summaries)</Link>
              </li>
              <li>
                <Link href="/free-ats-resume-checker">Free ATS resume checker</Link>
              </li>
            </ul>
          </div>
        </section>

        <section className="section fade-up">
          <div className="card blog-takeaway">
            <h3>Use the summary advice inside the product</h3>
            <p>
              After you pick a summary angle, run your resume through the scan or optimizer so you
              can match the summary to a real vacancy and close the missing keyword gaps.
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
                Log in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
