import Link from "next/link";
import TopNav from "../../components/TopNav";
import type { ResumeOptimizerPage as ResumeOptimizerPageData, ResumeOptimizerSection } from "../data";

type Props = {
  page: ResumeOptimizerPageData;
};

function CtaBlock({
  page,
  heading,
  copy,
}: {
  page: ResumeOptimizerPageData;
  heading: string;
  copy: string;
}) {
  return (
    <section className="blog-takeaway card">
      <h2 className="section-title">{heading}</h2>
      <p>{copy}</p>
      <div className="nav-actions rk-hero-actions">
        <Link className="btn primary" href={page.primaryCta.href}>
          {page.primaryCta.label}
        </Link>
        <Link className="btn secondary" href={page.secondaryCta.href}>
          {page.secondaryCta.label}
        </Link>
      </div>
      <p className="hero-mini-text">Keep your experience truthful. Review every suggestion before applying.</p>
    </section>
  );
}

function ArticleSection({ section }: { section: ResumeOptimizerSection }) {
  return (
    <section className="blog-post-section card">
      <h2 className="seo-anchor" id={section.id}>
        {section.heading}
      </h2>
      {section.content.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {section.bullets && (
        <ul>
          {section.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      )}
      {section.id === "optimization-process" && (
        <div className="steps" aria-label="Resume optimization steps">
          {[
            "Upload the resume you already use",
            "Add one real job description",
            "Review parsing and keyword gaps",
            "Edit, verify, and export",
          ].map((step, index) => (
            <div className="step" key={step}>
              <span>{index + 1}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function ResumeOptimizerPage({ page }: Props) {
  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <nav className="rk-muted" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span aria-hidden="true">/</span>{" "}
          <Link href="/resume-optimizer">Resume Optimizer</Link> <span aria-hidden="true">/</span>{" "}
          <span>{page.title}</span>
        </nav>

        <article className="blog-post-wrap">
          <header className="blog-post-head card rk-panel">
            <p className="pill">{page.category}</p>
            <h1 className="blog-post-title">{page.h1}</h1>
            <p className="blog-post-lead">{page.intro}</p>
            <div className="nav-actions rk-hero-actions">
              <Link className="btn primary" href={page.primaryCta.href}>
                {page.primaryCta.label}
              </Link>
              <Link className="btn ghost" href={page.secondaryCta.href}>
                {page.secondaryCta.label}
              </Link>
            </div>
            <p className="hero-mini-text">Start with your current resume. No need to rebuild it from scratch.</p>
          </header>

          <section className="blog-takeaway card">
            <h2 className="section-title">Quick answer</h2>
            <p>{page.quickAnswer}</p>
            <div className="nav-actions rk-hero-actions">
              <Link className="btn secondary" href="/cv-optimizer">
                See the full CV optimizer workflow
              </Link>
              <Link className="btn ghost" href="/free-ats-resume-checker">
                Check my resume for free
              </Link>
            </div>
          </section>

          {page.sections.map((section) =>
            section.id === "before-and-after" ? (
              <section className="blog-post-section card" key={section.id}>
                <h2 className="seo-anchor" id={section.id}>
                  {section.heading}
                </h2>
                {section.content.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <div className="before-after">
                  <div className="before-after-card before-card">
                    <span className="before-after-label">Before</span>
                    <p className="before-after-text">{page.beforeAfter.before}</p>
                  </div>
                  <div className="before-after-card after-card">
                    <span className="before-after-label">After</span>
                    <p className="before-after-text">{page.beforeAfter.after}</p>
                  </div>
                </div>
                <div className="before-after-impact">
                  <p><strong>Why it works:</strong> {page.beforeAfter.why}</p>
                  <p className="hero-mini-text">Use only real facts and metrics from your own experience.</p>
                </div>
                <div className="nav-actions rk-hero-actions">
                  <Link className="btn primary" href="/app">
                    Analyze my resume
                  </Link>
                  <Link className="btn ghost" href="/resume-bullets">
                    See more bullet guidance
                  </Link>
                </div>
              </section>
            ) : (
              <ArticleSection section={section} key={section.id} />
            ),
          )}

          <CtaBlock
            page={page}
            heading="Ready to improve this part of your resume?"
            copy="Compare the version you have with one real job description, review the gaps, and choose the edits that accurately reflect your work."
          />

          <section className="blog-post-section card">
            <h2 className="seo-anchor" id="related-guides">
              Related resume optimizer guides
            </h2>
            <p>
              Follow the narrowest next question in this cluster, then return to the main resume optimizer hub
              when you are ready to compare a different angle.
            </p>
            <div className="rk-related-grid">
              {page.relatedSlugs.map((slug) => (
                <Link className="rk-related-link" href={`/resume-optimizer/${slug}`} key={slug}>
                  <span>{slug.replace(/-optimizer$/, "").replace(/-/g, " ")} resume guide</span>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
            <div className="rk-related-grid">
              {page.resourceLinks.map((link) => (
                <Link className="rk-related-link" href={link.href} key={link.href}>
                  <span>{link.label}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
            <p className="rk-muted">
              <Link href="/resume-optimizer">Explore all 100 resume optimizer guides</Link>
            </p>
          </section>

          <section className="blog-post-section card">
            <h2 className="seo-anchor" id="faq">
              Frequently asked questions
            </h2>
            <div className="rk-faq-list">
              {page.faq.map((item) => (
                <details className="rk-faq-item" key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <CtaBlock
            page={page}
            heading="Take the next honest step"
            copy="Open CVBoosta with the resume you already have, check it against the role you want, and review every suggestion before you send the application."
          />
        </article>
      </div>
    </main>
  );
}
