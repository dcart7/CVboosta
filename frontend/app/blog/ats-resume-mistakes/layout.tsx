import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top ATS Resume Mistakes to Avoid | CVboosta Blog",
  description:
    "Avoid the most common ATS resume mistakes that reduce match score and recruiter visibility.",
  alternates: {
    canonical: "/blog/ats-resume-mistakes",
  },
};

export default function AtsMistakesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

