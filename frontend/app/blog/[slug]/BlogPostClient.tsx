"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import TopNav from "../../components/TopNav";
import { useTranslation } from "../../lib/LanguageContext";
import type { BlogPost } from "../../lib/blogPosts";
import { localizeBlogPost } from "../../lib/blogLocalize";
import { localizeRoleName } from "../../lib/resumeKeywordsI18n";

type BlogPostClientProps = {
  post: BlogPost;
  relatedRoles: Array<{ slug: string; role: string }>;
};

function renderTextWithLinks(text: string): ReactNode[] {
  const pattern = /\[([^\]]+)\]\((\/[^\s)]+|https?:\/\/[^\s)]+)\)/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const [fullMatch, label, href] = match;
    const start = match.index;

    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }

    if (href.startsWith("/")) {
      nodes.push(
        <Link key={`${href}-${start}`} href={href}>
          {label}
        </Link>,
      );
    } else {
      nodes.push(
        <a key={`${href}-${start}`} href={href} target="_blank" rel="noopener noreferrer">
          {label}
        </a>,
      );
    }

    lastIndex = start + fullMatch.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  if (nodes.length === 0) {
    return [text];
  }

  return nodes;
}

export default function BlogPostClient({ post, relatedRoles }: BlogPostClientProps) {
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
                <p>{renderTextWithLinks(sectionBody)}</p>
              </div>
            );
          })}

          <div className="blog-takeaway card">
            <h3>{takeawayTitle}</h3>
            <p>{takeawayBody}</p>
          </div>

          <div className="blog-takeaway card">
            <h3>Related role guides</h3>
            <p>Explore role-specific keyword pages linked to this topic.</p>
            <div className="rk-related-grid" style={{ marginTop: "10px" }}>
              {relatedRoles.map((item) => (
                <Link
                  key={item.slug}
                  className="rk-related-link"
                  href={`/resume-keywords/${item.slug}`}
                >
                  <span>{localizeRoleName(item.role, language)}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
