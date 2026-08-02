"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "../components/TopNav";
import PremiumModal from "../components/PremiumModal";
import { getApiBase } from "../lib/apiBase";
import { errorDetailToMessage } from "../lib/errorDetail";
import { fetchWithRetry } from "../lib/fetchRetry";
import {
  authHref,
  clearLegacyPersistentFunnelData,
  clearWorkspaceFunnelDraft,
  createIdempotencyKey,
  loadWorkspaceFunnelDraft,
  saveResultContext,
  saveWorkspaceFunnelDraft,
  type WorkspacePendingAction,
} from "../lib/funnelIntent";
import { useTranslation } from "../lib/LanguageContext";
import { trackEvent } from "../lib/analytics";
import {
  clearWorkspaceDraftData,
  fetchWorkspaceEmail,
  GUEST_WORKSPACE_ID,
  workspaceIdFromEmail,
  wsFieldKey,
} from "../lib/workspaceStorage";

type OptimizationRequest = {
  cv_text: string;
  job_text: string;
  cv_analysis: string;
  job_analysis: string;
  target_role: string;
  target_company: string;
};

async function requestFingerprint(value: string): Promise<string> {
  try {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    // Stable non-cryptographic fallback. The fingerprint is only used to avoid
    // reusing a key for a changed request; the server verifies the real body.
    let first = 2166136261;
    let second = 2246822519;
    for (let index = 0; index < value.length; index += 1) {
      const code = value.charCodeAt(index);
      first = Math.imul(first ^ code, 16777619);
      second = Math.imul(second ^ code, 3266489917);
    }
    return [first, second, value.length, first ^ second]
      .map((part) => (part >>> 0).toString(16).padStart(8, "0"))
      .join("");
  }
}

