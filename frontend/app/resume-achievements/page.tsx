import type { Metadata } from "next";
import ProgrammaticSeoHub from "../seo-components/ProgrammaticSeoHub";
import ProgrammaticSeoStructuredData from "../seo-components/ProgrammaticSeoStructuredData";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Resume Achievements: Turn Duties Into Results | CVboosta",
  description: "Turn resume responsibilities into credible achievements with scope, outcomes, and proof. Explore role-specific examples with CVboosta.",
  alternates: { canonical: "/resume-achievements" },
  openGraph: { title: "Resume Achievements: Turn Duties Into Results | CVboosta", description: "Turn resume responsibilities into credible achievements with scope, outcomes, and proof. Explore role-specific examples with CVboosta.", url: "/resume-achievements", type: "website" },
};

export default function ResumeAchievementsHub() {
  return <><ProgrammaticSeoStructuredData cluster="resume-achievements" /><ProgrammaticSeoHub cluster="resume-achievements" /></>;
}
