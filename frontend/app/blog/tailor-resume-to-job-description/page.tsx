"use client";

import Link from "next/link";
import TopNav from "../../components/TopNav";
import { useTranslation } from "../../lib/LanguageContext";

export default function TailorResumePostPage() {
  const { t } = useTranslation();
  const key = "blog.posts.tailor";
  const tr = (path: string, fallback: string) => {
    const value = t(path);
    return value === path ? fallback : value;
  };

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <article className="section fade-up blog-post-wrap">
          <div className="blog-post-head card">
            <Link className="btn ghost" href="/blog">
              {tr("blog.backToBlog", "Back to blog")}
            </Link>
            <h1 className="hero-title blog-post-title">
              {tr(`${key}.title`, "How to Tailor Resume to Job Description")}
            </h1>
            <p className="hero-subtitle blog-post-lead">
              {tr(
                `${key}.lead`,
                "Tailoring your resume is about relevance, not rewriting everything from scratch.",
              )}
            </p>
          </div>

          <div className="blog-post-section card">
            <h2>{tr(`${key}.section1Title`, "1) Extract the role priorities")}</h2>
            <p>
              {tr(
                `${key}.section1Body`,
                "Read the job description and list repeated skills, tools, and outcomes. These repeated signals are what ATS and recruiters focus on first.",
              )}
            </p>
          </div>
          <div className="blog-post-section card">
            <h2>{tr(`${key}.section2Title`, "2) Align your strongest evidence")}</h2>
            <p>
              {tr(
                `${key}.section2Body`,
                "For each priority, map a real example from your experience. Update summary, skills, and bullet points so the match is obvious in the first scan.",
              )}
            </p>
          </div>
          <div className="blog-post-section card">
            <h2>{tr(`${key}.section3Title`, "3) Keep wording clear and truthful")}</h2>
            <p>
              {tr(
                `${key}.section3Body`,
                "Use the employer's terminology where accurate, but avoid copying whole sentences. Your goal is precise alignment, not artificial keyword stuffing.",
              )}
            </p>
          </div>
          <div className="blog-takeaway card">
            <h3>{tr(`${key}.takeawayTitle`, "Key takeaway")}</h3>
            <p>
              {tr(
                `${key}.takeawayBody`,
                "A tailored resume wins by showing direct role fit with credible evidence and clear wording.",
              )}
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
