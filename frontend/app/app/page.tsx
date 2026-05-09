"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "../components/TopNav";
import PremiumModal from "../components/PremiumModal";
import { getApiBase } from "../lib/apiBase";
import { errorDetailToMessage } from "../lib/errorDetail";
import { fetchWithRetry } from "../lib/fetchRetry";
import { useTranslation } from "../lib/LanguageContext";
import { trackEvent } from "../lib/analytics";
import {
  clearWorkspaceDraftData,
  fetchWorkspaceEmail,
  GUEST_WORKSPACE_ID,
  migrateLegacyGuestWorkspace,
  parsedCvStorageKey,
  sessionCvParsedKey,
  workspaceIdFromEmail,
  wsFieldKey,
} from "../lib/workspaceStorage";

export default function WorkspacePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [optimizeStatus, setOptimizeStatus] = useState("");
  const [parsed, setParsed] = useState<{
    raw_text: string;
    skills: string[];
    work_experience: string[];
    education: string[];
    achievements: string[];
  } | null>(null);
  const apiBase = getApiBase();
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [jobText, setJobText] = useState("");
  const [analysisStatus, setAnalysisStatus] = useState("");
  const [matchPercent, setMatchPercent] = useState<number | null>(null);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [optimizedSummary, setOptimizedSummary] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  /** Resolved workspace (email or __guest__); null until first auth/workspace load. */
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  /** Detected skills UI only after Upload & parse in this tab (not from cold LS). */
  const [showDetectedSkillsSession, setShowDetectedSkillsSession] =
    useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  
  useEffect(() => {
    if (!isOptimizing) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep((prev) => Math.min(prev + 1, 3)); // stay at step 3 until finished
    }, 3500);
    return () => clearInterval(interval);
  }, [isOptimizing]);
  const [keywordCache, setKeywordCache] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [keywordSource, setKeywordSource] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [mobileDashboardTab, setMobileDashboardTab] = useState<"editor" | "preview">("editor");

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
        throw new Error(errorDetailToMessage(payload.detail) || "Upload failed");
      }
      const data = await response.json();
      setParsed(data);
      const email = userEmail ?? (await fetchWorkspaceEmail(apiBase));
      const wid = workspaceIdFromEmail(email);
      if (userEmail === null && email) setUserEmail(email);
      if (workspaceId === null) setWorkspaceId(wid);
      localStorage.setItem(parsedCvStorageKey(email), JSON.stringify(data));
      localStorage.setItem(wsFieldKey(wid, "cv_text"), data.raw_text || "");
      try {
        sessionStorage.setItem(sessionCvParsedKey(wid), "1");
      } catch {
        /* private mode */
      }
      setShowDetectedSkillsSession(true);
      setStatus("CV parsed successfully.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleFileSelect = (selected: File | null) => {
    if (!selected) return;
    trackEvent("ats_upload_cv", { file_type: selected.type || "unknown" });
    setFile(selected);
    setStatus("");
    setParsed(null);
    const wid = workspaceId ?? GUEST_WORKSPACE_ID;
    try {
      sessionStorage.removeItem(sessionCvParsedKey(wid));
    } catch {
      /* ignore */
    }
    setShowDetectedSkillsSession(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (!workspaceReady) return;
    const dropped = event.dataTransfer.files?.[0] || null;
    handleFileSelect(dropped);
    if (dropped) {
      void upload(dropped);
    }
  };

  const loadWorkspace = useCallback(async () => {
    setWorkspaceReady(false);
    try {
      const email = await fetchWorkspaceEmail(apiBase);
      const wid = workspaceIdFromEmail(email);
      migrateLegacyGuestWorkspace(wid);
      setUserEmail(email);
      setWorkspaceId(wid);

      // Dashboard should always open empty (new visit / after previous scan).
      clearWorkspaceDraftData(wid, email);
      setFile(null);
      setParsed(null);
      setTargetRole("");
      setTargetCompany("");
      setJobText("");
      setShowDetectedSkillsSession(false);
      setStatus("");
      setAnalysisStatus("");
      setOptimizeStatus("");
      setKeywordCache([]);
      setKeywordSource("");
      setKeywordInput("");
      setMatchPercent(null);
      setMissingKeywords([]);
      setOptimizedSummary("");
      setRecommendations([]);
    } catch {
      setUserEmail(null);
      setWorkspaceId(GUEST_WORKSPACE_ID);
      setParsed(null);
      setTargetRole("");
      setTargetCompany("");
      setJobText("");
      setShowDetectedSkillsSession(false);
      setStatus("");
      setAnalysisStatus("");
      setOptimizeStatus("");
      setKeywordCache([]);
      setKeywordSource("");
      setKeywordInput("");
      setMatchPercent(null);
      setMissingKeywords([]);
      setOptimizedSummary("");
      setRecommendations([]);
      clearWorkspaceDraftData(GUEST_WORKSPACE_ID, null);
    } finally {
      setWorkspaceReady(true);
    }
  }, [apiBase]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    const onAuth = () => void loadWorkspace();
    window.addEventListener("auth-change", onAuth);
    return () => window.removeEventListener("auth-change", onAuth);
  }, [loadWorkspace]);

  useEffect(() => {
    if (!workspaceReady || workspaceId === null) return;
    localStorage.setItem(wsFieldKey(workspaceId, "target_role"), targetRole);
    localStorage.setItem(
      wsFieldKey(workspaceId, "target_company"),
      targetCompany,
    );
    localStorage.setItem(wsFieldKey(workspaceId, "job_text"), jobText);
  }, [workspaceReady, workspaceId, targetRole, targetCompany, jobText]);

  useEffect(() => {
    if (!workspaceReady || workspaceId === null) return;
    const text = jobText.trim();
    const hashKey = wsFieldKey(workspaceId, "job_keywords_hash");
    const kwKey = wsFieldKey(workspaceId, "job_keywords");
    const srcKey = wsFieldKey(workspaceId, "job_keywords_source");
    if (!text) {
      setKeywordCache([]);
      setKeywordSource("");
      localStorage.removeItem(kwKey);
      localStorage.removeItem(hashKey);
      localStorage.removeItem(srcKey);
      return;
    }
    const currentHash = hashText(text);
    const storedHash = localStorage.getItem(hashKey);
    if (storedHash === currentHash) {
      const cached = JSON.parse(localStorage.getItem(kwKey) || "[]");
      setKeywordCache(Array.isArray(cached) ? cached : []);
      setKeywordSource(localStorage.getItem(srcKey) || "");
    } else {
      setKeywordCache([]);
      setKeywordSource("");
      localStorage.removeItem(kwKey);
      localStorage.removeItem(hashKey);
      localStorage.removeItem(srcKey);
    }
  }, [jobText, workspaceId, workspaceReady]);

  const extractKeywords = async () => {
    if (!jobText.trim()) {
      setAnalysisStatus("Paste a job description first.");
      return;
    }
    if (workspaceId === null) {
      setAnalysisStatus("Loading workspace…");
      return;
    }
    setAnalysisStatus("Extracting keywords...");
    trackEvent("ats_analysis_started", { stage: "keyword_extraction" });
    setIsExtracting(true);
    try {
      const response = await fetch(`${apiBase}/analyze/keywords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_text: jobText }),
      });
      const data = await response.json();
      if (response.status === 402) {
        setShowUpgradeModal(true);
        setIsExtracting(false);
        return;
      }
      if (!response.ok) {
        throw new Error("Keyword extraction failed.");
      }
      const combined = [
        ...(data.skills || []),
        ...(data.requirements || []),
      ].filter(Boolean);
      const unique = Array.from(new Set(combined.map((item: string) => item.trim()))).filter(
        (item) => item.length > 0,
      );
      setKeywordCache(unique);
      const kwKey = wsFieldKey(workspaceId, "job_keywords");
      const hashKey = wsFieldKey(workspaceId, "job_keywords_hash");
      const srcKey = wsFieldKey(workspaceId, "job_keywords_source");
      localStorage.setItem(kwKey, JSON.stringify(unique));
      localStorage.setItem(hashKey, hashText(jobText.trim()));
      const sourceText = data.feedback || "Keywords extracted.";
      setKeywordSource(sourceText);
      localStorage.setItem(srcKey, sourceText);
      setAnalysisStatus(sourceText);
      trackEvent("ats_analysis_completed", { stage: "keyword_extraction" });
    } catch (err) {
      setAnalysisStatus(
        err instanceof Error ? err.message : "Keyword extraction failed.",
      );
    } finally {
      setIsExtracting(false);
    }
  };

  const removeKeyword = (value: string) => {
    if (workspaceId === null) return;
    const next = keywordCache.filter((item) => item !== value);
    setKeywordCache(next);
    localStorage.setItem(
      wsFieldKey(workspaceId, "job_keywords"),
      JSON.stringify(next),
    );
    if (jobText.trim()) {
      localStorage.setItem(
        wsFieldKey(workspaceId, "job_keywords_hash"),
        hashText(jobText.trim()),
      );
    }
  };

  const addKeyword = () => {
    if (workspaceId === null) return;
    const cleaned = keywordInput.trim();
    if (!cleaned) return;
    const exists = keywordCache.some(
      (item) => item.toLowerCase() === cleaned.toLowerCase(),
    );
    const next = exists ? keywordCache : [...keywordCache, cleaned];
    setKeywordCache(next);
    localStorage.setItem(
      wsFieldKey(workspaceId, "job_keywords"),
      JSON.stringify(next),
    );
    if (jobText.trim()) {
      localStorage.setItem(
        wsFieldKey(workspaceId, "job_keywords_hash"),
        hashText(jobText.trim()),
      );
    }
    setKeywordInput("");
  };

  const clearKeywords = () => {
    setKeywordCache([]);
    setKeywordSource("");
    if (workspaceId !== null) {
      localStorage.removeItem(wsFieldKey(workspaceId, "job_keywords"));
      localStorage.removeItem(wsFieldKey(workspaceId, "job_keywords_hash"));
      localStorage.removeItem(wsFieldKey(workspaceId, "job_keywords_source"));
    }
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
    if (workspaceId === null) {
      setAnalysisStatus("Loading workspace…");
      return;
    }
    localStorage.setItem(wsFieldKey(workspaceId, "target_role"), targetRole);
    localStorage.setItem(
      wsFieldKey(workspaceId, "target_company"),
      targetCompany,
    );
    localStorage.setItem(wsFieldKey(workspaceId, "job_text"), jobText);
    localStorage.setItem(
      wsFieldKey(workspaceId, "cv_text"),
      parsed.raw_text || "",
    );
    setAnalysisStatus("Analyzing...");
    trackEvent("ats_analysis_started", { stage: "match" });
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
      const data = await response.json();
      if (response.status === 402) {
        setShowUpgradeModal(true);
        setAnalysisStatus("");
        setIsAnalyzing(false);
        return;
      }
      if (!response.ok) {
        throw new Error("Analysis failed.");
      }
      setMatchPercent(data.match_percent ?? null);
      setMissingKeywords(data.missing_keywords || []);
      setAnalysisStatus("Analysis complete.");
      trackEvent("ats_analysis_completed", { stage: "match" });
    } catch (err) {
      setAnalysisStatus(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runOptimization = async () => {
    if (!parsed?.raw_text || !jobText.trim()) {
      setOptimizeStatus("Upload CV and paste job description first.");
      return;
    }
    if (workspaceId === null) {
      setOptimizeStatus("Loading workspace…");
      return;
    }
    localStorage.setItem(wsFieldKey(workspaceId, "target_role"), targetRole);
    localStorage.setItem(
      wsFieldKey(workspaceId, "target_company"),
      targetCompany,
    );
    localStorage.setItem(wsFieldKey(workspaceId, "job_text"), jobText);
    localStorage.setItem(
      wsFieldKey(workspaceId, "cv_text"),
      parsed.raw_text || "",
    );
    setOptimizeStatus("Optimizing...");
    trackEvent("optimization_started", { product_type: "optimization" });
    setIsOptimizing(true);
    try {
      const response = await fetchWithRetry(
        `${apiBase}/optimize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cv_text: parsed.raw_text || "",
            job_text: jobText,
            cv_analysis: "",
            job_analysis: "",
            target_role: targetRole,
            target_company: targetCompany,
          }),
        },
        { attempts: 3, baseDelayMs: 300, timeoutMs: 25_000 },
      );
      const data = await response.json();
      if (response.status === 402) {
        setShowUpgradeModal(true);
        setOptimizeStatus("");
        setIsOptimizing(false);
        return;
      }
      if (!response.ok) {
        setOptimizeStatus(data.detail || "Optimization failed.");
        return;
      }
      localStorage.setItem("optimized_cv", data.optimized_cv || "");
      localStorage.setItem(
        "missing_skills",
        JSON.stringify(data.missing_skills || []),
      );
      localStorage.setItem(
        "recommendations",
        JSON.stringify(data.recommendations || []),
      );
      localStorage.setItem(
        "added_keywords",
        JSON.stringify(data.added_keywords || []),
      );
      if (typeof data.match_before === "number") {
        localStorage.setItem("match_before", String(data.match_before));
      }
      if (typeof data.match_after === "number") {
        localStorage.setItem("match_after", String(data.match_after));
      }
      setOptimizedSummary((data.optimized_cv || "").split("\n")[0] || "—");
      setRecommendations(data.recommendations || []);
      setOptimizeStatus("Optimization complete.");
      trackEvent("optimization_completed", { product_type: "optimization" });

      if (typeof data.match_before === "number" && typeof data.match_after === "number") {
        trackEvent("score_improvement", {
          score_before: data.match_before,
          score_after: data.match_after,
          improvement: Math.max(0, data.match_after - data.match_before),
        });
      }

      // Reset workspace input state after successful scan so dashboard starts clean.
      setFile(null);
      setParsed(null);
      setTargetRole("");
      setTargetCompany("");
      setJobText("");
      setKeywordCache([]);
      setKeywordSource("");
      setMatchPercent(null);
      setMissingKeywords([]);
      setAnalysisStatus("");
      clearWorkspaceDraftData(workspaceId, userEmail);

      if (data.analysis_id) {
        // Automatically inject the ID into localStorage so when /results mounts, it has a fallback if search params fail
        localStorage.setItem("current_analysis_id", String(data.analysis_id));
        trackEvent("ats_view_results", { location: "auto_redirect" });
        router.push(`/results?id=${data.analysis_id}`);
      } else {
        trackEvent("ats_view_results", { location: "auto_redirect" });
        router.push("/results");
      }
    } catch (err) {
      console.error("Optimization error:", err);
      setOptimizeStatus(t("optimize.optimizationFailedTryAgain"));
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <div className="mobile-dash-tabs" role="tablist" aria-label="Dashboard sections">
          <button
            type="button"
            role="tab"
            aria-selected={mobileDashboardTab === "editor"}
            className={`mobile-dash-tab ${mobileDashboardTab === "editor" ? "is-active" : ""}`}
            onClick={() => setMobileDashboardTab("editor")}
          >
            {t("dashboard.uploadCv").replace(/^\s*\d+\.\s*/, "")}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobileDashboardTab === "preview"}
            className={`mobile-dash-tab ${mobileDashboardTab === "preview" ? "is-active" : ""}`}
            onClick={() => setMobileDashboardTab("preview")}
          >
            {t("dashboard.sessionPreview")}
          </button>
        </div>
        <section className="split fade-up">
          <div
            className={`form-card form-grid dashboard-panel ${
              mobileDashboardTab === "editor" ? "is-mobile-active" : "is-mobile-hidden"
            }`}
          >
            <div className="pill">{t("dashboard.pill")}</div>
            <div>
              <h2 className="section-title">{t("dashboard.uploadCv")}</h2>
              <div
                className={`upload${isDragging ? " is-dragging" : ""}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <strong>{t("dashboard.dropCv")}</strong>
                <span>{t("dashboard.dropHint")}</span>
                <input
                  className="input"
                  type="file"
                  accept=".pdf,.txt"
                  onChange={(event) =>
                    handleFileSelect(event.target.files?.[0] || null)
                  }
                />
                {file && <span>{t("dashboard.selected")} {file.name}</span>}
                <button
                  className="btn"
                  type="button"
                  disabled={!workspaceReady}
                  onClick={() => upload()}
                >
                  {t("dashboard.uploadParse")}
                </button>
              </div>
            </div>
            {status && <p>{status}</p>}
            {showDetectedSkillsSession &&
              parsed &&
              Array.isArray(parsed.skills) &&
              parsed.skills.length > 0 && (
              <div className="card">
                <h3>{t("dashboard.detectedSkills")}</h3>
                <p>{parsed.skills.join(", ")}</p>
              </div>
            )}
            <div>
              <div className="label">{t("dashboard.targetRole")}</div>
              <input
                className="input"
                placeholder={t("dashboard.targetRolePlaceholder")}
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
              />
            </div>
            <div>
              <div className="label">{t("dashboard.company")}</div>
              <input
                className="input"
                placeholder={t("dashboard.companyPlaceholder")}
                value={targetCompany}
                onChange={(event) => setTargetCompany(event.target.value)}
              />
            </div>
            <div>
              <div className="label">{t("dashboard.jobDescription")}</div>
              <textarea
                className="textarea"
                placeholder={t("dashboard.jobPlaceholder")}
                value={jobText}
                onChange={(event) => setJobText(event.target.value)}
              />
            </div>
            <div className="card">
              <h3>{t("dashboard.keywords")}</h3>
              {keywordSource && <p className="muted">{keywordSource}</p>}
              <div className="keyword-actions">
                <span className="muted">{t("dashboard.total")} {keywordCache.length}</span>
                <div className="keyword-buttons">
                  <button className="btn ghost" type="button" onClick={extractKeywords}>
                    {isExtracting ? t("dashboard.extracting") : t("dashboard.extractKeywords")}
                  </button>
                  <button className="btn ghost" type="button" onClick={clearKeywords}>
                    {t("dashboard.clear")}
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
                  placeholder={t("dashboard.addKeyword")}
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
                  {t("dashboard.add")}
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
                {isAnalyzing ? t("dashboard.analyzing") : t("dashboard.runAnalysis")}
              </button>
              <Link className="btn ghost" href="/history">
                {t("dashboard.viewHistory")}
              </Link>
            </div>
            {analysisStatus && <p>{analysisStatus}</p>}
            <div className="card">
              <h3>{t("dashboard.analysisSnapshot")}</h3>
              <p>
                {t("dashboard.matchScore")}{" "}
                {matchPercent !== null ? `${matchPercent}%` : "—"} · {t("dashboard.missingKeywords")} {missingKeywords.length}
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
                {t("dashboard.viewResults")}
              </Link>
            </div>
            {optimizeStatus && <p>{optimizeStatus}</p>}
            {isOptimizing && (
              <div className="progress-container" style={{ marginTop: "15px" }}>
                <div className="progress" role="status" aria-live="polite">
                  <span className="progress-bar" />
                </div>
                <p className="loading-step-text" style={{ textAlign: "center", marginTop: "12px", fontSize: "14px", fontWeight: "500", color: "var(--accent-color)", animation: "pulse 2s infinite" }}>
                  {loadingStep === 0 && t("dashboard.loadingStep1")}
                  {loadingStep === 1 && t("dashboard.loadingStep2")}
                  {loadingStep === 2 && t("dashboard.loadingStep3")}
                  {loadingStep >= 3 && t("dashboard.loadingStep4")}
                </p>
                <style jsx>{`
                  @keyframes pulse {
                    0% { opacity: 0.6; }
                    50% { opacity: 1; }
                    100% { opacity: 0.6; }
                  }
                `}</style>
              </div>
            )}
          </div>

          <div
            className={`hero-card dashboard-panel ${
              mobileDashboardTab === "preview" ? "is-mobile-active" : "is-mobile-hidden"
            }`}
          >
            <h2 className="section-title">{t("dashboard.sessionPreview")}</h2>
            <div className="kpi">
              <h3>
                {t("dashboard.match")} {matchPercent !== null ? `${matchPercent}%` : "—"}
              </h3>
              <p>{t("dashboard.basedOnSession")}</p>
            </div>
            <div className="section">
              <h3 className="section-title">{t("dashboard.quickInsights")}</h3>
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
              <h3 className="section-title">{t("dashboard.nextSteps")}</h3>
              <div className="steps">
                <div className="step">
                  <span>1</span>
                  <p>{t("dashboard.step1")}</p>
                </div>
                <div className="step">
                  <span>2</span>
                  <p>{t("dashboard.step2")}</p>
                </div>
              </div>
            </div>
            {optimizedSummary && (
              <div className="card">
                <h3>{t("dashboard.latestSummary")}</h3>
                <p>{optimizedSummary}</p>
              </div>
            )}
            {recommendations.length > 0 && (
              <div className="card">
                <h3>{t("dashboard.topRecommendations")}</h3>
                <p>{recommendations.slice(0, 2).map(item => {
                  let translatedItem = item;
                  if (item.includes("Tighten bullet points")) translatedItem = t("dashboard.rec1");
                  else if (item.includes("Align the Summary")) translatedItem = t("dashboard.rec2");
                  else if (item.includes("Ensure Skills section mirrors")) translatedItem = t("dashboard.rec3");
                  else if (item.includes("Highlight your strongest")) translatedItem = t("dashboard.rec4");
                  else if (item.startsWith("Add a bullet that demonstrates hands-on experience with ")) {
                    const skill = item.replace("Add a bullet that demonstrates hands-on experience with ", "").replace(".", "");
                    translatedItem = t("dashboard.recSkill").replace("{skill}", skill);
                  }
                  return translatedItem;
                }).join(" · ")}</p>
              </div>
            )}
          </div>
        </section>

        <section className="testimonials-section fade-up" style={{ marginTop: "4rem", marginBottom: "2rem" }}>
          <h2 className="section-title" style={{ textAlign: "center", marginBottom: "2rem" }}>
            {t("testimonials.title")}
          </h2>
          <div className="marquee-wrapper">
            <div className="marquee-track">
              {[1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6].map((num, idx) => (
                <div key={`${num}-${idx}`} className="card testi-card">
                  <p style={{ fontStyle: "italic", opacity: 0.9, marginBottom: "1.5rem" }}>
                     "{t(`testimonials.quote${num}`)}"
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "12px", color: "white" }}>
                      {t(`testimonials.author${num}`)[0]}
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "600", opacity: 0.8 }}>
                      {t(`testimonials.author${num}`)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <PremiumModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </main>
  );
}