function isAmbiguousOptimizationStatus(status: number): boolean {
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}

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
  const [notice, setNotice] = useState<{
    message: string;
    kind: "info" | "error";
  } | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const resumeAttemptedRef = useRef(false);
  const optimizationInFlightRef = useRef(false);
  
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
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [pendingAction, setPendingAction] =
    useState<WorkspacePendingAction>(null);
  const [pendingIdempotencyKey, setPendingIdempotencyKey] = useState<
    string | null
  >(null);
  const [pendingRequestFingerprint, setPendingRequestFingerprint] = useState<
    string | null
  >(null);
  const [mobileDashboardTab, setMobileDashboardTab] = useState<"editor" | "preview">("editor");

  const showNotice = (message: string, kind: "info" | "error" = "info") => {
    setNotice({ message, kind });
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setNotice(null), 4500);
  };

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    };
  }, []);

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
      clearLegacyPersistentFunnelData();
      const email = await fetchWorkspaceEmail(apiBase);
      const wid = workspaceIdFromEmail(email);
      const draft = loadWorkspaceFunnelDraft();
      setUserEmail(email);
      setWorkspaceId(wid);

      // Remove legacy persistent CV copies. The active draft is tab-scoped with a TTL.
      clearWorkspaceDraftData(wid, email);
      if (wid !== GUEST_WORKSPACE_ID) {
        clearWorkspaceDraftData(GUEST_WORKSPACE_ID, null);
      }
      setFile(null);
      setParsed(draft?.parsed ?? null);
      setTargetRole(draft?.targetRole ?? "");
      setTargetCompany(draft?.targetCompany ?? "");
      setJobText(draft?.jobText ?? "");
      setPendingAction(draft?.pendingAction ?? null);
      setPendingIdempotencyKey(draft?.pendingIdempotencyKey ?? null);
      setPendingRequestFingerprint(draft?.pendingRequestFingerprint ?? null);
      setShowDetectedSkillsSession(Boolean(draft?.parsed));
      setStatus(draft?.parsed ? "Your CV draft was restored securely." : "");
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
      const draft = loadWorkspaceFunnelDraft();
      setUserEmail(null);
      setWorkspaceId(GUEST_WORKSPACE_ID);
      setParsed(draft?.parsed ?? null);
      setTargetRole(draft?.targetRole ?? "");
      setTargetCompany(draft?.targetCompany ?? "");
      setJobText(draft?.jobText ?? "");
      setPendingAction(draft?.pendingAction ?? null);
      setPendingIdempotencyKey(draft?.pendingIdempotencyKey ?? null);
      setPendingRequestFingerprint(draft?.pendingRequestFingerprint ?? null);
      setShowDetectedSkillsSession(Boolean(draft?.parsed));
      setStatus(draft?.parsed ? "Your CV draft was restored securely." : "");
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
    if (!workspaceReady) return;
    if (!parsed && !targetRole && !targetCompany && !jobText && !pendingAction) {
      clearWorkspaceFunnelDraft();
      return;
    }
    saveWorkspaceFunnelDraft({
      parsed,
      targetRole,
      targetCompany,
      jobText,
      pendingAction,
      pendingIdempotencyKey,
      pendingRequestFingerprint,
    });
  }, [
    workspaceReady,
    parsed,
    targetRole,
    targetCompany,
    jobText,
    pendingAction,
    pendingIdempotencyKey,
    pendingRequestFingerprint,
  ]);

  useEffect(() => {
    if (!workspaceReady || workspaceId === null) return;
    const text = jobText.trim();
    const hashKey = wsFieldKey(workspaceId, "job_keywords_hash");
    const kwKey = wsFieldKey(workspaceId, "job_keywords");
    const srcKey = wsFieldKey(workspaceId, "job_keywords_source");
    if (!text) {
      setKeywordCache([]);
      setKeywordSource("");
      sessionStorage.removeItem(kwKey);
      sessionStorage.removeItem(hashKey);
      sessionStorage.removeItem(srcKey);
      return;
    }
    const currentHash = hashText(text);
    const storedHash = sessionStorage.getItem(hashKey);
    if (storedHash === currentHash) {
      const cached = JSON.parse(sessionStorage.getItem(kwKey) || "[]");
      setKeywordCache(Array.isArray(cached) ? cached : []);
      setKeywordSource(sessionStorage.getItem(srcKey) || "");
    } else {
      setKeywordCache([]);
      setKeywordSource("");
      sessionStorage.removeItem(kwKey);
      sessionStorage.removeItem(hashKey);
      sessionStorage.removeItem(srcKey);
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
      sessionStorage.setItem(kwKey, JSON.stringify(unique));
      sessionStorage.setItem(hashKey, hashText(jobText.trim()));
      const sourceText = data.feedback || "Keywords extracted.";
      setKeywordSource(sourceText);
      sessionStorage.setItem(srcKey, sourceText);
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
    sessionStorage.setItem(
      wsFieldKey(workspaceId, "job_keywords"),
      JSON.stringify(next),
    );
    if (jobText.trim()) {
      sessionStorage.setItem(
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
    sessionStorage.setItem(
      wsFieldKey(workspaceId, "job_keywords"),
      JSON.stringify(next),
    );
    if (jobText.trim()) {
      sessionStorage.setItem(
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
      sessionStorage.removeItem(wsFieldKey(workspaceId, "job_keywords"));
      sessionStorage.removeItem(wsFieldKey(workspaceId, "job_keywords_hash"));
      sessionStorage.removeItem(wsFieldKey(workspaceId, "job_keywords_source"));
    }
    setAnalysisStatus("Keywords cleared.");
  };

  const runAnalysis = async () => {
    if (!parsed?.raw_text) {
      const msg = t("dashboard.step1") || "Upload a CV first.";
      setAnalysisStatus(msg);
      showNotice(msg, "error");
      return;
    }
    if (!jobText.trim() && keywordCache.length === 0) {
      const msg =
        t("analyze.setupDesc") ||
        "Paste a job description (recommended) or add keywords first.";
      setAnalysisStatus(msg);
      showNotice(msg, "error");
      return;
    }
    if (workspaceId === null) {
      const msg = t("common.loading") || "Loading…";
      setAnalysisStatus(msg);
      return;
    }
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
        throw new Error(data?.detail || "Analysis failed.");
      }
      setMatchPercent(data.match_percent ?? null);
      setMissingKeywords(data.missing_keywords || []);
      setAnalysisStatus("Analysis complete.");
      trackEvent("ats_analysis_completed", { stage: "match" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Analysis failed.";
      setAnalysisStatus(msg);
      showNotice(msg, "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runOptimization = async (resumeIdempotencyKey?: string) => {
    if (optimizationInFlightRef.current || isOptimizing) return;
    if (!parsed?.raw_text) {
      const msg = t("dashboard.step1") || "Upload a CV first.";
      setOptimizeStatus(msg);
      showNotice(msg, "error");
      return;
    }
    if (!jobText.trim()) {
      const message = t("dashboard.jobDescriptionMissing") || "Paste a job description first.";
      setOptimizeStatus(message);
      showNotice(message, "error");
      return;
    }
    if (workspaceId === null) {
      setOptimizeStatus("Loading workspace…");
      return;
    }
    optimizationInFlightRef.current = true;
    const requestPayload: OptimizationRequest = {
      cv_text: parsed.raw_text,
      job_text: jobText,
      cv_analysis: "",
      job_analysis: "",
      target_role: targetRole,
      target_company: targetCompany,
    };
    const serializedPayload = JSON.stringify(requestPayload);
    const fingerprint = await requestFingerprint(serializedPayload);
    const canReusePendingKey =
      pendingAction === "optimize" &&
      typeof pendingIdempotencyKey === "string" &&
      pendingIdempotencyKey.length > 0 &&
      pendingRequestFingerprint === fingerprint;
    const idempotencyKey =
      resumeIdempotencyKey ||
      (canReusePendingKey ? pendingIdempotencyKey : createIdempotencyKey("optimize"));

    // Persist before sending. A timeout or dropped response can mean the server
    // completed the work, so every safe retry must use this exact key.
    const pendingSaved = saveWorkspaceFunnelDraft({
      parsed,
      targetRole,
      targetCompany,
      jobText,
      pendingAction: "optimize",
      pendingIdempotencyKey: idempotencyKey,
      pendingRequestFingerprint: fingerprint,
    });
    setPendingAction("optimize");
    setPendingIdempotencyKey(idempotencyKey);
    setPendingRequestFingerprint(fingerprint);
    setOptimizeStatus("Optimizing...");
    trackEvent("optimization_started", {
      product_type: "optimization",
      resumed_after_auth: Boolean(resumeIdempotencyKey),
    });
    setIsOptimizing(true);
    try {
      const response = await fetchWithRetry(
        `${apiBase}/optimize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: serializedPayload,
        },
        // Optimization can take longer than analysis (LLM + matching + recommendations).
        { attempts: 3, baseDelayMs: 300, timeoutMs: 150_000 },
      );
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        setShowAuthGate(true);
        setOptimizeStatus(
          pendingSaved
            ? "Sign in to continue. Your CV and vacancy are saved in this tab for 30 minutes."
            : "Sign in to continue. Keep this page open so your draft is not lost.",
        );
        trackEvent("cta_click", {
          cta_name: "auth_gate_view",
          source: "optimization",
          draft_saved: pendingSaved,
        });
        return;
      }
      if (response.status === 402) {
        setPendingAction(null);
        setPendingIdempotencyKey(null);
        setPendingRequestFingerprint(null);
        setShowUpgradeModal(true);
        setOptimizeStatus("");
        return;
      }
      if (!response.ok) {
        if (isAmbiguousOptimizationStatus(response.status)) {
          setOptimizeStatus(
            "The result is still uncertain. Try again — the same request will resume safely without charging twice.",
          );
        } else {
          setPendingAction(null);
          setPendingIdempotencyKey(null);
          setPendingRequestFingerprint(null);
          setOptimizeStatus(errorDetailToMessage(data.detail) || "Optimization failed.");
        }
        return;
      }
      saveResultContext({
        optimizedCv: data.optimized_cv || "",
        jobText,
        missingSkills: data.missing_skills || [],
        addedKeywords: data.added_keywords || [],
        recommendations: data.recommendations || [],
        matchBefore:
          typeof data.match_before === "number" ? data.match_before : null,
        matchAfter:
          typeof data.match_after === "number" ? data.match_after : null,
        // A successful server-side paid optimization owns this result. Newer
        // API versions return the explicit per-analysis entitlement.
        canExport: typeof data.can_export === "boolean" ? data.can_export : true,
      });
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
      setPendingAction(null);
      setPendingIdempotencyKey(null);
      setPendingRequestFingerprint(null);
      clearWorkspaceFunnelDraft();
      clearWorkspaceDraftData(workspaceId, userEmail);

      if (data.analysis_id) {
        // Automatically inject the ID into localStorage so when /results mounts, it has a fallback if search params fail
        sessionStorage.setItem("current_analysis_id", String(data.analysis_id));
        trackEvent("ats_view_results", { location: "auto_redirect" });
        router.push(`/results?id=${data.analysis_id}`);
      } else {
        trackEvent("ats_view_results", { location: "auto_redirect" });
        router.push("/results");
      }
    } catch {
      setOptimizeStatus(
        "Connection interrupted. Try again — the same request will resume safely without charging twice.",
      );
    } finally {
      optimizationInFlightRef.current = false;
      setIsOptimizing(false);
    }
  };

  useEffect(() => {
    if (
      resumeAttemptedRef.current ||
      !workspaceReady ||
      !userEmail ||
      pendingAction !== "optimize" ||
      !parsed?.raw_text ||
      !jobText.trim() ||
      typeof window === "undefined"
    ) {
      return;
    }
    const url = new URL(window.location.href);
    if (url.searchParams.get("resume") !== "optimize") return;

    resumeAttemptedRef.current = true;
    const idempotencyKey =
      pendingIdempotencyKey || createIdempotencyKey("optimize");
    url.searchParams.delete("resume");
    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
    trackEvent("cta_click", {
      cta_name: "auth_intent_resumed",
      source: "optimization",
    });
    void runOptimization(idempotencyKey);
  }, [
    workspaceReady,
    userEmail,
    pendingAction,
    pendingIdempotencyKey,
    pendingRequestFingerprint,
    parsed,
    jobText,
    targetRole,
    targetCompany,
  ]);

  return (
    <main className="page">
      <TopNav />
      {notice && (
        <div
          className={`toast ${notice.kind === "error" ? "is-error" : "is-info"}`}
          role="alert"
          aria-live="polite"
          onClick={() => setNotice(null)}
        >
          {notice.message}
        </div>
      )}
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
              <div className="analysis-snapshot">
                <div className="analysis-snapshot-stats">
                  <div className="analysis-snapshot-stat">
                    <span className="analysis-snapshot-label">
                      {(() => {
                        const label = t("dashboard.matchScore").trimEnd();
                        return label.endsWith(":") ? label : `${label}:`;
                      })()}
                    </span>
                    <strong className="analysis-snapshot-value is-score">
                      {matchPercent !== null ? `${matchPercent}` : "—"}
                    </strong>
                  </div>
                  <div className="analysis-snapshot-stat">
                    <span className="analysis-snapshot-label">
                      {(() => {
                        const label = t("dashboard.missingKeywords").trimEnd();
                        return label.endsWith(":") ? label : `${label}:`;
                      })()}
                    </span>
                    <strong className="analysis-snapshot-value">{missingKeywords.length}</strong>
                  </div>
                </div>

                <div className="tag-list analysis-snapshot-tags">
                  {missingKeywords.length === 0 && <span className="tag">—</span>}
                  {missingKeywords.map((item) => (
                    <span className="tag" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="nav-actions">
              <button
                className="btn secondary"
                type="button"
                onClick={() => void runOptimization()}
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

      </div>
      {showAuthGate && (
        <div className="modal-backdrop" onClick={() => setShowAuthGate(false)}>
          <div
            className="modal-card fade-up paywall-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-gate-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="paywall-modal-close"
              type="button"
              aria-label={t("common.dismiss")}
              onClick={() => setShowAuthGate(false)}
            >
              ×
            </button>
            <div className="paywall-modal-hero">
              <div className="paywall-modal-icon" aria-hidden="true">
                🔒
              </div>
              <h3 className="paywall-modal-title" id="auth-gate-title">
                Sign in to generate your optimized CV
              </h3>
              <p className="paywall-modal-sub">
                Your CV and vacancy will stay securely in this tab for 30 minutes.
                We will continue automatically after you sign in.
              </p>
            </div>
            <div className="paywall-modal-actions">
              <Link
                className="btn primary"
                href={authHref("/login", "/app?resume=optimize")}
                onClick={() =>
                  trackEvent("cta_click", {
                    cta_name: "auth_started",
                    method: "email_or_oauth",
                    source: "optimization",
                  })
                }
              >
                {t("auth.logIn")}
              </Link>
              <Link
                className="btn secondary"
                href={authHref("/register", "/app?resume=optimize")}
                onClick={() =>
                  trackEvent("cta_click", {
                    cta_name: "auth_started",
                    method: "email_or_oauth",
                    source: "optimization",
                  })
                }
              >
                {t("auth.createBtn")}
              </Link>
              <button
                className="btn ghost"
                type="button"
                onClick={() => setShowAuthGate(false)}
              >
                {t("common.dismiss")}
              </button>
            </div>
          </div>
        </div>
      )}
      <PremiumModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </main>
  );
}
