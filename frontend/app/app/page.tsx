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
  const [keywordCache, setKeywordCache] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [keywordSource, setKeywordSource] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const hashText = (value: string) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) | 0;
    }
    return String(hash);
  };

  const upload = async (override?: File | null) => {
    const activeFile = override ?? file;
    if (!activeFile) {
      setStatus("Please choose a file first.");
      return;
    }
    setStatus("Uploading...");
    const formData = new FormData();
    formData.append("file", activeFile);
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
    if (dropped) {
      void upload(dropped);
    }
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

  useEffect(() => {
    const text = jobText.trim();
    if (!text) {
      setKeywordCache([]);
      setKeywordSource("");
      localStorage.removeItem("job_keywords");
      localStorage.removeItem("job_keywords_hash");
      localStorage.removeItem("job_keywords_source");
      return;
    }
    const currentHash = hashText(text);
    const storedHash = localStorage.getItem("job_keywords_hash");
    if (storedHash === currentHash) {
      const cached = JSON.parse(localStorage.getItem("job_keywords") || "[]");
      setKeywordCache(Array.isArray(cached) ? cached : []);
      const cachedSource = localStorage.getItem("job_keywords_source") || "";
      setKeywordSource(cachedSource);
    } else {
      setKeywordCache([]);
      setKeywordSource("");
      localStorage.removeItem("job_keywords");
      localStorage.removeItem("job_keywords_hash");
      localStorage.removeItem("job_keywords_source");
    }
  }, [jobText]);

  const extractKeywords = async () => {
    if (!jobText.trim()) {
      setAnalysisStatus("Paste a job description first.");
      return;
    }
    setAnalysisStatus("Extracting keywords...");
    setIsExtracting(true);
    try {
      const response = await fetch(`${apiBase}/analyze/keywords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_text: jobText }),
      });
      if (!response.ok) {
        throw new Error("Keyword extraction failed.");
      }
      const data = await response.json();
      const combined = [
        ...(data.skills || []),
        ...(data.requirements || []),
      ].filter(Boolean);
      const unique = Array.from(new Set(combined.map((item: string) => item.trim()))).filter(
        (item) => item.length > 0,
      );
      setKeywordCache(unique);
      localStorage.setItem("job_keywords", JSON.stringify(unique));
      localStorage.setItem("job_keywords_hash", hashText(jobText.trim()));
      const sourceText = data.feedback || "Keywords extracted.";
      setKeywordSource(sourceText);
      localStorage.setItem("job_keywords_source", sourceText);
      setAnalysisStatus(sourceText);
    } catch (err) {
      setAnalysisStatus(
        err instanceof Error ? err.message : "Keyword extraction failed.",
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const removeKeyword = (value: string) => {
    const next = keywordCache.filter((item) => item !== value);
    setKeywordCache(next);
    localStorage.setItem("job_keywords", JSON.stringify(next));
    if (jobText.trim()) {
      localStorage.setItem("job_keywords_hash", hashText(jobText.trim()));
    }
  };

  const addKeyword = () => {
    const cleaned = keywordInput.trim();
    if (!cleaned) return;
    const exists = keywordCache.some(
      (item) => item.toLowerCase() === cleaned.toLowerCase(),
    );
    const next = exists ? keywordCache : [...keywordCache, cleaned];
    setKeywordCache(next);
    localStorage.setItem("job_keywords", JSON.stringify(next));
    if (jobText.trim()) {
      localStorage.setItem("job_keywords_hash", hashText(jobText.trim()));
    }
    setKeywordInput("");
  };

  const clearKeywords = () => {
    setKeywordCache([]);
    setKeywordSource("");
    localStorage.removeItem("job_keywords");
    localStorage.removeItem("job_keywords_hash");
    localStorage.removeItem("job_keywords_source");
    setAnalysisStatus("Keywords cleared.");
  };

  const runAnalysis = async () => {
    if (!parsed?.raw_text) {
      setAnalysisStatus("Upload a CV first.");
      return;
    }
    if (!jobText.trim()) {
      setAnalysisStatus("Paste a job description first.");
      return;
    }
    if (keywordCache.length === 0) {
      setAnalysisStatus("Extract keywords first.");
      return;
    }
    localStorage.setItem("target_role", targetRole);
    localStorage.setItem("target_company", targetCompany);
    localStorage.setItem("job_text", jobText);
    localStorage.setItem("cv_text", parsed.raw_text || "");
    setAnalysisStatus("Analyzing...");
    setIsAnalyzing(true);
    try {
      const response = await fetch(`${apiBase}/analyze/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cv_text: parsed.raw_text || "",
          job_text: jobText,
          keywords: keywordCache,
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
    } finally {
      setIsAnalyzing(false);
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
            <div className="card">
              <h3>Keywords (editable)</h3>
              {keywordSource && <p className="muted">{keywordSource}</p>}
              <div className="keyword-actions">
                <span className="muted">Total: {keywordCache.length}</span>
                <div className="keyword-buttons">
                  <button className="btn ghost" type="button" onClick={extractKeywords}>
                    {isExtracting ? "Extracting..." : "Extract keywords"}
                  </button>
                  <button className="btn ghost" type="button" onClick={clearKeywords}>
                    Clear
                  </button>
                </div>
              </div>
              <div className="tag-list">
                {keywordCache.length === 0 && <span className="tag">—</span>}
                {keywordCache.map((item) => (
                  <span className="tag" key={item}>
                    {item}
                    <button
                      className="tag-remove"
                      type="button"
                      onClick={() => removeKeyword(item)}
                      aria-label={`Remove ${item}`}
                    >
                    </button>
                  </span>
                ))}
              </div>
              <div className="keyword-row">
                <input
                  className="input"
                  placeholder="Add keyword"
                  value={keywordInput}
                  onChange={(event) => setKeywordInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addKeyword();
                    }
                  }}
                />
                <button className="btn" type="button" onClick={addKeyword}>
                  Add
                </button>
              </div>
            </div>
            <div className="nav-actions">
              <button
                className="btn primary"
                type="button"
                onClick={runAnalysis}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? "Analyzing..." : "Run analysis"}
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
