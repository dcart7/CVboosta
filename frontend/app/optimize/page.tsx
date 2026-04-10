"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import { getApiBase } from "../lib/apiBase";

export default function OptimizePage() {
  const apiBase = getApiBase();
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [status, setStatus] = useState("");
  const [previewSummary, setPreviewSummary] = useState("");
  const [matchPercent, setMatchPercent] = useState<number | null>(null);
  const [missingCount, setMissingCount] = useState<number>(0);

  useEffect(() => {
    setTargetRole(localStorage.getItem("target_role") || "");
    setTargetCompany(localStorage.getItem("target_company") || "");
    const optimized = localStorage.getItem("optimized_cv") || "";
    if (optimized) {
      setPreviewSummary(optimized.split("\n")[0] || optimized);
    } else {
      const cvText = localStorage.getItem("cv_text") || "";
      setPreviewSummary(cvText.split(".")[0] || "—");
    }

    const cvText = localStorage.getItem("cv_text") || "";
    const jobText = localStorage.getItem("job_text") || "";
    if (cvText && jobText) {
      fetch(`${apiBase}/analyze/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_text: cvText, job_text: jobText }),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          setMatchPercent(data.match_percent ?? null);
          setMissingCount((data.missing_keywords || []).length);
        })
        .catch(() => {
          setMatchPercent(null);
          setMissingCount(0);
        });
    }
  }, []);

  const runOptimization = async () => {
    const cvText = localStorage.getItem("cv_text") || "";
    const jobText = localStorage.getItem("job_text") || "";
    const token = localStorage.getItem("auth_token") || "";
    if (!cvText || !jobText) {
      setStatus("Upload CV and job description first.");
      return;
    }
    setStatus("Optimizing...");
    try {
      const response = await fetch(`${apiBase}/optimize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          cv_text: cvText,
          job_text: jobText,
          cv_analysis: "",
          job_analysis: "",
          target_role: targetRole,
          target_company: targetCompany,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setStatus(payload.detail || "Optimization failed.");
        return;
      }
      const data = await response.json();
      localStorage.setItem("optimized_cv", data.optimized_cv || "");
      localStorage.setItem(
        "missing_skills",
        JSON.stringify(data.missing_skills || []),
      );
      localStorage.setItem(
        "recommendations",
        JSON.stringify(data.recommendations || []),
      );
      if (typeof data.match_before === "number") {
        localStorage.setItem("match_before", String(data.match_before));
      }
      if (typeof data.match_after === "number") {
        localStorage.setItem("match_after", String(data.match_after));
      }
      setStatus("Done. Opening results...");
      window.location.href = "/results";
    } catch (err) {
      setStatus(
        err instanceof Error
          ? err.message
          : "Cannot reach backend. Check that it is running.",
      );
    }
  };

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="split fade-up">
          <div className="form-card">
            <h2 className="section-title">Optimization controls</h2>
            <div className="form-grid">
              <div>
                <div className="label">Tone</div>
                <select className="select">
                  <option>Professional</option>
                  <option>Executive</option>
                  <option>Creative</option>
                </select>
              </div>
              <div>
                <div className="label">Focus areas</div>
                <input
                  className="input"
                  placeholder="Leadership, Strategy, Metrics"
                />
              </div>
              <div>
                <div className="label">Include keywords</div>
                <input
                  className="input"
                  placeholder="Analytics, Roadmap, GTM"
                />
              </div>
            </div>
            <div className="nav-actions">
              <button className="btn primary" type="button" onClick={runOptimization}>
                Run optimization
              </button>
              <Link className="btn ghost" href="/analyze">
                Back to analysis
              </Link>
            </div>
            {status && <p>{status}</p>}
          </div>

          <div className="hero-card">
            <h2 className="section-title">Draft preview</h2>
            <div className="result-box">
              <h3>Optimized summary</h3>
              <p>{previewSummary || "—"}</p>
            </div>
            <div className="section">
              <h3 className="section-title">Confidence signals</h3>
              <div className="grid">
                <div className="card">
                  <h3>Keyword alignment</h3>
                  <p>
                    {matchPercent !== null ? `${matchPercent}%` : "—"} match to
                    target posting
                  </p>
                </div>
                <div className="card">
                  <h3>Impact clarity</h3>
                  <p>{missingCount} missing keywords detected</p>
                </div>
              </div>
            </div>
            <div className="section">
              <h3 className="section-title">Target</h3>
              <div className="card">
                <p>{targetRole || "Role not set"} · {targetCompany || "Company not set"}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
