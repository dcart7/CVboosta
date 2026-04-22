import type { Metadata } from "next";
import { getPublishedResumeKeywordClusters } from "../lib/resumeKeywordClusters";
import ResumeKeywordsHubClient from "./ResumeKeywordsHubClient";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Resume Keywords by Role (600 Pages) | CVboosta",
  description:
    "Browse role-based resume keyword guides with ATS terms, mistakes, bullet rewrite examples, and FAQ.",
  alternates: {
    canonical: "/resume-keywords",
  },
};

export default function ResumeKeywordsHubPage() {
  const clusters = getPublishedResumeKeywordClusters();
  return <ResumeKeywordsHubClient clusters={clusters} />;
}
