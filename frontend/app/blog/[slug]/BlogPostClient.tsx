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

type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "italic"; value: string }
  | { type: "code"; value: string }
  | { type: "link"; label: string; href: string };

function tokenizeInline(markdown: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let i = 0;

  const pushText = (value: string) => {
    if (!value) return;
    const prev = tokens[tokens.length - 1];
    if (prev?.type === "text") {
      prev.value += value;
    } else {
      tokens.push({ type: "text", value });
    }
  };

  while (i < markdown.length) {
    // Links: [label](href)
    if (markdown[i] === "[") {
      const close = markdown.indexOf("]", i + 1);
      const openParen = close >= 0 ? markdown.indexOf("(", close + 1) : -1;
      const closeParen = openParen >= 0 ? markdown.indexOf(")", openParen + 1) : -1;
      if (close > i && openParen === close + 1 && closeParen > openParen) {
        const label = markdown.slice(i + 1, close);
        const href = markdown.slice(openParen + 1, closeParen);
        if (href.startsWith("/") || href.startsWith("http://") || href.startsWith("https://")) {
          tokens.push({ type: "link", label, href });
          i = closeParen + 1;
          continue;
        }
      }
    }

    // Inline code: `code`
    if (markdown[i] === "`") {
      const end = markdown.indexOf("`", i + 1);
      if (end > i + 1) {
        tokens.push({ type: "code", value: markdown.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    // Bold: **text**
    if (markdown.startsWith("**", i)) {
      const end = markdown.indexOf("**", i + 2);
      if (end > i + 2) {
        tokens.push({ type: "bold", value: markdown.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }

    // Italic: *text*
    if (markdown[i] === "*") {
      const end = markdown.indexOf("*", i + 1);
      if (end > i + 1) {
        tokens.push({ type: "italic", value: markdown.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    pushText(markdown[i]);
    i += 1;
  }

  return tokens;
}

function renderInline(markdown: string): ReactNode[] {
  const tokens = tokenizeInline(markdown);
  return tokens.map((token, index) => {
    if (token.type === "text") return token.value;
    if (token.type === "bold") return <strong key={`b-${index}`}>{token.value}</strong>;
    if (token.type === "italic") return <em key={`i-${index}`}>{token.value}</em>;
    if (token.type === "code") return <code key={`c-${index}`}>{token.value}</code>;
    if (token.type === "link") {
      if (token.href.startsWith("/")) {
        return (
          <Link key={`l-${index}`} href={token.href}>
            {token.label}
          </Link>
        );
      }
      return (
        <a key={`l-${index}`} href={token.href} target="_blank" rel="noopener noreferrer">
          {token.label}
        </a>
      );
    }
    return null;
  });
}

function renderMarkdownLite(markdown: string): ReactNode {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trimEnd();

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(<h3 key={`h3-${i}`}>{renderInline(line.slice(4).trim())}</h3>);
      i += 1;
      continue;
    }

    if (line.startsWith("#### ")) {
      blocks.push(<h4 key={`h4-${i}`}>{renderInline(line.slice(5).trim())}</h4>);
      i += 1;
      continue;
    }

    // Before/After pairs (common in our content): "- **Before:** ..." + "- **After:** ..."
    const beforeMatch = raw.match(/^\s*-\s+(?:\*\*)?Before:(?:\*\*)?\s*(.+)$/i);
    if (beforeMatch) {
      const beforeText = beforeMatch[1].trim();
      let afterText = "";
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j += 1;
      const afterMatch = j < lines.length ? lines[j].match(/^\s*-\s+(?:\*\*)?After:(?:\*\*)?\s*(.+)$/i) : null;
      if (afterMatch) {
        afterText = afterMatch[1].trim();
        blocks.push(
          <div className="before-after" key={`ba-${i}`}>
            <div className="before-after-card is-before">
              <div className="before-after-label">Before</div>
              <div className="before-after-text">{renderInline(beforeText)}</div>
            </div>
            <div className="before-after-card is-after">
              <div className="before-after-label">After</div>
              <div className="before-after-text">{renderInline(afterText)}</div>
            </div>
          </div>,
        );
        i = j + 1;
        continue;
      }
    }

    // Unordered list
    if (/^\s*-\s+/.test(raw)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^\s*-\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^\s*-\s+/, "").trim();
        items.push(<li key={`ul-${i}`}>{renderInline(itemText)}</li>);
        i += 1;
      }
      blocks.push(<ul key={`ul-block-${i}`}>{items}</ul>);
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(raw)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^\s*\d+\.\s+/, "").trim();
        items.push(<li key={`ol-${i}`}>{renderInline(itemText)}</li>);
        i += 1;
      }
      blocks.push(<ol key={`ol-block-${i}`}>{items}</ol>);
      continue;
    }

    // Paragraph (consume until blank line)
    const paragraphLines: string[] = [];
    while (i < lines.length && lines[i].trim()) {
      // Stop if next line begins a new block type
      const peek = lines[i];
      if (peek.startsWith("### ") || peek.startsWith("#### ") || /^\s*-\s+/.test(peek) || /^\s*\d+\.\s+/.test(peek)) {
        break;
      }
      paragraphLines.push(peek.trim());
      i += 1;
    }
    const paragraph = paragraphLines.join(" ");
    blocks.push(<p key={`p-${i}`}>{renderInline(paragraph)}</p>);
  }

  return <>{blocks}</>;
}

export default function BlogPostClient({ post, relatedRoles }: BlogPostClientProps) {
  const { t, language } = useTranslation();
  const tr = (path: string, fallback: string) => {
    const value = t(path);
    return value === path ? fallback : value;
  };

  const localizedPost = useMemo(() => localizeBlogPost(post, language), [post, language]);

  const wordCount = useMemo(() => {
    const all = localizedPost.sections.map((s) => `${s.title}\n${s.body}`).join("\n");
    const matches = all.match(/[A-Za-z0-9']+/g);
    return matches ? matches.length : 0;
  }, [localizedPost.sections]);

  const showLongformAppendix = wordCount > 0 && wordCount < 800;

  const postKey = post.translationPostKey ? `blog.posts.${post.translationPostKey}` : null;
  const title = postKey ? tr(`${postKey}.title`, localizedPost.title) : localizedPost.title;
  const lead = postKey ? tr(`${postKey}.lead`, localizedPost.lead) : localizedPost.lead;
  const takeawayTitle = postKey
    ? tr(`${postKey}.takeawayTitle`, localizedPost.takeawayTitle)
    : localizedPost.takeawayTitle;
  const takeawayBody = postKey
    ? tr(`${postKey}.takeawayBody`, localizedPost.takeawayBody)
    : localizedPost.takeawayBody;

  const ctaTitle = tr("blog.cta.title", "Tailor your resume with CVBoosta");
  const ctaBody = tr(
    "blog.cta.body",
    "Run a safe ATS scan and generate an optimized version in ~60 seconds. Review every edit before export.",
  );
  const ctaPrimary = tr("blog.cta.primary", "Optimize my resume");
  const ctaSecondary = tr("blog.cta.secondary", "Free ATS checker");
  const ctaTertiary = tr("blog.cta.tertiary", "Resume keywords by role");

  const midCtaTitle = tr("blog.cta.midTitle", "Try CVBoosta while you read");
  const midCtaBody = tr(
    "blog.cta.midBody",
    "Paste the vacancy, see missing keywords, and update only the top gaps you can prove—no keyword stuffing.",
  );

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
                {renderMarkdownLite(sectionBody)}
              </div>
            );
          })}

          <div className="blog-takeaway card">
            <h3>{midCtaTitle}</h3>
            <p>{midCtaBody}</p>
            <div className="nav-actions" style={{ marginTop: "12px" }}>
              <Link className="btn primary" href="/app">
                {ctaPrimary}
              </Link>
              <Link className="btn secondary" href="/free-ats-resume-checker">
                {ctaSecondary}
              </Link>
              <Link className="btn ghost" href="/resume-keywords">
                {ctaTertiary}
              </Link>
            </div>
          </div>

          {showLongformAppendix && (
            <div className="blog-post-section card">
              <h2>ATS Optimization Checklist (Practical, Evidence-First)</h2>
              {renderMarkdownLite(
                "If you’re using this article as a playbook, here’s a repeatable checklist that works across most roles and ATS systems. It’s designed to improve both ATS match and recruiter readability.\n\n" +
                  "### 1) Confirm clean parsing before optimizing content\n" +
                  "- Use a one-column layout\n" +
                  "- Avoid tables and text boxes for critical text\n" +
                  "- Keep job entries consistent: Title, Company, Location, Dates\n" +
                  "- Use simple bullets (hyphens) and standard headings\n\n" +
                  "If the application preview looks wrong, test a different export (PDF vs DOCX) and re-upload. Parsing stability matters because keywords can’t match if the text is misplaced or dropped.\n\n" +
                  "### 2) Extract the *repeated* job requirements (not the noise)\n" +
                  "Job descriptions contain fluff (benefits, culture, generic traits). The keywords that matter are repeated requirements tied to responsibilities and tools.\n\n" +
                  "Quick method:\n" +
                  "1. Highlight repeated nouns/phrases.\n" +
                  "2. Group them into Tools, Responsibilities, and Outcomes.\n" +
                  "3. Pick the top 5–10 that you can prove.\n" +
                  "4. Keep a short “nice-to-have” list for later.\n\n" +
                  "When in doubt, trust repetition. If a term appears multiple times (or is central to the role), it’s likely an ATS and recruiter priority.\n\n" +
                  "### 3) Place keywords where ATS and humans both scan\n" +
                  "- Summary: 3–5 role-defining terms\n" +
                  "- Skills: grouped list (avoid a wall of keywords)\n" +
                  "- Experience: bullets that include the keyword + a measurable result\n\n" +
                  "A keyword in Experience with proof is stronger than the same keyword in Skills with no context.\n\n" +
                  "### 4) Rewrite bullets using an ATS-friendly formula\n" +
                  "Use: **Action + System/Scope + Keyword + Result**.\n\n" +
                  "Examples that read human:\n" +
                  "- “Built X using Y; improved Z by 20%.”\n" +
                  "- “Implemented A with B; reduced errors and improved reliability.”\n" +
                  "- “Migrated from A to B; reduced costs and improved stability.”\n\n" +
                  "If you don’t have metrics, use scope and outcomes: users served, stakeholders supported, time saved, incidents reduced, quality improved, revenue protected.\n\n" +
                  "### 5) Prioritize the highest-leverage edits\n" +
                  "You usually don’t need a full rewrite. Start with the pieces that drive most decisions:\n" +
                  "- Summary (target role + 2–3 core keywords)\n" +
                  "- Skills (clean grouping)\n" +
                  "- First 3–6 bullets in your most recent relevant role\n\n" +
                  "Once those are aligned, the rest of the resume becomes supporting evidence rather than the primary match driver.\n\n" +
                  "### 6) Use CVBoosta to tailor in ~60 seconds\n" +
                  "CVBoosta helps you:\n" +
                  "- see a match score snapshot\n" +
                  "- identify missing keywords vs the vacancy\n" +
                  "- generate an optimized version you can review before export\n\n" +
                  "Suggested workflow:\n" +
                  "1. Upload your resume and paste the job description.\n" +
                  "2. Review missing keywords and pick the top gaps you can support.\n" +
                  "3. Generate an optimized draft, then edit for accuracy and voice.\n" +
                  "4. Re-run once to confirm the biggest gaps are closed.\n\n" +
                  "Quick actions (safe, reviewable):\n" +
                  "- **[Optimize my resume](/app)**\n" +
                  "- **[Browse resume keywords by role](/resume-keywords)**\n\n" +
                  "### 7) Avoid the 3 most common ATS mistakes\n" +
                  "- **Keyword stuffing:** repeating tools without proof (hurts readability and trust)\n" +
                  "- **Template complexity:** columns, tables, icons that break parsing\n" +
                  "- **Vague bullets:** “worked on / helped with” without outcomes\n\n" +
                  "Fix those three and most resumes move up significantly.\n\n" +
                  "### 8) Mini-FAQ\n" +
                  "#### Do I need to match every keyword?\n" +
                  "No. Match the role’s *core* requirements and prove them. A smaller set of high-impact terms placed with evidence beats a giant list.\n\n" +
                  "#### Should I copy sentences from the job post?\n" +
                  "Avoid copying full sentences. Mirror terminology where accurate, but write in your own voice and tie it to your results.\n\n" +
                  "#### What if I lack experience with a key tool?\n" +
                  "Don’t fake it. Either leave it out or add adjacent experience (similar tools, transferable work) and be clear.\n\n" +
                  "### 9) Read next (internal guides)\n" +
                  "- [How to Tailor Resume to Job Description](/blog/tailor-resume-to-job-description)\n" +
                  "- [Top ATS Resume Mistakes to Avoid](/blog/ats-resume-mistakes)\n" +
                  "- [How to Improve ATS Resume Score](/blog/improve-ats-resume-score)\n"
              )}
            </div>
          )}

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

          <div className="blog-takeaway card">
            <h3>{ctaTitle}</h3>
            <p>{ctaBody}</p>
            <div className="nav-actions" style={{ marginTop: "12px" }}>
              <Link className="btn primary" href="/app">
                {ctaPrimary}
              </Link>
              <Link className="btn secondary" href="/free-ats-resume-checker">
                {ctaSecondary}
              </Link>
              <Link className="btn ghost" href="/resume-keywords">
                {ctaTertiary}
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
