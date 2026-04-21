"use client";

import Link from "next/link";
import TopNav from "../../components/TopNav";
import { useTranslation } from "../../lib/LanguageContext";

export default function AtsResumeMistakesPostPage() {
  const { t } = useTranslation();
  const key = "blog.posts.mistakes";
  const tr = (path: string, fallback: string) => {
    const value = t(path);
    return value === path ? fallback : value;
  };

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <article className="section fade-up">
          <Link className="btn ghost" href="/blog">
            {tr("blog.backToBlog", "Back to blog")}
          </Link>
          <h1 className="hero-title" style={{ marginTop: "18px" }}>
            {tr(`${key}.title`, "Top ATS Resume Mistakes to Avoid")}
          </h1>
          <p className="hero-subtitle">
            {tr(
              `${key}.lead`,
              "Most ATS failures come from avoidable structure and wording issues.",
            )}
          </p>

          <div className="card">
            <h2>{tr(`${key}.section1Title`, "1) Overdesigned layouts")}</h2>
            <p>
              {tr(
                `${key}.section1Body`,
                "Complex columns, tables, and visual-heavy templates can hide important text from ATS parsing. Keep structure simple and readable.",
              )}
            </p>
            <h2>{tr(`${key}.section2Title`, "2) Weak keyword alignment")}</h2>
            <p>
              {tr(
                `${key}.section2Body`,
                "If your resume does not reflect the core terms from the job description, your match score drops even when experience is relevant.",
              )}
            </p>
            <h2>{tr(`${key}.section3Title`, "3) Vague bullet points")}</h2>
            <p>
              {tr(
                `${key}.section3Body`,
                "Bullets like 'responsible for' do not show impact. Use action verbs, measurable outcomes, and role-relevant language.",
              )}
            </p>
            <h3>{tr(`${key}.takeawayTitle`, "Key takeaway")}</h3>
            <p>
              {tr(
                `${key}.takeawayBody`,
                "Use a clean format, role-specific keywords, and quantified achievements to avoid ATS rejection.",
              )}
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
