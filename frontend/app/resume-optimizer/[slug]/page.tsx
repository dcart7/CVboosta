import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ResumeOptimizerPage from "../components/ResumeOptimizerPage";
import ResumeOptimizerStructuredData from "../components/ResumeOptimizerStructuredData";
import {
  getResumeOptimizerPage,
  RESUME_OPTIMIZER_PAGES,
} from "../data";

export const revalidate = 3600;
export const dynamicParams = false;

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return RESUME_OPTIMIZER_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getResumeOptimizerPage(slug);

  if (!page) {
    return {};
  }

  const canonical = `/resume-optimizer/${page.slug}`;
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: [page.title, "resume optimizer", ...page.keywords],
    alternates: { canonical },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: canonical,
      type: "article",
      siteName: "CVboosta",
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
    },
  };
}

export default async function ResumeOptimizerChildPage({ params }: Props) {
  const { slug } = await params;
  const page = getResumeOptimizerPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <>
      <ResumeOptimizerStructuredData page={page} />
      <ResumeOptimizerPage page={page} />
    </>
  );
}
