import Link from "next/link";
import type { Metadata } from "next";
import TopNav from "../components/TopNav";
import { getPublishedResumeKeywordClusters } from "../lib/resumeKeywordClusters";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Resume Keywords by Role (100+ Pages) | CVboosta",
  description:
    "Browse role-based resume keyword guides with ATS terms, mistakes, bullet rewrite examples, and FAQ.",
  alternates: {
    canonical: "/resume-keywords",
  },
};

export default function ResumeKeywordsHubPage() {
  const clusters = getPublishedResumeKeywordClusters();

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="hero fade-up rk-hero">
          <div className="rk-hero-panel" style={{ maxWidth: "980px", width: "100%" }}>
            <p className="pill">SEO Cluster Hub</p>
            <h1 className="hero-title">Resume Keywords by Role</h1>
            <p className="hero-subtitle rk-hero-subtitle">
              This hub contains role-specific ATS keyword pages for resume tailoring.
              Each page includes top terms, common mistakes, bullet rewrites, and practical FAQ.
            </p>
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

        <section className="section fade-up rk-hub-section">
          <div className="rk-hub-head">
            <h2 className="section-title">Roles ({clusters.length})</h2>
            <p>Pick any role to open a full ATS keyword playbook.</p>
          </div>
          <div className="grid rk-role-grid">
            {clusters.map((cluster) => (
              <article key={cluster.slug} className="card rk-role-card">
                <p className="rk-role-card-kicker">Role Guide</p>
                <h3 className="rk-role-card-title">{cluster.role}</h3>
                <p className="rk-role-card-copy">
                  Top ATS keywords, rewrite examples, and role-specific resume FAQ.
                </p>
                <Link className="btn ghost rk-role-card-btn" href={`/resume-keywords/${cluster.slug}`}>
                  Open guide
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
