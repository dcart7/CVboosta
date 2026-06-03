import type { Metadata } from "next";
import Link from "next/link";
import TopNav from "../components/TopNav";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ATS Guides (Parsing, Keywords, Formatting) | CVboosta",
  description:
    "ATS-friendly resume rules explained: parsing, keywords, formatting, and practical checks you can apply before you submit.",
  alternates: {
    canonical: "/ats",
  },
};

export default function AtsHubPage() {
  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="hero fade-up blog-hero">
          <div className="blog-hero-panel">
            <p className="pill">ATS</p>
            <h1 className="hero-title">ATS Guides</h1>
            <p className="hero-subtitle">
              Practical rules for clean parsing, keyword matching, and recruiter-friendly readability.
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
            <h2>ATS-safe defaults (the 60-second version)</h2>
            <ul>
              <li>Use a single-column layout and standard headings (Summary, Skills, Experience, Education).</li>
              <li>Avoid tables, text boxes, icons, and sidebars for critical text.</li>
              <li>Keep dates consistent and readable (Month YYYY – Month YYYY).</li>
              <li>Place keywords in context: summary + skills + bullets with proof.</li>
              <li>Use the application portal preview to confirm parsing looks clean.</li>
            </ul>
          </div>
        </section>

        <section className="section fade-up">
          <div className="card blog-post-section">
            <h2>Recommended reads</h2>
            <ul>
              <li>
                <Link href="/blog/ats-friendly-resume-template-one-page">ATS-friendly resume template (one-page)</Link>
              </li>
              <li>
                <Link href="/blog/ats-friendly-resume-format-checklist">ATS-friendly resume format checklist</Link>
              </li>
              <li>
                <Link href="/free-ats-resume-checker">Free ATS resume checker</Link>
              </li>
            </ul>
          </div>
        </section>

        <section className="section fade-up">
          <div className="card blog-takeaway">
            <h3>Turn the rules into an actual resume flow</h3>
            <p>
              Once you finish the checklist, move into the scan and optimizer so you can validate
              parsing and fix the highest-impact gaps before you apply.
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
