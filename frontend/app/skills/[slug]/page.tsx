import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoMarkdownPageClient from "../../components/SeoMarkdownPageClient";
import SeoMarkdownStructuredData from "../../components/SeoMarkdownStructuredData";
import { getSeoMarkdownConfig, getSeoMarkdownPage, getSeoMarkdownSlugs } from "../../lib/seoMarkdownPages";
import { buildSeoMetadata } from "../../lib/seoMetadata";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

const config = getSeoMarkdownConfig("skills");

export async function generateStaticParams() {
  return getSeoMarkdownSlugs("skills").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoMarkdownPage("skills", slug);

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
    keywords: [page.primaryKeyword, "resume skills", "ATS keywords"],
  });
}

export default async function SkillSeoPage({ params }: Props) {
  const { slug } = await params;
  const page = getSeoMarkdownPage("skills", slug);
  if (!page) notFound();

  return (
    <>
      <SeoMarkdownStructuredData page={page} canonicalPath={`${config.basePath}/${page.slug}`} />
      <SeoMarkdownPageClient page={page} hubHref={config.basePath} hubLabel={config.pageHubLabel} />
    </>
  );
}
