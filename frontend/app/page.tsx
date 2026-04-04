import TopNav from "./components/TopNav";
import HeroActions from "./components/HeroActions";

export default function HomePage() {
  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="hero fade-up">
          <div>
            <p className="pill">
              “Smart CV Optimizer turns raw experience into a hiring‑ready
              story.”
            </p>
            <h1 className="hero-title">Your CV, tuned for real hiring teams.</h1>
            <p className="hero-subtitle">
              Upload a CV, drop the job description, and get an ATS-friendly
              rewrite with clear, honest feedback. Keep every version organized
              and ready to share.
            </p>
            <HeroActions />
          </div>
          <div className="hero-card">
            <div className="hero-grid">
              <div className="kpi">
                <h3>92%</h3>
                <p>average ATS score uplift</p>
              </div>
              <div className="kpi">
                <h3>3 min</h3>
                <p>from upload to ready draft</p>
              </div>
              <div className="kpi">
                <h3>5x</h3>
                <p>faster tailoring per role</p>
              </div>
            </div>
            <div className="section">
              <h3 className="section-title">What you get</h3>
              <div className="grid">
                <div className="card">
                  <h3>Precision rewrite</h3>
                  <p>Sharper impact bullets that map to the vacancy.</p>
                </div>
                <div className="card">
                  <h3>ATS match map</h3>
                  <p>See gaps, missing skills, and priority edits.</p>
                </div>
                <div className="card">
                  <h3>Smart history</h3>
                  <p>Every version, annotated, stored, exportable.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section fade-up">
          <h2 className="section-title">How it works</h2>
          <div className="steps">
            <div className="step">
              <span>1</span>
              <h3>Upload your CV</h3>
              <p>PDF or text, we parse, clean, and structure it.</p>
            </div>
            <div className="step">
              <span>2</span>
              <h3>Paste the job</h3>
              <p>We extract skills, priorities, and role signals.</p>
            </div>
            <div className="step">
              <span>3</span>
              <h3>Review results</h3>
              <p>Get the new draft plus honest improvement cues.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
