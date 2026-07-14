import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoMarkdownPageClient from "../../components/SeoMarkdownPageClient";
import SeoMarkdownStructuredData from "../../components/SeoMarkdownStructuredData";
import SeoGuidePageClient from "../../components/SeoGuidePageClient";
import SeoGuideStructuredData from "../../components/SeoGuideStructuredData";
import { getSeoExpansionConfig } from "../../lib/seoExpansionConfigs";
import { getSeoExpansionPage, getSeoExpansionSlugs } from "../../lib/seoExpansion";
import { getSeoMarkdownPage, getSeoMarkdownSlugs } from "../../lib/seoMarkdownPages";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

const config = getSeoExpansionConfig("ats");

export async function generateStaticParams() {
  const slugs = Array.from(new Set([...getSeoExpansionSlugs("ats"), ...getSeoMarkdownSlugs("ats")]));
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoExpansionPage("ats", slug);

  if (!page) {
    const fallbackPage = getSeoMarkdownPage("ats", slug);
    if (!fallbackPage) {
      return {
        title: config.metadataTitle,
        description: config.metadataDescription,
      };
    }

    return {
      title: `${fallbackPage.seoTitle} | CVboosta`,
      description: fallbackPage.metaDescription,
      alternates: {
        canonical: `/ats/${fallbackPage.slug}`,
      },
    };
  }

  return {
    title: `${page.seoTitle} | CVboosta`,
    description: page.metaDescription,
    alternates: {
      canonical: `${config.basePath}/${page.slug}`,
    },
  };
}

export default async function AtsSeoPage({ params }: Props) {
  const { slug } = await params;
  const page = getSeoExpansionPage("ats", slug);
  if (!page) {
    const fallbackPage = getSeoMarkdownPage("ats", slug);
    if (!fallbackPage) notFound();

    return (
      <>
        <SeoMarkdownStructuredData page={fallbackPage} canonicalPath={`/ats/${fallbackPage.slug}`} />
        <SeoMarkdownPageClient page={fallbackPage} hubHref={config.basePath} hubLabel={config.pageHubLabel} />
      </>
    );
  }

  return (
    <>
      <SeoGuideStructuredData page={page} canonicalPath={`${config.basePath}/${page.slug}`} />
      <SeoGuidePageClient page={page} hubHref={config.basePath} hubLabel={config.pageHubLabel} />
    </>
  );
}
