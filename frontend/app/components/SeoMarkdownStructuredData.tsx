import Script from "next/script";
import type { SeoMarkdownPage } from "../lib/seoMarkdownPages";

type Props = {
  page: SeoMarkdownPage;
  canonicalPath: string;
};

function buildArticleSchema(siteUrl: string, page: SeoMarkdownPage, canonicalPath: string) {
  const url = `${siteUrl}${canonicalPath}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.seoTitle,
    description: page.metaDescription,
    url,
    inLanguage: "en",
    keywords: [page.primaryKeyword, page.family, "resume", "ATS"],
    about: [
      { "@type": "Thing", name: page.primaryKeyword },
      { "@type": "Thing", name: "ATS-friendly resume optimization" },
    ],
    author: {
      "@type": "Organization",
      name: "CVboosta",
    },
    publisher: {
      "@type": "Organization",
      name: "CVboosta",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: url,
    dateModified: page.updatedAt,
  };
}

function buildBreadcrumbSchema(siteUrl: string, page: SeoMarkdownPage, canonicalPath: string) {
  const hubUrl = `${siteUrl}/${page.family}`;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}/` },
      { "@type": "ListItem", position: 2, name: page.family.replace(/-/g, " "), item: hubUrl },
      { "@type": "ListItem", position: 3, name: page.h1, item: `${siteUrl}${canonicalPath}` },
    ],
  };
}

function stripMarkdown(text: string) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFaq(page: SeoMarkdownPage) {
  const faqSection = page.sections.find((section) => section.title.trim().toLowerCase() === "faq");
  if (!faqSection) return [];

  const lines = faqSection.markdown.split("\n");
  const items: Array<{ question: string; answer: string }> = [];
  let currentQuestion = "";
  let answerLines: string[] = [];

  const flush = () => {
    if (!currentQuestion) return;
    const answer = stripMarkdown(answerLines.join(" ").trim());
    if (answer) {
      items.push({ question: currentQuestion, answer });
    }
    currentQuestion = "";
    answerLines = [];
  };

  for (const line of lines) {
    if (line.startsWith("### ")) {
      flush();
      currentQuestion = line.slice(4).trim();
      continue;
    }

    if (currentQuestion) {
      answerLines.push(line.trim());
    }
  }

  flush();
  return items;
}

function buildFaqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function SeoMarkdownStructuredData({ page, canonicalPath }: Props) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com";
  const faqItems = extractFaq(page);

  return (
    <>
      <Script
        id={`seo-markdown-article-${page.family}-${page.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildArticleSchema(siteUrl, page, canonicalPath)),
        }}
      />
      <Script
        id={`seo-markdown-breadcrumb-${page.family}-${page.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(buildBreadcrumbSchema(siteUrl, page, canonicalPath)),
        }}
      />
      {faqItems.length > 0 && (
        <Script
          id={`seo-markdown-faq-${page.family}-${page.slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(buildFaqSchema(faqItems)) }}
        />
      )}
    </>
  );
}
