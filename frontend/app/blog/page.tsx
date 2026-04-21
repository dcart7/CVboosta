"use client";

import Link from "next/link";
import TopNav from "../components/TopNav";
import { useTranslation } from "../lib/LanguageContext";

const articles = [
  {
    slug: "tailor-resume-to-job-description",
    key: "tailor",
    date: "2026-04-21",
  },
  {
    slug: "ats-resume-mistakes",
    key: "mistakes",
    date: "2026-04-21",
  },
  {
    slug: "improve-ats-resume-score",
    key: "score",
    date: "2026-04-21",
  },
];

export default function BlogPage() {
  const { t } = useTranslation();
  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="hero fade-up">
          <div>
            <p className="pill">CVboosta Blog</p>
            <h1 className="hero-title">{tr("blog.title", "CV & ATS Blog")}</h1>
            <p className="hero-subtitle">
              {tr(
                "blog.subtitle",
                "Practical guides to tailor your resume, avoid ATS pitfalls, and improve your match score.",
              )}
            </p>
          </div>
        </section>

        <section className="section fade-up">
          <div className="grid">
            {articles.map((article) => (
              <article className="card" key={article.slug}>
                <p className="label">
                  {tr("blog.publishedOn", "Published")}: {article.date}
                </p>
                <h3>
                  {tr(
                    `blog.articles.${article.key}.title`,
                    article.key === "tailor"
                      ? "How to Tailor Resume to Job Description"
                      : article.key === "mistakes"
                        ? "Top ATS Resume Mistakes to Avoid"
                        : "How to Improve ATS Resume Score",
                  )}
                </h3>
                <p>
                  {tr(
                    `blog.articles.${article.key}.excerpt`,
                    article.key === "tailor"
                      ? "A practical step-by-step method to adapt your resume for each role without keyword stuffing."
                      : article.key === "mistakes"
                        ? "The most common formatting and content mistakes that cause ATS rejection or low match scores."
                        : "Use this checklist to increase ATS alignment with stronger keywords, structure, and impact bullets.",
                  )}
                </p>
                <div style={{ marginTop: "16px" }}>
                  <Link className="btn primary" href={`/blog/${article.slug}`}>
                    {tr("blog.readArticle", "Read article")}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
