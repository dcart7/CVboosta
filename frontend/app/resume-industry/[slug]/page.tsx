import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoGuidePageClient from "../../components/SeoGuidePageClient";
import SeoGuideStructuredData from "../../components/SeoGuideStructuredData";
import { getSeoExpansionConfig } from "../../lib/seoExpansionConfigs";
import { getSeoExpansionPage, getSeoExpansionSlugs } from "../../lib/seoExpansion";
import { buildSeoMetadata } from "../../lib/seoMetadata";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

const config = getSeoExpansionConfig("resume-industry");

export async function generateStaticParams() {
  return getSeoExpansionSlugs("resume-industry").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoExpansionPage("resume-industry", slug);

  if (!page) {
    return {
      title: config.metadataTitle,
      description: config.metadataDescription,
    };
  }

  return buildSeoMetadata({
    title: page.seoTitle,
    description: page.metaDescription,
    canonical: `${config.basePath}/${page.slug}`,
    keywords: [page.h1, page.context?.industry || "resume", "ATS"],
  });
}

export default async function ResumeIndustrySeoPage({ params }: Props) {
  const { slug } = await params;
  const page = getSeoExpansionPage("resume-industry", slug);
  if (!page) notFound();

  return (
    <>
      <SeoGuideStructuredData page={page} canonicalPath={`${config.basePath}/${page.slug}`} />
      <SeoGuidePageClient page={page} hubHref={config.basePath} hubLabel={config.pageHubLabel} />
    </>
  );
}
