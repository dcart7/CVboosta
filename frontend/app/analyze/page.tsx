"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TopNav from "../components/TopNav";
import { getApiBase } from "../lib/apiBase";

type ParsedCv = {
  raw_text: string;
  skills: string[];
  work_experience: string[];
  education: string[];
  achievements: string[];
};

export default function AnalyzePage() {
  const apiBase = getApiBase();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [parsed, setParsed] = useState<ParsedCv | null>(null);
  const [cvAnalysis, setCvAnalysis] = useState("");
  const [jobAnalysis, setJobAnalysis] = useState("");
  const [matchPercent, setMatchPercent] = useState<number | null>(null);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [jobText, setJobText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const runAnalysis = async (cvText: string, jobTextValue: string) => {
    setLoading(true);
    setError("");
    try {
      const [cvRes, jobRes, matchRes] = await Promise.all([
        fetch(`${apiBase}/analyze/cv`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cv_text: cvText }),
        }),
        fetch(`${apiBase}/analyze/job`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_text: jobTextValue }),
        }),
        fetch(`${apiBase}/analyze/match`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cv_text: cvText, job_text: jobTextValue }),
        }),
      ]);
      if (!cvRes.ok || !jobRes.ok || !matchRes.ok) {
        throw new Error("Failed to run analysis.");
      }
      const cvPayload = await cvRes.json();
      const jobPayload = await jobRes.json();
      const matchPayload = await matchRes.json();
      setCvAnalysis(cvPayload.cv_analysis || "");
      setJobAnalysis(jobPayload.job_analysis || "");
      setMatchPercent(matchPayload.match_percent ?? null);
      setMissingKeywords(matchPayload.missing_keywords || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedParsed = localStorage.getItem("parsed_cv");
    const storedCvText = localStorage.getItem("cv_text") || "";
    const storedJobText = localStorage.getItem("job_text") || "";
    if (storedJobText) {
      setJobText(storedJobText);
    }
    if (storedParsed) {
      const parsedValue: ParsedCv = JSON.parse(storedParsed);
      setParsed(parsedValue);
      const cvText = storedCvText || parsedValue.raw_text || "";
      if (cvText && storedJobText) {
        runAnalysis(cvText, storedJobText);
        return;
      }
    }
    setLoading(false);
  }, [apiBase]);

  const uploadCv = async () => {
    if (!file) {
      setUploadStatus("Please choose a CV file.");
      return;
    }
    setUploadStatus("Uploading...");
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
      localStorage.setItem("parsed_cv", JSON.stringify(data));
      localStorage.setItem("cv_text", data.raw_text || "");
      setParsed(data);
      setUploadStatus("CV uploaded.");
      if (jobText.trim()) {
        runAnalysis(data.raw_text || "", jobText);
      }
    } catch (err) {
      setUploadStatus(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const headline = useMemo(() => {
    if (!parsed?.raw_text) return "—";
    return parsed.raw_text.split(".")[0].slice(0, 80) || "—";
  }, [parsed]);

  const strengths = useMemo(() => {
    if (!cvAnalysis) return "—";
    return cvAnalysis.split(".").slice(0, 2).join(".") + ".";
  }, [cvAnalysis]);

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="split fade-up">
          <div className="form-card">
            <h2 className="section-title">Analysis overview</h2>
            <p className="hero-subtitle">
              We’ve extracted key signals from your CV and compared them to the
              role. Review gaps before optimization.
            </p>
            {loading && <p>Running analysis...</p>}
            {error && <p style={{ color: "#b42318" }}>{error}</p>}
            {!loading && (!jobText || !parsed?.raw_text) && (
              <div className="section">
                <h3 className="section-title">Finish setup</h3>
                <p className="hero-subtitle">
                  We need both a CV and a job description to run the analysis.
                </p>
                <div className="form-grid">
                  <div>
                    <div className="label">CV FILE</div>
                    <input
                      className="input"
                      type="file"
                      accept=".pdf,.txt"
                      onChange={(event) =>
                        setFile(event.target.files?.[0] || null)
                      }
                    />
                    <button className="btn" type="button" onClick={uploadCv}>
                      Upload CV
                    </button>
                    {uploadStatus && <p>{uploadStatus}</p>}
                  </div>
                  <div>
                    <div className="label">Job description</div>
                    <textarea
                      className="textarea"
                      placeholder="Paste the vacancy description here..."
                      value={jobText}
                      onChange={(event) => setJobText(event.target.value)}
                    />
                  </div>
                  <button
                    className="btn primary"
                    type="button"
                    onClick={() => {
                      if (!parsed?.raw_text) {
                        setError("Please upload a CV first.");
                        return;
                      }
                      if (!jobText.trim()) {
                        setError("Please paste a job description.");
                        return;
                      }
                      localStorage.setItem("job_text", jobText);
                      localStorage.setItem("cv_text", parsed.raw_text || "");
                      runAnalysis(parsed.raw_text || "", jobText);
                    }}
                  >
                    Run analysis
                  </button>
                </div>
              </div>
            )}
            {!loading && !error && (
              <>
                <div className="grid">
                  <div className="card">
                    <h3>Match score</h3>
                    <p>
                      {matchPercent !== null ? `${matchPercent}%` : "—"} vs
                      target role
                    </p>
                  </div>
                  <div className="card">
                    <h3>Missing keywords</h3>
                    <p>{missingKeywords.join(", ") || "—"}</p>
                  </div>
                  <div className="card">
                    <h3>Strengths</h3>
                    <p>{strengths}</p>
                  </div>
                </div>
                <div className="section">
                  <h3 className="section-title">Job summary</h3>
                  <div className="card">
                    <p>{jobAnalysis || "—"}</p>
                  </div>
                </div>
              </>
            )}
            <div className="nav-actions">
              <Link className="btn primary" href="/optimize">
                Continue to optimize
              </Link>
              <Link className="btn ghost" href="/app">
                Back to upload
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <h2 className="section-title">Parsed CV snapshot</h2>
            <div className="card">
              <h3>Headline</h3>
              <p>{headline}</p>
            </div>
            <div className="card">
              <h3>Top skills</h3>
              <p>{parsed?.skills?.join(", ") || "—"}</p>
            </div>
            <div className="card">
              <h3>Experience signals</h3>
              <p>{parsed?.work_experience?.slice(0, 3).join(", ") || "—"}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
