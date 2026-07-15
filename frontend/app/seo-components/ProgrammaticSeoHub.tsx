import Link from "next/link";
import TopNav from "../components/TopNav";
import {
  getSeoHubConfig,
  getSeoHubFaq,
  getSeoPages,
  type SeoCluster,
  type SeoFaq,
  type SeoPage,
} from "../seo-data";

const HUB_DETAILS: Record<SeoCluster, { answer: string; columns: string[]; rows: string[][]; before: string; after: string }> = {
  "resume-job-description": { answer: "A resume job-description match review compares one resume with one vacancy. It helps you spot relevant evidence, unsupported gaps, ATS-readable structure, and wording that should be clearer before you apply.", columns: ["Signal", "Review", "Next move"], rows: [["Requirements", "Must-have skills and responsibilities", "Map supported evidence"], ["Resume", "Summary, skills, and recent experience", "Improve the highest-value section"], ["Readability", "Text order and file instructions", "Fix parsing risks"]], before: "Experienced professional with broad skills.", after: "Experienced professional aligning customer operations, reporting, and process improvement evidence with the target role.", },
  "tailor-resume": { answer: "Tailoring a resume means changing the emphasis for one real job while keeping the underlying experience truthful. Start with the job description, then adjust the summary, skills, and strongest evidence in priority order.", columns: ["Section", "Tailor", "Avoid"], rows: [["Summary", "Target role and strongest fit", "Generic career objective"], ["Skills", "Supported vacancy language", "Detached keyword stuffing"], ["Experience", "Relevant action and proof", "Invented results"]], before: "Managed projects and worked with different teams.", after: "Coordinated a cross-functional delivery plan, clarified dependencies, and kept launch decisions visible to product and engineering stakeholders.", },
  "resume-bullet-points": { answer: "Strong resume bullet points show action, context, scope, and proof in a compact line. Rewrite the duty first, then add the method, stakeholder, deliverable, or verified metric that makes the contribution concrete.", columns: ["Weak pattern", "Better pattern", "Why"], rows: [["Responsible for", "Action plus scope", "Shows ownership"], ["Helped with", "Specific contribution", "Reduces ambiguity"], ["Worked on", "Deliverable or decision", "Adds evidence"]], before: "Responsible for improving team processes.", after: "Mapped the team handoff process, documented recurring blockers, and proposed a clearer review step for the next cycle.", },
  "resume-summary": { answer: "A resume summary is a short positioning statement near the top of the document. It should tell the reader what you do, where you add value, and which evidence is most relevant to the target role.", columns: ["Element", "Include", "Avoid"], rows: [["Direction", "Target role or specialty", "Broad ambition"], ["Evidence", "Relevant domain or work", "Unverifiable superlatives"], ["Keywords", "Supported role language", "Disconnected list"]], before: "Hardworking professional seeking a challenging opportunity.", after: "Customer-success professional focused on onboarding, adoption, and proactive account communication for SaaS customers.", },
  "resume-skills": { answer: "The best resume skills are relevant, supported, and easy to find. Use the target vacancy to prioritize skills, then connect important tools and capabilities to a project, responsibility, decision, or result in the experience section.", columns: ["Skill signal", "Proof", "Placement"], rows: [["Tool", "Where and how it was used", "Skills plus experience"], ["Capability", "Method or decision", "Summary or bullets"], ["Keyword", "Supported context", "Natural wording"]], before: "Skills: communication, teamwork, leadership, Microsoft Office.", after: "Skills: stakeholder reporting, process coordination, Excel modeling, customer communication; each supported by a relevant work example.", },
  "resume-achievements": { answer: "Resume achievements explain what changed because of your work. Start with a responsibility, identify the action or decision, and add a verified result, quality signal, scope, or handoff rather than inventing a number.", columns: ["Duty", "Achievement frame", "Proof"], rows: [["Task", "Action and context", "Deliverable"], ["Support", "Contribution and scope", "Decision or handoff"], ["Result", "Change or quality signal", "Verified metric"]], before: "Supported the monthly reporting process.", after: "Prepared monthly reporting inputs, investigated unusual variances, and documented commentary used in the department review.", },
};

