import Link from "next/link";
import TopNav from "../components/TopNav";
import {
  getSeoHubConfig,
  getSeoPage,
  type SeoCluster,
  type SeoFaq,
  type SeoLink,
  type SeoPage,
  type SeoSection,
} from "../seo-data";

function CtaPanel({ heading, copy, primary, secondary }: { heading: string; copy: string; primary: SeoLink; secondary: SeoLink }) {
  return (
    <section className="blog-takeaway card">
      <h2 className="section-title">{heading}</h2>
      <p>{copy}</p>
      <div className="nav-actions rk-hero-actions">
        <Link className="btn primary" href={primary.href}>{primary.label}</Link>
        <Link className="btn secondary" href={secondary.href}>{secondary.label}</Link>
      </div>
      <p className="hero-mini-text">Keep your experience truthful. Review every suggestion before applying.</p>
    </section>
  );
}

function SectionBlock({ section }: { section: SeoSection }) {
  return (
    <section className="section fade-up" id={section.id}>
      <div className="blog-post-section card">
        <h2 className="section-title">{section.heading}</h2>
        {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {section.bullets ? (
          <ul>
            {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function DataTable({ page }: { page: SeoPage }) {
  const table = page.dataTables[0];
  return (
    <section className="section fade-up">
      <div className="blog-post-section card">
        <h2 className="section-title">{table.title}</h2>
        {table.description ? <p>{table.description}</p> : null}
        <div className="seo-table-wrap">
          <table>
            <thead><tr>{table.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
            <tbody>{table.rows.map((row) => <tr key={row.join("|")}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function BeforeAfter({ page }: { page: SeoPage }) {
  const example = page.beforeAfterExamples[0];
  return (
    <section className="section fade-up">
      <div className="blog-post-section card">
        <h2 className="section-title">{example.label}: a clearer version</h2>
        <div className="before-after">
          <div className="before-after-card before-card">
            <span className="before-after-label">Before</span>
            <p className="before-after-text">{example.before}</p>
          </div>
          <div className="before-after-card after-card">
            <span className="before-after-label">After</span>
            <p className="before-after-text">{example.after}</p>
          </div>
        </div>
        <p>{example.explanation}</p>
      </div>
    </section>
  );
}

function ExampleAnalysis({ page }: { page: SeoPage }) {
  return (
    <section className="section fade-up">
      <div className="blog-post-section card">
        <h2 className="section-title">Example analysis preview</h2>
        <p>This is a product-style illustration, not a result from your resume. Use it to see the kind of review signal the workflow organizes.</p>
        <div className="analysis-snapshot">
          <div className="analysis-snapshot-stats">
            <div className="analysis-snapshot-stat"><span className="analysis-snapshot-label">Primary focus</span><strong className="analysis-snapshot-value">{page.secondaryKeywords[0] ?? "Role fit"}</strong></div>
            <div className="analysis-snapshot-stat"><span className="analysis-snapshot-label">Review next</span><strong className="analysis-snapshot-value">{page.secondaryKeywords[1] ?? "Evidence"}</strong></div>
          </div>
          <div className="analysis-snapshot-tags rk-chip-grid">
            {page.secondaryKeywords.slice(0, 4).map((keyword) => <span className="rk-chip" key={keyword}>{keyword}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqList({ items }: { items: SeoFaq[] }) {
  return (
    <div className="rk-faq-list">
      {items.map((item) => (
        <details className="rk-faq-item" key={item.question}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

function RelatedGuides({ page }: { page: SeoPage }) {
  const sameCluster = page.relatedSlugs.map((slug) => getSeoPage(page.cluster, slug)).filter((item): item is SeoPage => Boolean(item));
  const hub = getSeoHubConfig(page.cluster);
  return (
    <section className="section fade-up">
      <div className="blog-post-section card">
        <h2 className="section-title">Related {hub.h1.toLowerCase()} guides</h2>
        <p>Continue with a nearby intent when the first review shows that another section or workflow needs attention.</p>
        <div className="rk-related-grid">
          <Link className="rk-related-link" href={`/${page.cluster}`}><span>{hub.h1}</span><span aria-hidden="true">→</span></Link>
          {sameCluster.map((related) => <Link className="rk-related-link" href={`/${related.cluster}/${related.slug}`} key={related.slug}><span>{related.h1}</span><span aria-hidden="true">→</span></Link>)}
        </div>
        <h3 className="rk-subtitle">Useful CVBoosta resources</h3>
        <div className="rk-related-grid">
          {page.resourceLinks.map((link) => <Link className="rk-related-link" href={link.href} key={link.href}><span>{link.label}</span><span aria-hidden="true">→</span></Link>)}
        </div>
        <h3 className="rk-subtitle">Guides in other clusters</h3>
        <div className="rk-related-grid">
          {page.crossClusterLinks.map((link) => <Link className="rk-related-link" href={link.href} key={link.href}><span>{link.label}</span><span aria-hidden="true">→</span></Link>)}
        </div>
      </div>
    </section>
  );
}

export default function ProgrammaticSeoPage({ page }: { page: SeoPage }) {
  const config = getSeoHubConfig(page.cluster);
  const [directAnswer, criteria, keywords, workflow, mistakes, checklist] = page.sections;
  return (
    <div className="page">
      <TopNav />
      <main className="shell blog-post-wrap">
        <nav className="rk-breadcrumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span><Link href={`/${page.cluster}`}>{config.h1}</Link><span aria-hidden="true">/</span><span>{page.h1}</span>
        </nav>

        <section className="hero fade-up rk-hero">
          <div className="rk-hero-panel blog-post-head">
            <p className="pill">{config.h1}</p>
            <h1 className="blog-post-title">{page.h1}</h1>
            <p className="blog-post-lead">{page.intro}</p>
            <div className="nav-actions rk-hero-actions">
              <Link className="btn primary" href={page.primaryCta.href}>{page.primaryCta.label}</Link>
              <Link className="btn secondary" href={page.secondaryCta.href}>{page.secondaryCta.label}</Link>
              <Link className="btn ghost" href="/cv-optimizer">See the CV optimizer</Link>
            </div>
            <p className="hero-mini-text">Start with your current resume. No need to rebuild it from scratch.</p>
          </div>
        </section>

        <section className="section fade-up">
          <div className="blog-post-section card">
            <h2 className="section-title">Quick answer</h2>
            <p>{page.quickAnswer}</p>
            <div className="rk-chip-grid">{page.secondaryKeywords.slice(0, 6).map((keyword) => <span className="rk-chip" key={keyword}>{keyword}</span>)}</div>
          </div>
        </section>

        <CtaPanel heading="Make the first useful edit" copy={`Use CVBoosta to review this ${page.primaryKeyword} intent against a real application, then keep the changes that accurately describe your work.`} primary={page.primaryCta} secondary={page.secondaryCta} />
        <SectionBlock section={directAnswer} />
        <SectionBlock section={criteria} />
        <SectionBlock section={keywords} />
        <ExampleAnalysis page={page} />
        <DataTable page={page} />
        <CtaPanel heading="Turn the review into a focused edit" copy="Use the comparison as a diagnostic, then decide which changes belong in this application version." primary={{ href: "/app", label: "Open CVBoosta" }} secondary={{ href: "/resume-keywords", label: "Find missing keywords" }} />
        <BeforeAfter page={page} />
        <CtaPanel heading="Check the version before you apply" copy="A clear revision still needs a human review. Confirm the file instructions, reading order, role fit, and every factual claim." primary={{ href: "/free-ats-resume-checker", label: "Run a free ATS check" }} secondary={{ href: "/app", label: "Analyze my resume" }} />
        <SectionBlock section={workflow} />
        <SectionBlock section={mistakes} />

        <section className="section fade-up">
          <div className="blog-post-section card">
            <h2 className="section-title">Optimization recommendations</h2>
            <ul>{page.recommendations.map((recommendation) => <li key={recommendation}>{recommendation}</li>)}</ul>
          </div>
        </section>

        <SectionBlock section={checklist} />
        <RelatedGuides page={page} />
        <CtaPanel heading="Ready to review your resume?" copy="Start with the document you have, compare it with the role you want, and make a focused version you can stand behind." primary={page.primaryCta} secondary={{ href: "/pricing", label: "Review pricing" }} />

        <section className="section fade-up" id="faq">
          <div className="blog-post-section card">
            <h2 className="section-title">Frequently asked questions</h2>
            <FaqList items={page.faq} />
          </div>
        </section>
        <CtaPanel heading="Take the next step with your current resume" copy="Open the relevant CVBoosta workflow when you are ready to inspect, edit, and review this application version." primary={{ href: "/app", label: "Open CVBoosta" }} secondary={{ href: "/register", label: "Create a CVBoosta account" }} />
      </main>
    </div>
  );
}
