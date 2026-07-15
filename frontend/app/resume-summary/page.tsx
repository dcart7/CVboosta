import type { Metadata } from "next";
import ProgrammaticSeoHub from "../seo-components/ProgrammaticSeoHub";
import ProgrammaticSeoStructuredData from "../seo-components/ProgrammaticSeoStructuredData";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Resume Summary Examples and ATS Tips | CVboosta",
  description: "Write a concise resume summary for a target role. Find examples, keywords, and ATS-safe guidance with CVboosta.",
  alternates: { canonical: "/resume-summary" },
  openGraph: { title: "Resume Summary Examples and ATS Tips | CVboosta", description: "Write a concise resume summary for a target role. Find examples, keywords, and ATS-safe guidance with CVboosta.", url: "/resume-summary", type: "website" },
};

export default function ResumeSummaryHub() {
  return <><ProgrammaticSeoStructuredData cluster="resume-summary" /><ProgrammaticSeoHub cluster="resume-summary" /></>;
}
