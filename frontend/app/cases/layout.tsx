import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How CV and Job Matching Works | CVboosta",
  description:
    "See transparent, illustrative examples of how CVboosta compares a CV with a job description—without promises of ATS passage, interviews, or hiring.",
  alternates: { canonical: "/cases" },
  openGraph: {
    title: "How CV and Job Matching Works | CVboosta",
    description:
      "Illustrative role examples, clear product limits, and the signals CVboosta checks.",
    url: "/cases",
    type: "website",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function CasesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
