import Script from "next/script";
import type { SeoMarkdownPage } from "../lib/seoMarkdownPages";

type Props = {
  page: SeoMarkdownPage;
  canonicalPath: string;
};

function buildArticleSchema(siteUrl: string, page: SeoMarkdownPage, canonicalPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.seoTitle,
    description: page.metaDescription,
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
    mainEntityOfPage: `${siteUrl}${canonicalPath}`,
    dateModified: page.updatedAt,
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

export default function SeoMarkdownStructuredData({ page, canonicalPath }: Props) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com";
  const faqItems = extractFaq(page);

  return (
    <>
      <Script
        id={`seo-markdown-article-${page.family}-${page.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildArticleSchema(siteUrl, page, canonicalPath)),
        }}
      />
      {faqItems.length > 0 && (
        <Script
          id={`seo-markdown-faq-${page.family}-${page.slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(faqItems)) }}
        />
      )}
    </>
  );
}
