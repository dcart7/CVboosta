import type { Metadata } from "next";
import Link from "next/link";
import TopNav from "../components/TopNav";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Resume Guides for Specific Situations | CVboosta",
  description:
    "Practical resume guidance for special cases like career switches and remote roles—ATS-safe structure, keyword strategy, and proof-first bullet examples.",
  alternates: {
    canonical: "/resume-for",
  },
};

export default function ResumeForHubPage() {
  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="hero fade-up blog-hero">
          <div className="blog-hero-panel">
            <p className="pill">RESUME FOR</p>
            <h1 className="hero-title">Resume Guides for Specific Situations</h1>
            <p className="hero-subtitle">
              Simple, ATS-friendly guidance for non-standard scenarios (career switch, remote roles, and more).
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
            <h2>Popular guides</h2>
            <ul>
              <li>
                <Link href="/blog/optimize-resume-for-remote-jobs">Optimize your resume for remote jobs</Link>
              </li>
              <li>
                <Link href="/blog/resume-summary-for-career-switch">Resume summary for a career switch</Link>
              </li>
              <li>
                <Link href="/blog/ats-friendly-resume-format-checklist">ATS-friendly format checklist</Link>
              </li>
            </ul>
          </div>
        </section>

        <section className="section fade-up">
          <div className="card blog-post-section">
            <h2>Fast checklist (works for most cases)</h2>
            <ul>
              <li>Fix parsing first (one column, standard headings).</li>
              <li>Extract 8–15 must-haves from the job post.</li>
              <li>Mirror keywords once, then prove them in bullets.</li>
              <li>Upgrade the first 3–6 bullets in your most recent relevant role.</li>
              <li>Do a final upload preview check before you submit.</li>
            </ul>
          </div>
        </section>

        <section className="section fade-up">
          <div className="card blog-takeaway">
            <h3>Move from guide to action</h3>
            <p>
              If your case is remote work, a career switch, or another edge case, the fastest next
              step is to run the scan and open the optimizer with the real vacancy pasted in.
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
