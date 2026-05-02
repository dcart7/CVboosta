import Link from "next/link";
import type { Metadata } from "next";
import FreeAtsCtasClient from "./FreeAtsCtasClient";

export const metadata: Metadata = {
  title: "Free ATS Resume Checker (No Signup) | CVboosta",
  description:
    "Check your resume against a job description for free. Get ATS match score and missing keywords without registration.",
  alternates: {
    canonical: "/free-ats-resume-checker",
  },
};

export default function FreeAtsResumeCheckerPage() {
  return (
    <main className="page">
      <div className="shell">
        <section className="hero fade-up">
          <div style={{ maxWidth: "900px", width: "100%" }}>
            <p className="pill">Free tool</p>
            <h1 className="hero-title">Free ATS Resume Checker</h1>
            <p className="hero-subtitle">
              Run CV analysis and ATS match scoring with no signup required.
              Upload your CV, paste the job description, and see missing keywords in minutes.
            </p>
            <FreeAtsCtasClient />
          </div>
        </section>
      </div>
    </main>
  );
}
