"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "../components/TopNav";

export default function WorkspacePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [parsed, setParsed] = useState<{
    raw_text: string;
    skills: string[];
    work_experience: string[];
    education: string[];
    achievements: string[];
  } | null>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [jobText, setJobText] = useState("");
  const [analysisStatus, setAnalysisStatus] = useState("");
  const [matchPercent, setMatchPercent] = useState<number | null>(null);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [optimizedSummary, setOptimizedSummary] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const upload = async () => {
    if (!file) {
      setStatus("Please choose a file first.");
      return;
    }
    setStatus("Uploading...");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`${apiBase}/analyze/upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || "Upload failed");
      }
      const data = await response.json();
      setParsed(data);
      if (userEmail) {
        localStorage.setItem(`parsed_cv:${userEmail}`, JSON.stringify(data));
      }
      localStorage.setItem("cv_text", data.raw_text || "");
      setStatus("CV parsed successfully.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleFileSelect = (selected: File | null) => {
    if (!selected) return;
    setFile(selected);
    setStatus("");
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const dropped = event.dataTransfer.files?.[0] || null;
    handleFileSelect(dropped);
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const load = async () => {
      if (token) {
        try {
          const response = await fetch(`${apiBase}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            if (data?.email) {
              setUserEmail(data.email);
              const storedParsed = localStorage.getItem(
                `parsed_cv:${data.email}`,
              );
              if (storedParsed) {
                setParsed(JSON.parse(storedParsed));
              } else {
                setParsed(null);
              }
            }
          } else {
            setParsed(null);
          }
        } catch {
          setParsed(null);
        }
      } else {
        setParsed(null);
      }

      setTargetRole(localStorage.getItem("target_role") || "");
      setTargetCompany(localStorage.getItem("target_company") || "");
      setJobText(localStorage.getItem("job_text") || "");
    };

    load();
  }, [apiBase]);

  const runAnalysis = async () => {
    if (!parsed?.raw_text) {
      setAnalysisStatus("Upload a CV first.");
      return;
    }
    if (!jobText.trim()) {
      setAnalysisStatus("Paste a job description first.");
      return;
    }
    localStorage.setItem("target_role", targetRole);
    localStorage.setItem("target_company", targetCompany);
    localStorage.setItem("job_text", jobText);
    localStorage.setItem("cv_text", parsed.raw_text || "");
    setAnalysisStatus("Analyzing...");
    try {
      const response = await fetch(`${apiBase}/analyze/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cv_text: parsed.raw_text || "",
          job_text: jobText,
        }),
      });
      if (!response.ok) {
        throw new Error("Analysis failed.");
      }
      const data = await response.json();
      setMatchPercent(data.match_percent ?? null);
      setMissingKeywords(data.missing_keywords || []);
      setAnalysisStatus("Analysis complete.");
    } catch (err) {
      setAnalysisStatus(err instanceof Error ? err.message : "Analysis failed.");
    }
  };

  const runOptimization = async () => {
    if (!parsed?.raw_text || !jobText.trim()) {
      setStatus("Upload CV and paste job description first.");
      return;
    }
    const token = localStorage.getItem("auth_token") || "";
    setStatus("Optimizing...");
    setIsOptimizing(true);
    const response = await fetch(`${apiBase}/optimize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        cv_text: parsed.raw_text || "",
        job_text: jobText,
        cv_analysis: "",
        job_analysis: "",
        target_role: targetRole,
        target_company: targetCompany,
      }),
    });
    try {
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
      setOptimizedSummary((data.optimized_cv || "").split("\n")[0] || "—");
      setRecommendations(data.recommendations || []);
      setStatus("Optimization complete.");
      router.push("/results");
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="split fade-up">
          <div className="form-card form-grid">
            <div className="pill">Dashboard — all steps in one place</div>
            <div>
              <h2 className="section-title">1. Upload CV</h2>
              <div
                className={`upload${isDragging ? " is-dragging" : ""}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <strong>Drop your CV file</strong>
                <span>PDF or TXT. Max 12,000 characters.</span>
                <input
                  className="input"
                  type="file"
                  accept=".pdf,.txt"
                  onChange={(event) =>
                    handleFileSelect(event.target.files?.[0] || null)
                  }
                />
                {file && <span>Selected: {file.name}</span>}
                <button className="btn" type="button" onClick={upload}>
                  Upload & parse
                </button>
              </div>
            </div>
            {status && <p>{status}</p>}
            {parsed?.skills && (
              <div className="card">
                <h3>Detected skills</h3>
                <p>{parsed.skills.join(", ") || "—"}</p>
              </div>
            )}
            <div>
              <div className="label">2. Target role</div>
              <input
                className="input"
                placeholder="Senior Product Designer"
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
              />
            </div>
            <div>
              <div className="label">Company</div>
              <input
                className="input"
                placeholder="Fintech Labs"
                value={targetCompany}
                onChange={(event) => setTargetCompany(event.target.value)}
              />
            </div>
            <div>
              <div className="label">3. Job description</div>
              <textarea
                className="textarea"
                placeholder="Paste the vacancy description here..."
                value={jobText}
                onChange={(event) => setJobText(event.target.value)}
              />
            </div>
            <div className="nav-actions">
              <button className="btn primary" type="button" onClick={runAnalysis}>
                Run analysis
              </button>
              <Link className="btn ghost" href="/history">
                View history
              </Link>
            </div>
            {analysisStatus && <p>{analysisStatus}</p>}
            <div className="card">
              <h3>Analysis snapshot</h3>
              <p>
                Match score:{" "}
                {matchPercent !== null ? `${matchPercent}%` : "—"} · Missing
                keywords: {missingKeywords.length}
              </p>
            </div>
            <div className="nav-actions">
              <button
                className="btn secondary"
                type="button"
                onClick={runOptimization}
                disabled={isOptimizing}
              >
                Generate optimized CV
              </button>
              <Link className="btn ghost" href="/results">
                View latest results
              </Link>
            </div>
            {isOptimizing && (
              <div className="progress" role="status" aria-live="polite">
                <span className="progress-bar" />
              </div>
            )}
          </div>

          <div className="hero-card">
            <h2 className="section-title">Session preview</h2>
            <div className="kpi">
              <h3>
                Match {matchPercent !== null ? `${matchPercent}%` : "—"}
              </h3>
              <p>Based on the current session</p>
            </div>
            <div className="section">
              <h3 className="section-title">Quick insights</h3>
              <div className="tag-list">
                {missingKeywords.length === 0 && <span className="tag">—</span>}
                {missingKeywords.map((item) => (
                  <span className="tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="section">
              <h3 className="section-title">Next steps</h3>
              <div className="steps">
                <div className="step">
                  <span>1</span>
                  <p>Run analysis after uploading CV + job description.</p>
                </div>
                <div className="step">
                  <span>2</span>
                  <p>Generate optimized CV and review results.</p>
                </div>
              </div>
            </div>
            {optimizedSummary && (
              <div className="card">
                <h3>Latest optimized summary</h3>
                <p>{optimizedSummary}</p>
              </div>
            )}
            {recommendations.length > 0 && (
              <div className="card">
                <h3>Top recommendations</h3>
                <p>{recommendations.slice(0, 2).join(" · ")}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
