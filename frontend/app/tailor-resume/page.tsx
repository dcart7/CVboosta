import type { Metadata } from "next";
import ProgrammaticSeoHub from "../seo-components/ProgrammaticSeoHub";
import ProgrammaticSeoStructuredData from "../seo-components/ProgrammaticSeoStructuredData";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Tailor Resume to a Job Description: Practical Guide | CVboosta",
  description: "Tailor your resume to a real job description without keyword stuffing. Prioritize skills, summary, and evidence with CVboosta.",
  alternates: { canonical: "/tailor-resume" },
  openGraph: { title: "Tailor Resume to a Job Description: Practical Guide | CVboosta", description: "Tailor your resume to a real job description without keyword stuffing. Prioritize skills, summary, and evidence with CVboosta.", url: "/tailor-resume", type: "website" },
};

export default function TailorResumeHub() {
  return <><ProgrammaticSeoStructuredData cluster="tailor-resume" /><ProgrammaticSeoHub cluster="tailor-resume" /></>;
}
