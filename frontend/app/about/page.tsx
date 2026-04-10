import TopNav from "../components/TopNav";

export default function AboutPage() {
  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="hero fade-up">
          <div>
            <p className="pill">About Us</p>
            <h1 className="hero-title">About Us</h1>
            <p className="hero-subtitle">
              Smart CV Optimizer turns real experience into a CV that hiring
              teams can scan fast. You upload a CV, paste a vacancy, and get an
              ATS-friendly rewrite with missing keywords, recommendations, and a
              clean export flow.
            </p>
          </div>

          <div className="hero-card">
            <h2 className="section-title">What we focus on</h2>
            <div className="grid">
              <div className="card">
                <h3>Clarity</h3>
                <p>Readable structure, measurable impact, and sharp bullets.</p>
              </div>
              <div className="card">
                <h3>Relevance</h3>
                <p>Keyword alignment and role-specific framing that fits ATS.</p>
              </div>
              <div className="card">
                <h3>Control</h3>
                <p>
                  You see what’s missing and what to change before you apply.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section fade-up">
          <h2 className="section-title">Principles</h2>
          <div className="grid">
            <div className="hero-card">
              <p className="quote">
                “Careers belong to those who measure outcomes.”
              </p>
              <p className="quote-sub">
                Great work is not enough if impact is invisible.
              </p>
            </div>
            <div className="hero-card">
              <p className="quote">“HR doesn’t read between the lines.”</p>
              <p className="quote-sub">
                If you don’t say it clearly, it doesn’t count.
              </p>
            </div>
            <div className="hero-card">
              <p className="quote">
                “Careers aren’t made by the best, but by the clear.”
              </p>
              <p className="quote-sub">
                Make the signal obvious: skills, scope, results.
              </p>
            </div>
            <div className="hero-card">
              <p className="quote">“You’re a fit — it just doesn’t show.”</p>
              <p className="quote-sub">
                The goal is not to exaggerate. The goal is to be seen.
              </p>
            </div>
          </div>
        </section>

        <section className="section fade-up">
          <h2 className="section-title">How it works</h2>
          <div className="grid">
            <div className="card">
              <h3>1) Parse</h3>
              <p>
                We extract clean text and structure so you can iterate fast.
              </p>
            </div>
            <div className="card">
              <h3>2) Match</h3>
              <p>
                We surface the missing keywords and quantify alignment.
              </p>
            </div>
            <div className="card">
              <h3>3) Rewrite</h3>
              <p>
                We rewrite for ATS and humans, keeping claims grounded in your
                actual experience.
              </p>
            </div>
          </div>
        </section>

        <section className="section fade-up">
          <h2 className="section-title">Privacy</h2>
          <div className="card">
            <p>
              Your CV and job descriptions are used only to generate your
              results. If you are logged in, we store history so you can reopen
              previous versions and export them later.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
