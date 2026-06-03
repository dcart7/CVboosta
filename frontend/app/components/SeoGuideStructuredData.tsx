import Script from "next/script";
import type { SeoGuidePage } from "../lib/seoExpansion";

type Props = {
  page: SeoGuidePage;
  canonicalPath: string;
};

function buildArticleSchema(siteUrl: string, page: SeoGuidePage, canonicalPath: string) {
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

function extractFaq(page: SeoGuidePage) {
  const faqSection = page.sections.find((section) => section.title === "FAQ");
  if (!faqSection) return [];

  return faqSection.body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- **") && line.includes("?**"))
    .map((line) => {
      const match = line.match(/^- \*\*(.+?)\*\*\s*(.+)$/);
      if (!match) return null;
      return {
        question: match[1],
        answer: match[2],
      };
    })
    .filter((item): item is { question: string; answer: string } => Boolean(item));
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

export default function SeoGuideStructuredData({ page, canonicalPath }: Props) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com";
  const articleSchema = buildArticleSchema(siteUrl, page, canonicalPath);
  const faqItems = extractFaq(page);

  return (
    <>
      <Script
        id={`seo-guide-article-${page.family}-${page.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqItems.length > 0 && (
        <Script
          id={`seo-guide-faq-${page.family}-${page.slug}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(faqItems)) }}
        />
      )}
    </>
  );
}
