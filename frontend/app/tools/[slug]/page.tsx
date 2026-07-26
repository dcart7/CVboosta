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

const config = getSeoMarkdownConfig("tools");

export async function generateStaticParams() {
  return getSeoMarkdownSlugs("tools").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoMarkdownPage("tools", slug);

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
    keywords: [page.primaryKeyword, "resume tool", "ATS resume checker"],
  });
}

export default async function ToolSeoPage({ params }: Props) {
  const { slug } = await params;
  const page = getSeoMarkdownPage("tools", slug);
  if (!page) notFound();

  return (
    <>
      <SeoMarkdownStructuredData page={page} canonicalPath={`${config.basePath}/${page.slug}`} />
      <SeoMarkdownPageClient page={page} hubHref={config.basePath} hubLabel={config.pageHubLabel} />
    </>
  );
}
