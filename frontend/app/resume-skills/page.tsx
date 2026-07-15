import type { Metadata } from "next";
import ProgrammaticSeoHub from "../seo-components/ProgrammaticSeoHub";
import ProgrammaticSeoStructuredData from "../seo-components/ProgrammaticSeoStructuredData";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Resume Skills by Role: Keywords and Proof | CVboosta",
  description: "Choose relevant resume skills, connect them to evidence, and avoid keyword stuffing with role-specific guidance from CVboosta.",
  alternates: { canonical: "/resume-skills" },
  openGraph: { title: "Resume Skills by Role: Keywords and Proof | CVboosta", description: "Choose relevant resume skills, connect them to evidence, and avoid keyword stuffing with role-specific guidance from CVboosta.", url: "/resume-skills", type: "website" },
};

export default function ResumeSkillsHub() {
  return <><ProgrammaticSeoStructuredData cluster="resume-skills" /><ProgrammaticSeoHub cluster="resume-skills" /></>;
}