function CtaPanel({ cluster, compact = false }: { cluster: SeoCluster; compact?: boolean }) {
  const href = cluster === "resume-job-description" ? "/free-ats-resume-checker" : "/app";
  return (
    <section className="blog-takeaway card">
      <h2 className="section-title">{compact ? "Start with one real application" : "Use CVBoosta with your current resume"}</h2>
      <p>{compact ? "Choose a guide for the immediate task, then review the document against the vacancy or section you are improving." : "Run a focused review, compare the wording with a real target role, and keep only the suggestions that accurately describe your experience."}</p>
      <div className="nav-actions rk-hero-actions">
        <Link className="btn primary" href={href}>{href === "/app" ? "Open CVBoosta" : "Run a free ATS check"}</Link>
        <Link className="btn secondary" href="/cv-optimizer">See the CV optimizer</Link>
        <Link className="btn ghost" href="/pricing">Review pricing</Link>
      </div>
      <p className="hero-mini-text">Keep your experience truthful. Review every suggestion before applying.</p>
    </section>
  );
}

function FaqList({ items }: { items: SeoFaq[] }) {
  return <div className="rk-faq-list">{items.map((item) => <details className="rk-faq-item" key={item.question}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div>;
}

export default function ProgrammaticSeoHub({ cluster }: { cluster: SeoCluster }) {
  const config = getSeoHubConfig(cluster);
  const details = HUB_DETAILS[cluster];
  const pages = getSeoPages(cluster);
  const groups = Array.from(new Set(pages.map((page) => page.pageType)));
  return (
    <div className="page">
      <TopNav />
      <main className="shell blog-post-wrap">
        <nav className="rk-breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>{config.h1}</span></nav>
        <section className="hero fade-up rk-hero">
          <div className="rk-hero-panel blog-post-head">
            <p className="pill">CVBoosta SEO guide</p>
            <h1 className="blog-post-title">{config.h1}</h1>
            <p className="blog-post-lead">{config.subtitle}</p>
            <div className="nav-actions rk-hero-actions">
              <Link className="btn primary" href="/app">Open CVBoosta</Link>
              <Link className="btn secondary" href="/free-ats-resume-checker">Run a free ATS check</Link>
              <Link className="btn ghost" href="/register">Start with my current resume</Link>
            </div>
            <p className="hero-mini-text">No need to rebuild your resume from scratch.</p>
          </div>
        </section>

        <section className="section fade-up"><div className="blog-post-section card"><h2 className="section-title">Quick answer</h2><p>{details.answer}</p></div></section>
        <CtaPanel cluster={cluster} compact />
        <section className="section fade-up"><div className="blog-post-section card"><h2 className="section-title">How this workflow helps</h2><p>{config.subtitle} Start with one real resume and one real application, then make the smallest useful edit.</p><div className="steps">{["Identify the target signal", "Compare it with your current resume", "Improve the clearest evidence", "Review before applying"].map((step, index) => <div className="step" key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong><p>Keep the change specific, readable, and supported by facts from your experience.</p></div>)}</div></div></section>

        <section className="section fade-up"><div className="blog-post-section card"><h2 className="section-title">A practical review map</h2><div className="seo-table-wrap"><table><thead><tr>{details.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{details.rows.map((row) => <tr key={row.join("|")}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div></div></section>
        <section className="section fade-up"><div className="blog-post-section card"><h2 className="section-title">Before and after</h2><div className="before-after"><div className="before-after-card before-card"><span className="before-after-label">Before</span><p className="before-after-text">{details.before}</p></div><div className="before-after-card after-card"><span className="before-after-label">After</span><p className="before-after-text">{details.after}</p></div></div><p>Use the structure as a prompt, not as a claim. Replace the demonstration wording with facts, scope, and metrics from your own work.</p></div></section>
        <CtaPanel cluster={cluster} />

        <section className="section fade-up"><div className="blog-post-section card"><h2 className="section-title">Explore every {config.h1.toLowerCase()} guide</h2><p>These pages are grouped by intent so the cluster is useful for both broad research and the next specific edit.</p>{groups.map((group) => <div className="rk-category-block" key={group}><h3 className="rk-category-title">{group.replace(/-/g, " ")}</h3><div className="rk-role-grid">{pages.filter((page) => page.pageType === group).map((page: SeoPage) => <article className="rk-role-card" key={page.slug}><p className="rk-role-card-kicker">{page.priorityTier === 1 ? "Core guide" : page.priorityTier === 2 ? "Supporting guide" : "Focused guide"}</p><h4 className="rk-role-card-title">{page.h1}</h4><p className="rk-role-card-copy">{page.quickAnswer}</p><Link className="btn ghost rk-role-card-btn" href={`/${page.cluster}/${page.slug}`}>Read this guide <span aria-hidden="true">→</span></Link></article>)}</div></div>)}</div></section>

        <section className="section fade-up"><div className="blog-post-section card"><h2 className="section-title">Frequently asked questions</h2><FaqList items={getSeoHubFaq(cluster)} /></div></section>
        <CtaPanel cluster={cluster} />
      </main>
    </div>
  );
}
