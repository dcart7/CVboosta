import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About CVboosta | ATS CV Optimization Platform",
  description:
    "Learn how CVboosta analyzes your CV against job requirements and helps you produce ATS-friendly, recruiter-readable applications.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
