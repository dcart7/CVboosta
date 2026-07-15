import {
  getSeoHubConfig,
  getSeoHubFaq,
  type SeoCluster,
  type SeoFaq,
  type SeoPage,
} from "../seo-data";

type Props = {
  cluster: SeoCluster;
  page?: SeoPage;
};

function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function breadcrumb(siteUrl: string, cluster: SeoCluster, page?: SeoPage) {
  const config = getSeoHubConfig(cluster);
  const items = [
    { name: "Home", url: `${siteUrl}/` },
    { name: config.h1, url: `${siteUrl}/${cluster}` },
  ];
  if (page) items.push({ name: page.h1, url: `${siteUrl}/${cluster}/${page.slug}` });
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

function faqSchema(items: SeoFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

function articleSchema(siteUrl: string, cluster: SeoCluster, page: SeoPage) {
  const url = `${siteUrl}/${cluster}/${page.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.h1,
    description: page.metaDescription,
    mainEntityOfPage: url,
    url,
    author: { "@type": "Organization", name: "CVboosta" },
    publisher: {
      "@type": "Organization",
      name: "CVboosta",
      logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
    },
  };
}

function pageSchema(siteUrl: string, cluster: SeoCluster, page?: SeoPage) {
  const config = getSeoHubConfig(cluster);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page?.h1 ?? config.h1,
    description: page?.metaDescription ?? config.description,
    url: `${siteUrl}/${cluster}${page ? `/${page.slug}` : ""}`,
  };
}

function howToSchema(page: SeoPage) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: page.h1,
    description: page.quickAnswer,
    step: [
      { "@type": "HowToStep", name: "Start with the current resume", text: "Use the resume you already have and identify the target role." },
      { "@type": "HowToStep", name: "Read the target vacancy", text: "Separate requirements, responsibilities, skills, and outcomes." },
      { "@type": "HowToStep", name: "Make focused edits", text: "Improve the most relevant wording and evidence without adding unsupported claims." },
      { "@type": "HowToStep", name: "Review before applying", text: "Check parsing, clarity, file instructions, and the truthfulness of every suggestion." },
    ],
  };
}

export default function ProgrammaticSeoStructuredData({ cluster, page }: Props) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com").replace(/\/$/, "");
  const schemas = page
    ? [
        articleSchema(siteUrl, cluster, page),
        pageSchema(siteUrl, cluster, page),
        faqSchema(page.faq),
        breadcrumb(siteUrl, cluster, page),
        ...(page.pageType === "how-to" ? [howToSchema(page)] : []),
      ]
    : [
        pageSchema(siteUrl, cluster),
        faqSchema(getSeoHubFaq(cluster)),
        breadcrumb(siteUrl, cluster),
      ];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`${cluster}-${page?.slug ?? "hub"}-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(schema) }}
        />
      ))}
    </>
  );
}
