"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "../lib/LanguageContext";
import type { BlogPost } from "../lib/blogPosts";
import { localizeBlogPost } from "../lib/blogLocalize";

type BlogListClientProps = {
  posts: BlogPost[];
};

export default function BlogListClient({ posts }: BlogListClientProps) {
  const { t, language } = useTranslation();
  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const localizedPosts = useMemo(
    () => posts.map((post) => localizeBlogPost(post, language)),
    [posts, language],
  );

  return (
    <main className="page">
      <div className="shell">
        <section className="hero fade-up blog-hero">
          <div className="blog-hero-panel">
            <p className="pill">CVboosta Blog</p>
            <h1 className="hero-title blog-title">{tr("blog.title", "CV & ATS Blog")}</h1>
            <p className="hero-subtitle blog-subtitle">
              {tr(
                "blog.subtitle",
                "Practical guides to tailor your resume, avoid ATS pitfalls, and improve your match score.",
              )}
            </p>
          </div>
        </section>

        <section className="section fade-up blog-grid-wrap">
          <div className="grid blog-grid">
            {localizedPosts.map((post) => {
              const titleFallback = post.title;
              const excerptFallback = post.excerpt;
              const title = post.translationArticleKey
                ? tr(`blog.articles.${post.translationArticleKey}.title`, titleFallback)
                : titleFallback;
              const excerpt = post.translationArticleKey
                ? tr(`blog.articles.${post.translationArticleKey}.excerpt`, excerptFallback)
                : excerptFallback;

              return (
                <article className="card blog-card" key={post.slug}>
                  <div className="blog-meta-row">
                    {post.tags.map((tag) => (
                      <span className="blog-meta-pill" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="label blog-label">
                    {tr("blog.publishedOn", "Published")}: {post.publishAt}
                  </p>
                  <h3 className="blog-card-title">{title}</h3>
                  <p className="blog-card-excerpt">{excerpt}</p>
                  <div className="blog-card-cta">
                    <Link className="btn primary" href={`/blog/${post.slug}`}>
                      {tr("blog.readArticle", "Read article")}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
