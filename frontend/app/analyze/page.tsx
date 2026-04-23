"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TopNav from "../components/TopNav";
import { getApiBase } from "../lib/apiBase";
import { useTranslation } from "../lib/LanguageContext";
import {
  fetchWorkspaceEmail,
  GUEST_WORKSPACE_ID,
  migrateLegacyGuestWorkspace,
  parsedCvStorageKey,
  workspaceIdFromEmail,
  wsFieldKey,
} from "../lib/workspaceStorage";

type ParsedCv = {
  raw_text: string;
  skills: string[];
  work_experience: string[];
  education: string[];
  achievements: string[];
};

export default function AnalyzePage() {
  const apiBase = getApiBase();
  const { t } = useTranslation();
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
    let cancelled = false;
    (async () => {
      const email = await fetchWorkspaceEmail(apiBase);
      if (cancelled) return;
      const wid = workspaceIdFromEmail(email);
      migrateLegacyGuestWorkspace(wid);

      let storedParsed = localStorage.getItem(parsedCvStorageKey(email));
      if (!storedParsed && wid === GUEST_WORKSPACE_ID) {
        const legacy = localStorage.getItem("parsed_cv");
        if (legacy) {
          localStorage.setItem(parsedCvStorageKey(null), legacy);
          localStorage.removeItem("parsed_cv");
          storedParsed = legacy;
        }
      }
      const storedCvText =
        localStorage.getItem(wsFieldKey(wid, "cv_text")) || "";
      const storedJobText =
        localStorage.getItem(wsFieldKey(wid, "job_text")) || "";
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
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  const uploadCv = async () => {
    if (!file) {
      setUploadStatus("Please choose a CV file.");
      return;
    }
    setUploadStatus(t("common.loading"));
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
      const email = await fetchWorkspaceEmail(apiBase);
      const wid = workspaceIdFromEmail(email);
      migrateLegacyGuestWorkspace(wid);
      localStorage.setItem(parsedCvStorageKey(email), JSON.stringify(data));
      localStorage.setItem(wsFieldKey(wid, "cv_text"), data.raw_text || "");
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
    <main className="page analyze-page">
      <TopNav />
      <div className="shell">
        <section className="split fade-up">
          <div className="form-card">
            <h2 className="section-title">{t("analyze.title")}</h2>
            <p className="hero-subtitle">{t("analyze.subtitle")}</p>
            <div className="card" style={{ marginBottom: "16px" }}>
              <h3>Free ATS Resume Checker</h3>
              <p>
                CV analysis and match scoring are free without registration.
                Upload your CV, paste a job description, and get your ATS score
                with missing keywords in minutes.
              </p>
            </div>
            {loading && <p>{t("common.loading")}</p>}
            {error && <p style={{ color: "#b42318" }}>{error}</p>}
            {!loading && (!jobText || !parsed?.raw_text) && (
              <div className="section">
                <h3 className="section-title">{t("analyze.finishSetup")}</h3>
                <p className="hero-subtitle">{t("analyze.setupDesc")}</p>
                <div className="form-grid">
                  <div>
                    <div className="label">{t("analyze.cvFile")}</div>
                    <input
                      className="input"
                      type="file"
                      accept=".pdf,.txt"
                      onChange={(event) =>
                        setFile(event.target.files?.[0] || null)
                      }
                    />
                    <button className="btn" type="button" onClick={uploadCv}>
                      {t("common.uploadCv")}
                    </button>
                    {uploadStatus && <p>{uploadStatus}</p>}
                  </div>
                  <div>
                    <div className="label">{t("common.jobDescription")}</div>
                    <textarea
                      className="textarea"
                      placeholder={t("analyze.placeholder")}
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
                      void (async () => {
                        const email = await fetchWorkspaceEmail(apiBase);
                        const wid = workspaceIdFromEmail(email);
                        migrateLegacyGuestWorkspace(wid);
                        localStorage.setItem(
                          wsFieldKey(wid, "job_text"),
                          jobText,
                        );
                        localStorage.setItem(
                          wsFieldKey(wid, "cv_text"),
                          parsed.raw_text || "",
                        );
                        runAnalysis(parsed.raw_text || "", jobText);
                      })();
                    }}
                  >
                    {t("common.runAnalysis")}
                  </button>
                </div>
              </div>
            )}
            {!loading && !error && (
              <>
                <div className="grid">
                  <div className="card">
                    <h3>{t("analyze.matchScore")}</h3>
                    <p>
                      {matchPercent !== null ? `${matchPercent}%` : "—"} {t("analyze.vsTarget")}
                    </p>
                  </div>
                  <div className="card">
                    <h3>{t("analyze.missingKeywords")}</h3>
                    <p>{missingKeywords.join(", ") || "—"}</p>
                  </div>
                  <div className="card">
                    <h3>{t("analyze.strengths")}</h3>
                    <p>{strengths}</p>
                  </div>
                </div>
                <div className="section">
                  <h3 className="section-title">{t("analyze.jobSummary")}</h3>
                  <div className="card">
                    <p>{jobAnalysis || "—"}</p>
                  </div>
                </div>
              </>
            )}
            <div className="nav-actions">
              <Link className="btn primary" href="/optimize">
                {t("common.continue")}
              </Link>
              <Link className="btn ghost" href="/app">
                {t("common.back")}
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <h2 className="section-title">{t("analyze.parsedSnapshot")}</h2>
            <div className="card">
              <h3>{t("analyze.headline")}</h3>
              <p>{headline}</p>
            </div>
            <div className="card">
              <h3>{t("analyze.topSkills")}</h3>
              <p>{parsed?.skills?.join(", ") || "—"}</p>
            </div>
            <div className="card">
              <h3>{t("analyze.experienceSignals")}</h3>
              <p>{parsed?.work_experience?.slice(0, 3).join(", ") || "—"}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
