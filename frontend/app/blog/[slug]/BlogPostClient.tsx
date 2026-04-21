"use client";

import { useMemo } from "react";
import Link from "next/link";
import TopNav from "../../components/TopNav";
import { useTranslation } from "../../lib/LanguageContext";
import type { BlogPost } from "../../lib/blogPosts";
import { localizeBlogPost } from "../../lib/blogLocalize";

type BlogPostClientProps = {
  post: BlogPost;
};

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const { t, language } = useTranslation();
  const tr = (path: string, fallback: string) => {
    const value = t(path);
    return value === path ? fallback : value;
  };

  const localizedPost = useMemo(() => localizeBlogPost(post, language), [post, language]);

  const postKey = post.translationPostKey ? `blog.posts.${post.translationPostKey}` : null;
  const title = postKey ? tr(`${postKey}.title`, localizedPost.title) : localizedPost.title;
  const lead = postKey ? tr(`${postKey}.lead`, localizedPost.lead) : localizedPost.lead;
  const takeawayTitle = postKey
    ? tr(`${postKey}.takeawayTitle`, localizedPost.takeawayTitle)
    : localizedPost.takeawayTitle;
  const takeawayBody = postKey
    ? tr(`${postKey}.takeawayBody`, localizedPost.takeawayBody)
    : localizedPost.takeawayBody;

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <article className="section fade-up blog-post-wrap">
          <div className="blog-post-head card">
            <Link className="btn ghost" href="/blog">
              {tr("blog.backToBlog", "Back to blog")}
            </Link>
            <h1 className="hero-title blog-post-title">{title}</h1>
            <p className="hero-subtitle blog-post-lead">{lead}</p>
            <p className="label blog-label">
              {tr("blog.publishedOn", "Published")}: {post.publishAt}
            </p>
          </div>

          {localizedPost.sections.map((section, index) => {
            const sectionTitle = postKey
              ? tr(`${postKey}.section${index + 1}Title`, section.title)
              : section.title;
            const sectionBody = postKey
              ? tr(`${postKey}.section${index + 1}Body`, section.body)
              : section.body;

            return (
              <div className="blog-post-section card" key={`${post.slug}-${index}`}>
                <h2>{sectionTitle}</h2>
                <p>{sectionBody}</p>
              </div>
            );
          })}

          <div className="blog-takeaway card">
            <h3>{takeawayTitle}</h3>
            <p>{takeawayBody}</p>
          </div>
        </article>
      </div>
    </main>
  );
}
