import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Improve ATS Resume Score | CVboosta Blog",
  description:
    "A practical checklist to improve ATS resume score by aligning keywords, structure, and impact statements.",
  alternates: {
    canonical: "/blog/improve-ats-resume-score",
  },
};

export default function ImproveScoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

