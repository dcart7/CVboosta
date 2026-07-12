import type {
  CvOptimizerGuideFaq,
  CvOptimizerGuideHowToStep,
  CvOptimizerGuidePage,
} from "../lib/cvOptimizerCluster";

type Props = {
  page: CvOptimizerGuidePage;
};

function buildArticleSchema(siteUrl: string, page: CvOptimizerGuidePage) {
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
    mainEntityOfPage: `${siteUrl}${page.canonical}`,
    dateModified: page.updatedAt,
  };
}

function buildFaqSchema(items: CvOptimizerGuideFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: stripMarkdown(item.answer),
      },
    })),
  };
}

function buildBreadcrumbSchema(siteUrl: string, page: CvOptimizerGuidePage) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "CV Optimizer",
        item: `${siteUrl}/cv-optimizer`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: page.h1,
        item: `${siteUrl}${page.canonical}`,
      },
    ],
  };
}

function buildHowToSchema(siteUrl: string, page: CvOptimizerGuidePage, steps: CvOptimizerGuideHowToStep[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: page.h1,
    description: page.metaDescription,
    step: steps.map((step) => ({
      "@type": "HowToStep",
      name: step.name,
      text: step.text,
      url: `${siteUrl}${page.canonical}#${step.anchorId}`,
    })),
  };
}

function stripMarkdown(text: string) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function CvOptimizerGuideStructuredData({ page }: Props) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildArticleSchema(siteUrl, page)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbSchema(siteUrl, page)) }}
      />
      {page.faqItems.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema(page.faqItems)) }}
        />
      )}
      {page.howToSteps.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildHowToSchema(siteUrl, page, page.howToSteps)),
          }}
        />
      )}
    </>
  );
}
