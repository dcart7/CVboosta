import Script from "next/script";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getResumeKeywordClusterBySlug,
  getResumeKeywordStaticSlugs,
} from "../../lib/resumeKeywordClusters";
import ResumeKeywordRoleClient from "./ResumeKeywordRoleClient";

export const revalidate = 3600;

type ResumeKeywordRolePageProps = {
  params: Promise<{ role: string }>;
};

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

  return {
    title: `Resume Keywords for ${cluster.role} | CVboosta`,
    description: `Top ATS keywords for ${cluster.role}, common resume mistakes, bullet rewrite examples, and practical FAQ.`,
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
  const pageDescription = `This guide shows how to build a stronger ${cluster.role} resume using ATS keyword alignment, measurable bullet rewrites, and role-specific quality checks.`;
  const articleSchema = buildArticleSchema(siteUrl, cluster.slug, cluster.role, pageDescription);
  const faqSchema = buildFaqSchema(cluster.role, cluster.faq);

  const longTailPhrases = [
    `resume keywords for ${cluster.role.toLowerCase()}`,
    `${cluster.role.toLowerCase()} resume examples`,
    `${cluster.role.toLowerCase()} ats resume tips`,
    `${cluster.role.toLowerCase()} bullet points resume`,
  ];

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
      <ResumeKeywordRoleClient cluster={cluster} longTailPhrases={longTailPhrases} />
    </>
  );
}
