import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Tailor Resume to Job Description | CVboosta Blog",
  description:
    "Learn a simple process to tailor your resume to a job description without keyword stuffing.",
  alternates: {
    canonical: "/blog/tailor-resume-to-job-description",
  },
};

export default function TailorResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

