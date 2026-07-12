import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CvOptimizerGuidePageClient from "../../components/CvOptimizerGuidePageClient";
import CvOptimizerGuideStructuredData from "../../components/CvOptimizerGuideStructuredData";
import {
  getCvOptimizerGuide,
  getCvOptimizerGuideSlugs,
  getRelatedCvOptimizerGuides,
} from "../../lib/cvOptimizerCluster";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getCvOptimizerGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getCvOptimizerGuide(slug);

  if (!page) {
    return {
      title: "CV Optimizer Guides | CVboosta",
      description: "Practical CV optimization guides that support the main CV optimizer workflow.",
    };
  }

  return {
    title: page.seoTitle,
    description: page.metaDescription,
    keywords: [page.primaryKeyword, ...page.secondaryKeywords],
    alternates: {
      canonical: page.canonical,
    },
  };
}

export default async function CvOptimizerChildPage({ params }: Props) {
  const { slug } = await params;
  const page = getCvOptimizerGuide(slug);

  if (!page) {
    notFound();
  }

  const relatedGuides = getRelatedCvOptimizerGuides(page.relatedSlugs).map((item) => ({
    slug: item.slug,
    h1: item.h1,
  }));

  return (
    <>
      <CvOptimizerGuideStructuredData page={page} />
      <CvOptimizerGuidePageClient page={page} relatedGuides={relatedGuides} />
    </>
  );
}
