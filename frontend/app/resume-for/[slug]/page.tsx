import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoGuidePageClient from "../../components/SeoGuidePageClient";
import SeoGuideStructuredData from "../../components/SeoGuideStructuredData";
import { getSeoExpansionConfig } from "../../lib/seoExpansionConfigs";
import { getSeoExpansionPage, getSeoExpansionSlugs } from "../../lib/seoExpansion";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

const config = getSeoExpansionConfig("resume-for");

export async function generateStaticParams() {
  return getSeoExpansionSlugs("resume-for").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoExpansionPage("resume-for", slug);

  if (!page) {
    return {
      title: config.metadataTitle,
      description: config.metadataDescription,
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

export default async function ResumeForSeoPage({ params }: Props) {
  const { slug } = await params;
  const page = getSeoExpansionPage("resume-for", slug);
  if (!page) notFound();

  return (
    <>
      <SeoGuideStructuredData page={page} canonicalPath={`${config.basePath}/${page.slug}`} />
      <SeoGuidePageClient page={page} hubHref={config.basePath} hubLabel={config.pageHubLabel} />
    </>
  );
}
