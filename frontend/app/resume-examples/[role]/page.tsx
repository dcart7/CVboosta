import Script from "next/script";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getResumeKeywordClusterBySlug,
  getRelatedResumeKeywordClusters,
  getResumeKeywordStaticSlugs,
} from "../../lib/resumeKeywordClusters";
import { buildResumeExampleSeoPage } from "../../lib/resumeExamplePages";
import ResumeExampleRoleClient from "./ResumeExampleRoleClient";

export const revalidate = 3600;

type ResumeExampleRolePageProps = {
  params: Promise<{ role: string }>;
};

export async function generateStaticParams() {
  return getResumeKeywordStaticSlugs().map((role) => ({ role }));
}

export async function generateMetadata({
  params,
}: ResumeExampleRolePageProps): Promise<Metadata> {
  const { role } = await params;
  const cluster = getResumeKeywordClusterBySlug(role);

  if (!cluster) {
    return {
      title: "Resume Examples | CVboosta",
      description: "ATS-safe resume examples by role with templates and bullet rewrites.",
    };
  }

  const related = getRelatedResumeKeywordClusters(cluster.slug, 10);
  const page = buildResumeExampleSeoPage(cluster, related);

  return {
    title: `${page.seoTitle} | CVboosta`,
    description: page.metaDescription,
    alternates: {
      canonical: `/resume-examples/${cluster.slug}`,
    },
  };
}

function buildArticleSchema(siteUrl: string, slug: string, title: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
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
    mainEntityOfPage: `${siteUrl}/resume-examples/${slug}`,
  };
}

function buildFaqSchema(faq: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export default async function ResumeExampleRolePage({ params }: ResumeExampleRolePageProps) {
  const { role } = await params;
  const cluster = getResumeKeywordClusterBySlug(role);
  if (!cluster) notFound();

  const related = getRelatedResumeKeywordClusters(cluster.slug, 10);
  const page = buildResumeExampleSeoPage(cluster, related);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com";

  const articleSchema = buildArticleSchema(siteUrl, cluster.slug, page.seoTitle, page.metaDescription);
  const faqSchema = buildFaqSchema(page.faq);

  return (
    <>
      <Script
        id={`resume-example-article-schema-${cluster.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id={`resume-example-faq-schema-${cluster.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ResumeExampleRoleClient cluster={cluster} relatedRoles={related} />
    </>
  );
}
