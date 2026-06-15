import Script from "next/script";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getResumeKeywordClusterBySlug,
  getRelatedResumeKeywordClusters,
  getResumeKeywordStaticSlugs,
} from "../../lib/resumeKeywordClusters";
import ResumeKeywordRoleClient from "./ResumeKeywordRoleClient";

export const revalidate = 3600;

type ResumeKeywordRolePageProps = {
  params: Promise<{ role: string }>;
};

function truncateText(value: string, max: number): string {
  if (value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 32 ? lastSpace : cut.length).trim()}…`;
}

function buildResumeKeywordsTitle(role: string): string {
  const options = [
    `${role} Resume Keywords (2026): ATS Skills`,
    `${role} Resume Keywords (2026)`,
    `Resume Keywords for ${role} (2026)`,
    `${role} ATS Resume Keywords`,
  ];
  return options.find((item) => item.length <= 60) ?? truncateText(options[1], 60);
}

function buildResumeKeywordsDescription(
  role: string,
  keywords: string[],
): string {
  const featured = keywords
    .slice(0, 3)
    .map((item) => item.trim())
    .filter(Boolean)
    .join(", ");
  const raw = featured
    ? `Top ${role} resume keywords for ATS in 2026, plus bullet examples, mistakes, and a copy-ready checklist. Includes ${featured}.`
    : `Top ${role} resume keywords for ATS in 2026, plus bullet examples, common mistakes, and a copy-ready checklist.`;
  return truncateText(raw, 160);
}

export async function generateStaticParams() {
  return getResumeKeywordStaticSlugs().map((role) => ({ role }));
}

export async function generateMetadata({
  params,
}: ResumeKeywordRolePageProps): Promise<Metadata> {
  const { role } = await params;
  const cluster = getResumeKeywordClusterBySlug(role);

  if (!cluster) {
    return {
      title: "Resume Keywords | CVboosta",
      description: "Role-specific resume keywords and ATS optimization tips.",
    };
  }

  const description = buildResumeKeywordsDescription(cluster.role, cluster.keywords);

  return {
    title: `${buildResumeKeywordsTitle(cluster.role)} | CVboosta`,
    description,
    alternates: {
      canonical: `/resume-keywords/${cluster.slug}`,
    },
  };
}

function buildArticleSchema(siteUrl: string, slug: string, role: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Resume Keywords for ${role}`,
    description,
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
    mainEntityOfPage: `${siteUrl}/resume-keywords/${slug}`,
  };
}

function buildFaqSchema(role: string, faq: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question.replace(/\{role\}/g, role),
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer.replace(/\{role\}/g, role),
      },
    })),
  };
}

export default async function ResumeKeywordRolePage({
  params,
}: ResumeKeywordRolePageProps) {
  const { role } = await params;
  const cluster = getResumeKeywordClusterBySlug(role);

  if (!cluster) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com";
  const pageDescription = buildResumeKeywordsDescription(cluster.role, cluster.keywords);
  const articleSchema = buildArticleSchema(siteUrl, cluster.slug, cluster.role, pageDescription);
  const faqSchema = buildFaqSchema(cluster.role, cluster.faq);

  const longTailPhrases = [
    `resume keywords for ${cluster.role.toLowerCase()}`,
    `${cluster.role.toLowerCase()} resume examples`,
    `${cluster.role.toLowerCase()} ats resume tips`,
    `${cluster.role.toLowerCase()} bullet points resume`,
  ];
  const relatedRoles = getRelatedResumeKeywordClusters(cluster.slug, 10).map((item) => ({
    slug: item.slug,
    role: item.role,
  }));

  return (
    <>
      <Script
        id={`article-schema-${cluster.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id={`faq-schema-${cluster.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ResumeKeywordRoleClient
        cluster={cluster}
        longTailPhrases={longTailPhrases}
        relatedRoles={relatedRoles}
      />
    </>
  );
}
