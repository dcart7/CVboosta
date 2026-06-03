import type { Metadata } from "next";
import Link from "next/link";
import TopNav from "../components/TopNav";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Resume Bullet Examples (ATS + Recruiter-Friendly) | CVboosta",
  description:
    "Bullet formulas and realistic examples that pass ATS parsing and read credibly to recruiters. Learn how to add proof without keyword stuffing.",
  alternates: {
    canonical: "/resume-bullets",
  },
};

export default function ResumeBulletsHubPage() {
  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="hero fade-up blog-hero">
          <div className="blog-hero-panel">
            <p className="pill">BULLETS</p>
            <h1 className="hero-title">Resume Bullet Examples</h1>
            <p className="hero-subtitle">
              Better bullets = better match. Use proof-first writing that ATS can index and recruiters can trust.
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
            <h2>The ATS-safe bullet formula</h2>
            <p>
              A strong bullet is one claim with proof. Use: <strong>Action + Scope/System + Keyword + Result</strong>.
            </p>
            <ul>
              <li>Start with a strong verb (built, led, improved, shipped, reduced).</li>
              <li>Name the system or scope (team, volume, users, budget, pipeline).</li>
              <li>Include one role keyword naturally (tool, method, responsibility).</li>
              <li>Finish with an outcome (metric, baseline→result, time saved).</li>
            </ul>
          </div>
        </section>

        <section className="section fade-up">
          <div className="card blog-post-section">
            <h2>Examples to copy (then tailor)</h2>
            <ul>
              <li>Reduced cycle time by 22% by clarifying owners and removing duplicate approvals.</li>
              <li>Improved quality KPI from 74% to 86% by adding validation and tighter acceptance criteria.</li>
              <li>Cut weekly manual reporting by 6 hours by automating data pulls and standardizing dashboards.</li>
              <li>Reduced rework by 18% by aligning requirements, adding QA checkpoints, and tracking defects weekly.</li>
            </ul>
          </div>
        </section>

        <section className="section fade-up">
          <div className="card blog-post-section">
            <h2>Start here</h2>
            <ul>
              <li>
                <Link href="/resume-examples">Resume examples by role (includes before/after rewrites)</Link>
              </li>
              <li>
                <Link href="/blog/improve-ats-resume-score">How to improve ATS resume score</Link>
              </li>
              <li>
                <Link href="/free-ats-resume-checker">Free ATS resume checker</Link>
              </li>
            </ul>
          </div>
        </section>

        <section className="section fade-up">
          <div className="card blog-takeaway">
            <h3>Turn bullet rewrites into a stronger application</h3>
            <p>
              Once you know the formula, use the scan and optimizer to rewrite the first few bullets
              against a specific job description before you submit.
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
