import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "AI CV Optimizer and Free ATS Resume Checker | CVboosta",
  description:
    "Use AI to compare your CV with a real job description, find missing keywords, improve weak bullets, and create a clearer ATS-friendly application.",
  keywords: [
    "AI CV optimizer",
    "AI resume optimizer",
    "free ATS resume checker",
    "resume job description match",
    "resume keyword checker",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AI CV Optimizer and Free ATS Resume Checker | CVboosta",
    description:
      "Compare your CV with a real job description, find missing keywords, and improve the version you will actually submit.",
    url: "/",
    type: "website",
    siteName: "CVboosta",
    images: [{ url: "/logo.png", width: 800, height: 600, alt: "CVboosta AI CV optimizer" }],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
