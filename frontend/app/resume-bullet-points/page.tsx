import type { Metadata } from "next";
import ProgrammaticSeoHub from "../seo-components/ProgrammaticSeoHub";
import ProgrammaticSeoStructuredData from "../seo-components/ProgrammaticSeoStructuredData";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Resume Bullet Points: Examples, Fixes and ATS Tips | CVboosta",
  description: "Improve resume bullet points with stronger verbs, scope, keywords, and honest proof. Explore role-specific examples with CVboosta.",
  alternates: { canonical: "/resume-bullet-points" },
  openGraph: { title: "Resume Bullet Points: Examples, Fixes and ATS Tips | CVboosta", description: "Improve resume bullet points with stronger verbs, scope, keywords, and honest proof. Explore role-specific examples with CVboosta.", url: "/resume-bullet-points", type: "website" },
};

export default function ResumeBulletPointsHub() {
  return <><ProgrammaticSeoStructuredData cluster="resume-bullet-points" /><ProgrammaticSeoHub cluster="resume-bullet-points" /></>;
}
