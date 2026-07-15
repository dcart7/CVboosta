import type { ResumeOptimizerPage, ResumeOptimizerFaq } from "../data";
import { RESUME_OPTIMIZER_HUB_FAQ } from "../data";

type Props = {
  page?: ResumeOptimizerPage;
};

function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function buildBreadcrumb(siteUrl: string, page?: ResumeOptimizerPage) {
  const items = [
    { name: "Home", url: `${siteUrl}/` },
    { name: "Resume Optimizer", url: `${siteUrl}/resume-optimizer` },
  ];

  if (page) {
    items.push({ name: page.title, url: `${siteUrl}/resume-optimizer/${page.slug}` });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function buildFaq(items: ResumeOptimizerFaq[]) {
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

function buildArticle(siteUrl: string, page: ResumeOptimizerPage) {
  const url = `${siteUrl}/resume-optimizer/${page.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.h1,
    description: page.metaDescription,
    mainEntityOfPage: url,
    url,
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
  };
}

function buildHubSchemas(siteUrl: string) {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Resume Optimizer",
      description:
        "A practical resume optimizer hub for ATS readability, job-description matching, missing keywords, stronger bullets, and recruiter clarity.",
      url: `${siteUrl}/resume-optimizer`,
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "CVboosta",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "Resume Optimization Software",
      operatingSystem: "Web",
      description:
        "Resume and CV optimization software with ATS analysis, job-description matching, keyword gap detection, and rewrite guidance.",
      url: `${siteUrl}/cv-optimizer`,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free ATS check available",
      },
    },
    buildFaq(RESUME_OPTIMIZER_HUB_FAQ),
    buildBreadcrumb(siteUrl),
  ];
}

export default function ResumeOptimizerStructuredData({ page }: Props) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com";
  const schemas = page
    ? [buildArticle(siteUrl, page), buildFaq(page.faq), buildBreadcrumb(siteUrl, page)]
    : buildHubSchemas(siteUrl);

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`${page?.slug ?? "hub"}-resume-optimizer-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
        />
      ))}
    </>
  );
}
