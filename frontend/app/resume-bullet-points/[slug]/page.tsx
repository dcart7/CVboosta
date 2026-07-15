import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProgrammaticSeoPage from "../../seo-components/ProgrammaticSeoPage";
import ProgrammaticSeoStructuredData from "../../seo-components/ProgrammaticSeoStructuredData";
import { getEnabledSeoPages, getSeoPage } from "../../seo-data";

export const revalidate = 3600;
export const dynamicParams = false;
type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getEnabledSeoPages("resume-bullet-points").map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getSeoPage("resume-bullet-points", slug);
  if (!page) return {};
  const canonical = `/resume-bullet-points/${page.slug}`;
  return { title: page.metaTitle, description: page.metaDescription, keywords: [page.primaryKeyword, ...page.secondaryKeywords], alternates: { canonical }, openGraph: { title: page.metaTitle, description: page.metaDescription, url: canonical, type: "article" }, twitter: { card: "summary_large_image", title: page.metaTitle, description: page.metaDescription } };
}

export default async function ResumeBulletPointsPage({ params }: Props) {
  const { slug } = await params;
  const page = getSeoPage("resume-bullet-points", slug);
  if (!page) notFound();
  return <><ProgrammaticSeoStructuredData cluster="resume-bullet-points" page={page} /><ProgrammaticSeoPage page={page} /></>;
}
