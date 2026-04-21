"use client";

import Link from "next/link";
import TopNav from "../../components/TopNav";
import { useTranslation } from "../../lib/LanguageContext";

export default function ImproveAtsScorePostPage() {
  const { t } = useTranslation();
  const key = "blog.posts.score";
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
              {tr(`${key}.title`, "How to Improve ATS Resume Score")}
            </h1>
            <p className="hero-subtitle blog-post-lead">
              {tr(
                `${key}.lead`,
                "Improving ATS score is a process you can systematize in every application.",
              )}
            </p>
          </div>

          <div className="blog-post-section card">
            <h2>{tr(`${key}.section1Title`, "1) Match keywords by section")}</h2>
            <p>
              {tr(
                `${key}.section1Body`,
                "Place critical role keywords in summary, skills, and recent experience. This helps ATS confirm relevance quickly.",
              )}
            </p>
          </div>
          <div className="blog-post-section card">
            <h2>{tr(`${key}.section2Title`, "2) Strengthen impact bullets")}</h2>
            <p>
              {tr(
                `${key}.section2Body`,
                "Each bullet should show action + context + result. Numbers and scope increase both ATS confidence and recruiter trust.",
              )}
            </p>
          </div>
          <div className="blog-post-section card">
            <h2>{tr(`${key}.section3Title`, "3) Run a final relevance pass")}</h2>
            <p>
              {tr(
                `${key}.section3Body`,
                "Before submitting, compare your resume against role requirements one more time and close the biggest gaps first.",
              )}
            </p>
          </div>
          <div className="blog-takeaway card">
            <h3>{tr(`${key}.takeawayTitle`, "Key takeaway")}</h3>
            <p>
              {tr(
                `${key}.takeawayBody`,
                "Higher ATS score comes from clear role alignment, measurable impact, and disciplined final review.",
              )}
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
