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
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "CVboosta CV-to-job matching workflow" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI CV Optimizer and Free Job Match Checker | CVboosta",
    description:
      "Compare your CV with a real job description and review the gaps before you apply.",
    images: ["/opengraph-image"],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
