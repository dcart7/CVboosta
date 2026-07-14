import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoMarkdownPageClient from "../../components/SeoMarkdownPageClient";
import SeoMarkdownStructuredData from "../../components/SeoMarkdownStructuredData";
import { getSeoMarkdownConfig, getSeoMarkdownPage, getSeoMarkdownSlugs } from "../../lib/seoMarkdownPages";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

const config = getSeoMarkdownConfig("datasets");

export async function generateStaticParams() {
  return getSeoMarkdownSlugs("datasets").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoMarkdownPage("datasets", slug);

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

export default async function DatasetSeoPage({ params }: Props) {
  const { slug } = await params;
  const page = getSeoMarkdownPage("datasets", slug);
  if (!page) notFound();

  return (
    <>
      <SeoMarkdownStructuredData page={page} canonicalPath={`${config.basePath}/${page.slug}`} />
      <SeoMarkdownPageClient page={page} hubHref={config.basePath} hubLabel={config.pageHubLabel} />
    </>
  );
}
