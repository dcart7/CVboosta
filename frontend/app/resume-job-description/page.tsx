import type { Metadata } from "next";
import ProgrammaticSeoHub from "../seo-components/ProgrammaticSeoHub";
import ProgrammaticSeoStructuredData from "../seo-components/ProgrammaticSeoStructuredData";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Resume Job Description Match: Compare Your CV | CVboosta",
  description: "Compare a resume with a real job description, find missing keywords, and review ATS and recruiter fit before applying with CVboosta.",
  alternates: { canonical: "/resume-job-description" },
  openGraph: { title: "Resume Job Description Match: Compare Your CV | CVboosta", description: "Compare a resume with a real job description, find missing keywords, and review ATS and recruiter fit before applying with CVboosta.", url: "/resume-job-description", type: "website" },
};

export default function ResumeJobDescriptionHub() {
  return <><ProgrammaticSeoStructuredData cluster="resume-job-description" /><ProgrammaticSeoHub cluster="resume-job-description" /></>;
}
