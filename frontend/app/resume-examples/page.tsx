import type { Metadata } from "next";
import { getPublishedResumeKeywordClusters } from "../lib/resumeKeywordClusters";
import ResumeExamplesHubClient from "./ResumeExamplesHubClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Resume Examples by Role (950 Pages) | CVboosta",
  description:
    "Browse ATS-safe resume examples by role with summary templates, skills layout, bullet rewrites, FAQs, and a fast tailoring workflow.",
  alternates: {
    canonical: "/resume-examples",
  },
};

export default function ResumeExamplesHubPage() {
  // Keep hub payload lean: this page only needs role label, category, and slug.
  const clusters = getPublishedResumeKeywordClusters().map((item) => ({
    slug: item.slug,
    role: item.role,
    category: item.category,
  }));
  return <ResumeExamplesHubClient clusters={clusters} />;
}

