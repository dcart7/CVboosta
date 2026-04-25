"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import TopNav from "../components/TopNav";
import PremiumModal from "../components/PremiumModal";
import { getApiBase } from "../lib/apiBase";
import { fetchWithRetry } from "../lib/fetchRetry";
import { useTranslation } from "../lib/LanguageContext";
import {
  fetchWorkspaceEmail,
  migrateLegacyGuestWorkspace,
  workspaceIdFromEmail,
  wsFieldKey,
} from "../lib/workspaceStorage";

type PdfTemplateId =
  | "classic"
  | "modern"
  | "executive"
  | "minimal"
  | "compact"
  | "noir"
  | "sidebar"
  | "serif"
  | "timeline";

type PdfTemplate = {
  id: PdfTemplateId;
  name: string;
  accent: { r: number; g: number; b: number };
  marginX: number;
  marginY: number;
  fontBody: number;
  fontHeader: number;
  fontTitle: number;
  lineGap: number;
  titleBar: boolean;
  footer: boolean;
  layout: "single" | "sidebar" | "timeline";
  fontFamily: "helvetica" | "times";
};

type InterviewQuestion = {
  question: string;
  why: string;
  tips: string;
};

const PDF_TEMPLATES: PdfTemplate[] = [
  {
    id: "modern",
    name: "Modern Blue",
    accent: { r: 30, g: 58, b: 138 },
    marginX: 44,
    marginY: 54,
    fontBody: 10.5,
    fontHeader: 13,
    fontTitle: 24,
    lineGap: 3.5,
    titleBar: false,
    footer: true,
    layout: "single",
    fontFamily: "helvetica",
  },
  {
    id: "executive",
    name: "Executive Gold",
    accent: { r: 184, g: 134, b: 11 },
    marginX: 50,
    marginY: 64,
    fontBody: 11,
    fontHeader: 13.5,
    fontTitle: 22,
    lineGap: 3.2,
    titleBar: true,
    footer: true,
    layout: "single",
    fontFamily: "times",
  },
  {
    id: "classic",
    name: "Classic Noir",
    accent: { r: 17, g: 17, b: 17 },
    marginX: 54,
    marginY: 64,
    fontBody: 11,
    fontHeader: 14,
    fontTitle: 22,
    lineGap: 3.5,
    titleBar: false,
    footer: false,
    layout: "single",
    fontFamily: "times",
  },
  {
    id: "minimal",
    name: "Pure Minimal",
    accent: { r: 10, g: 132, b: 255 },
    marginX: 68,
    marginY: 78,
    fontBody: 10.5,
    fontHeader: 12.5,
    fontTitle: 20,
    lineGap: 4,
    titleBar: false,
    footer: false,
    layout: "single",
    fontFamily: "helvetica",
  },
  {
    id: "compact",
    name: "Compact Pro",
    accent: { r: 64, g: 64, b: 64 },
    marginX: 34,
    marginY: 40,
    fontBody: 9.75,
    fontHeader: 11.5,
    fontTitle: 18,
    lineGap: 2.2,
    titleBar: false,
    footer: true,
    layout: "single",
    fontFamily: "helvetica",
  },
  {
    id: "noir",
    name: "Noir Slate",
    accent: { r: 99, g: 166, b: 255 },
    marginX: 48,
    marginY: 60,
    fontBody: 11,
    fontHeader: 13,
    fontTitle: 21,
    lineGap: 3.5,
    titleBar: true,
    footer: true,
    layout: "single",
    fontFamily: "helvetica",
  },
  {
    id: "sidebar",
    name: "Dual Column",
    accent: { r: 26, g: 115, b: 232 },
    marginX: 40,
    marginY: 50,
    fontBody: 10.2,
    fontHeader: 12.5,
    fontTitle: 20,
    lineGap: 3,
    titleBar: false,
    footer: true,
    layout: "sidebar",
    fontFamily: "helvetica",
  },
  {
    id: "serif",
    name: "Serif Elegant",
    accent: { r: 127, g: 29, b: 29 },
    marginX: 54,
    marginY: 64,
    fontBody: 10.5,
    fontHeader: 12.5,
    fontTitle: 24,
    lineGap: 4,
    titleBar: false,
    footer: true,
    layout: "single",
    fontFamily: "times",
  },
  {
    id: "timeline",
    name: "Chronological",
    accent: { r: 8, g: 145, b: 178 },
    marginX: 54,
    marginY: 64,
    fontBody: 10.5,
    fontHeader: 13,
    fontTitle: 20,
    lineGap: 3.5,
    titleBar: false,
    footer: true,
    layout: "timeline",
    fontFamily: "helvetica",
  },
];

const DEFAULT_PDF_TEMPLATE: PdfTemplateId = "modern";
const SITE_LAUNCH_DATE_RAW = process.env.NEXT_PUBLIC_SITE_LAUNCH_DATE || "2026-04-21";
const WATERMARK_GRACE_PERIOD_DAYS = 30;

type PreviewBlock =
  | { type: "title"; text: string }
  | { type: "heading"; text: string }
  | { type: "bullet"; text: string }
  | { type: "text"; text: string }
  | { type: "spacer" };

function sanitizeCvText(input: string): string {
  if (!input) return "";
  return (
    input
      .replace(/\r\n/g, "\n")
      .replace(/[\x00-\x08\x0B-\x1F\x7F]/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/^CVboosta\s*•\s*Page.*$/gim, "")
      .replace(/^CVboosta\s*•\s*P.*$/gim, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

function isSectionHeading(line: string): boolean {
  const trimmed = line.trim().replace(/:$/, "");
  if (!trimmed) return false;
  const key = trimmed.toLowerCase();
  const known = new Set([
    "summary",
    "profile",
    "experience",
    "work experience",
    "employment",
    "education",
    "skills",
    "projects",
    "certifications",
    "certificates",
    "awards",
    "languages",
    "volunteering",
    "interests",
    "technical skills",
    "hard skills",
    "soft skills",
    "contact",
    "контакти",
    "досвід",
    "досвід роботи",
    "освіта",
    "навички",
    "курси",
    "сертифікати",
    "проекти",
    "професійний досвід",
  ]);
  if (known.has(key)) return true;
  if (trimmed.length > 48) return false;
  
  // Case-based heuristic for custom headings
  const letters = trimmed.replace(/[^A-Za-zА-Яа-яЁёІіЇїЄє]/g, "");
  if (letters.length >= 4) {
    const upperLetters = letters.replace(/[^A-ZА-ЯЁІЇЄ]/g, "");
    if (upperLetters.length / letters.length > 0.8) return true;
  }
  return false;
}

function parsePreviewBlocks(input: string): PreviewBlock[] {
  const cleaned = sanitizeCvText(input);
  if (!cleaned) return [];
  const lines = cleaned.split("\n");
  const blocks: PreviewBlock[] = [];

  const firstNonEmpty = lines.find((l) => l.trim());
  if (firstNonEmpty) {
    blocks.push({ type: "title", text: firstNonEmpty.trim() });
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      blocks.push({ type: "spacer" });
      continue;
    }
    if (firstNonEmpty && line.trim() === firstNonEmpty.trim()) {
      continue;
    }

    const trimmed = line.trim();
    const bulletMatch = trimmed.match(/^(?:[•\-\*]+)\s+(.*)$/);
    if (bulletMatch && bulletMatch[1]) {
      blocks.push({ type: "bullet", text: bulletMatch[1].trim() });
      continue;
    }
    if (isSectionHeading(trimmed)) {
      blocks.push({ type: "heading", text: trimmed.replace(/:$/, "") });
      continue;
    }
    blocks.push({ type: "text", text: trimmed });
  }

  return blocks.slice(0, 60);
}

type CvSection = { heading: string; lines: string[] };

function extractSections(cleanedCv: string): { title: string; sections: CvSection[] } {
  const lines = cleanedCv.split("\n").map((line) => line.trimEnd());
  const title = lines.find((line) => line.trim())?.trim() || "Optimized CV";

  const sections: CvSection[] = [];
  let current: CvSection | null = null;

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      if (current) current.lines.push("");
      continue;
    }
    if (line.trim() === title.trim()) {
      continue;
    }
    if (isSectionHeading(line)) {
      if (current) sections.push(current);
      current = { heading: line.replace(/:$/, "").trim(), lines: [] };
      continue;
    }
    if (!current) {
      current = { heading: "Summary", lines: [] };
    }
    current.lines.push(line);
  }
  if (current) sections.push(current);
  return { title, sections };
}

function extractNameOnly(titleLine: string): string {
  const raw = (titleLine || "").trim();
  if (!raw) return "Optimized CV";

  // Remove common contact patterns to keep header as name only.
  let cleaned = raw
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "")
    .replace(/\b(?:https?:\/\/|www\.)\S+\b/gi, "")
    .replace(/\b(?:linkedin|github)\b[:/\s-]*\S*/gi, "")
    .replace(/[|•]/g, " ");

  cleaned = cleaned.replace(/\s{2,}/g, " ").trim();
  if (!cleaned) return "Optimized CV";

  // Keep first 4 words max for a compact, clean heading.
  const words = cleaned.split(/\s+/).slice(0, 4);
  return words.join(" ");
}

function extractHeaderDetails(cleanedCv: string, titleLineRaw: string): string[] {
  const lines = cleanedCv.split("\n").map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return [];

  const firstTitle = (titleLineRaw || lines[0] || "").trim();
  const startIdx = Math.max(0, lines.findIndex((line) => line === firstTitle));
  const details: string[] = [];

  for (let i = startIdx + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) break;
    if (isSectionHeading(line)) break;
    const normalizedBullet = line.replace(/^(?:[•\-\*]+)\s+/, "").trim();
    if (!normalizedBullet) continue;
    details.push(normalizedBullet);
    if (details.length >= 3) break;
  }
  return details;
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner"></div></div>}>
      <ResultsContent />
    </Suspense>
  );
}

function ResultsContent() {
  const apiBase = getApiBase();
  const searchParams = useSearchParams();
  const { t, language } = useTranslation();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com";
  const [optimizedCv, setOptimizedCv] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const [addedKeywords, setAddedKeywords] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [matchBefore, setMatchBefore] = useState<number | null>(null);
  const [matchAfter, setMatchAfter] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [pdfTemplate, setPdfTemplate] =
    useState<PdfTemplateId>(DEFAULT_PDF_TEMPLATE);
  const [showFullCv, setShowFullCv] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([]);
  const [isLoadingPrep, setIsLoadingPrep] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [prepError, setPrepError] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [sessionLoadError, setSessionLoadError] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [isLoadingCL, setIsLoadingCL] = useState(false);
  const [clError, setClError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"document" | "metrics">("document");
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("free");

  const sessionId = searchParams.get("id");
  const shareBefore = typeof matchBefore === "number" ? Math.max(0, Math.min(100, Math.round(matchBefore))) : null;
  const shareAfter = typeof matchAfter === "number" ? Math.max(0, Math.min(100, Math.round(matchAfter))) : null;
  const shareUrl =
    shareBefore !== null && shareAfter !== null
      ? `${siteUrl}/share/result?before=${encodeURIComponent(String(shareBefore))}&after=${encodeURIComponent(String(shareAfter))}`
      : `${siteUrl}/share/result`;
  const shareTitle =
    shareAfter !== null
      ? `My ATS resume score is ${shareAfter}/100`
      : "I just optimized my CV for ATS";
  const shareText =
    shareAfter !== null && shareBefore !== null
      ? `I improved my ATS resume score from ${shareBefore}% to ${shareAfter}% with CVboosta.`
      : "I just checked and improved my resume for ATS.";
  const composedShareMessage = `${shareText} ${shareUrl}`;

  const loadHistorySession = useCallback(async () => {
    if (!sessionId) return;
    setIsLoadingSession(true);
    setSessionLoadError(null);
    try {
      const res = await fetchWithRetry(
        `${apiBase}/history/${sessionId}`,
        undefined,
        { attempts: 5, baseDelayMs: 400, timeoutMs: 20_000 },
      );
      if (res.status === 401) {
        setSessionLoadError(t("results.sessionLoginRequired"));
        return;
      }
      if (res.status === 404) {
        setSessionLoadError(t("results.sessionNotFound"));
        return;
      }
      if (!res.ok) {
        setSessionLoadError(t("results.sessionLoadFailed"));
        return;
      }
      const data = await res.json();
      setOptimizedCv(data.optimized_cv || "");
      setMissing(data.missing_skills || []);
      setAddedKeywords(data.added_keywords || []);
      setRecommendations(data.recommendations || []);
      setMatchBefore(data.match_before || 0);
      setMatchAfter(data.match_after || 0);
      setCoverLetter(data.cover_letter || "");
      setInterviewQuestions(data.interview_questions || []);

      const email = await fetchWorkspaceEmail(apiBase);
      const wid = workspaceIdFromEmail(email);
      migrateLegacyGuestWorkspace(wid);

      localStorage.setItem("optimized_cv", data.optimized_cv || "");
      localStorage.setItem("missing_skills", JSON.stringify(data.missing_skills || []));
      localStorage.setItem("added_keywords", JSON.stringify(data.added_keywords || []));
      localStorage.setItem("recommendations", JSON.stringify(data.recommendations || []));
      localStorage.setItem("match_before", (data.match_before || 0).toString());
      localStorage.setItem("match_after", (data.match_after || 0).toString());
      localStorage.setItem(
        wsFieldKey(wid, "job_text"),
        data.job_description || "",
      );
    } catch {
      setSessionLoadError(t("results.sessionLoadFailed"));
    } finally {
      setIsLoadingSession(false);
    }
  }, [apiBase, sessionId, t]);

  useEffect(() => {
    if (sessionId) void loadHistorySession();
  }, [sessionId, loadHistorySession]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const email = await fetchWorkspaceEmail(apiBase);
      if (cancelled) return;
      const wid = workspaceIdFromEmail(email);
      migrateLegacyGuestWorkspace(wid);

      const storedTemplate = localStorage.getItem("pdf_template");
      if (
        storedTemplate === "classic" ||
        storedTemplate === "modern" ||
        storedTemplate === "executive" ||
        storedTemplate === "minimal" ||
        storedTemplate === "compact" ||
        storedTemplate === "noir" ||
        storedTemplate === "sidebar" ||
        storedTemplate === "serif" ||
        storedTemplate === "timeline"
      ) {
        setPdfTemplate(storedTemplate);
      }

      const storedCv = localStorage.getItem("optimized_cv") || "";
      let storedMissing: string[] = [];
      let storedAdded: string[] = [];
      let storedRecs: string[] = [];
      try {
        storedMissing = JSON.parse(localStorage.getItem("missing_skills") || "[]");
        storedAdded = JSON.parse(localStorage.getItem("added_keywords") || "[]");
        storedRecs = JSON.parse(localStorage.getItem("recommendations") || "[]");
      } catch (e) {
        console.error("Failed to parse storage:", e);
      }
      const storedBefore = localStorage.getItem("match_before");
      const storedAfter = localStorage.getItem("match_after");
      setOptimizedCv(storedCv);
      setMissing(storedMissing);
      setAddedKeywords(storedAdded);
      setRecommendations(storedRecs);
      if (storedBefore !== null && !Number.isNaN(Number(storedBefore))) {
        setMatchBefore(Number(storedBefore));
      }
      if (storedAfter !== null && !Number.isNaN(Number(storedAfter))) {
        setMatchAfter(Number(storedAfter));
      }

      const cvText = localStorage.getItem(wsFieldKey(wid, "cv_text")) || "";
      const jobText = localStorage.getItem(wsFieldKey(wid, "job_text")) || "";
      if (!cvText || !jobText) {
        setStatus(t("results.missingInputs"));
        return;
      }
      if (storedBefore !== null && storedAfter !== null) {
        return;
      }
      const loadScores = async () => {
        try {
          const beforeRes = await fetch(`${apiBase}/analyze/match`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cv_text: cvText, job_text: jobText }),
          });
          if (!beforeRes.ok) throw new Error("before");
          const beforeData = await beforeRes.json();
          const beforeValue = beforeData.match_percent ?? null;
          setMatchBefore(beforeValue);
          if (typeof beforeValue === "number") {
            localStorage.setItem("match_before", String(beforeValue));
          }

          if (storedCv) {
            const afterRes = await fetch(`${apiBase}/analyze/match`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cv_text: storedCv, job_text: jobText }),
            });
            if (!afterRes.ok) throw new Error("after");
            const afterData = await afterRes.json();
            const afterValue = afterData.match_percent ?? null;
            setMatchAfter(afterValue);
            if (typeof afterValue === "number") {
              localStorage.setItem("match_after", String(afterValue));
            }
          } else {
            setMatchAfter(null);
          }
        } catch {
          setStatus(t("results.matchLoadFailed"));
        }
      };
      void loadScores();
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchWithRetry(
          `${apiBase}/billing/status`,
          undefined,
          { attempts: 3, baseDelayMs: 250, timeoutMs: 12_000 },
        );
        if (!res.ok) {
          if (!cancelled) setSubscriptionTier("free");
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setSubscriptionTier(typeof data?.tier === "string" ? data.tier : "free");
        }
      } catch {
        if (!cancelled) setSubscriptionTier("free");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  const activeTemplate =
    PDF_TEMPLATES.find((item) => item.id === pdfTemplate) || PDF_TEMPLATES[0];

  const cleanedCv = useMemo(() => sanitizeCvText(optimizedCv), [optimizedCv]);
  const previewBlocks = useMemo(
    () => parsePreviewBlocks(optimizedCv),
    [optimizedCv],
  );
  const parsedCv = useMemo(() => extractSections(cleanedCv), [cleanedCv]);
  const headerName = useMemo(() => extractNameOnly(parsedCv.title), [parsedCv.title]);
  const headerDetails = useMemo(
    () => extractHeaderDetails(cleanedCv, parsedCv.title),
    [cleanedCv, parsedCv.title],
  );
  const compactSummary = useMemo(() => {
    if (!previewBlocks.length) return "";
    const items = previewBlocks
      .filter((block) => block.type === "text" || block.type === "bullet")
      .slice(0, 6)
      .map((block) => ("text" in block ? block.text : ""))
      .filter(Boolean);
    const joined = items.join(" · ");
    const limit = 320;
    if (joined.length <= limit) return joined;
    return `${joined.slice(0, limit).trim()}…`;
  }, [previewBlocks]);
  const titleBarPreviewBlocks = useMemo(() => {
    if (headerDetails.length === 0) {
      return previewBlocks.filter((block) => block.type !== "title");
    }

    const detailsQueue = [...headerDetails];
    return previewBlocks
      .filter((block) => block.type !== "title")
      .filter((block) => {
        if (detailsQueue.length === 0) return true;
        if (block.type !== "text" && block.type !== "bullet") return true;
        const text = ("text" in block ? block.text : "").trim();
        if (!text) return true;
        if (text === detailsQueue[0]) {
          detailsQueue.shift();
          return false;
        }
        return true;
      });
  }, [previewBlocks, headerDetails]);

  const remainingKeywords = missing;
  const isFreeTier = subscriptionTier === "free";
  const isWithinFirstMonthFromLaunch = useMemo(() => {
    const launchDate = new Date(SITE_LAUNCH_DATE_RAW);
    if (Number.isNaN(launchDate.getTime())) return false;
    const gracePeriodEnd = new Date(launchDate.getTime() + WATERMARK_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
    return Date.now() < gracePeriodEnd.getTime();
  }, []);
  const showBrandingFooter = isFreeTier && isWithinFirstMonthFromLaunch;
  const showFullPageWatermark = isFreeTier && !isWithinFirstMonthFromLaunch;

  useEffect(() => {
    const clearTransientResults = () => {
      try {
        localStorage.removeItem("optimized_cv");
        localStorage.removeItem("missing_skills");
        localStorage.removeItem("added_keywords");
        localStorage.removeItem("recommendations");
        localStorage.removeItem("match_before");
        localStorage.removeItem("match_after");
        localStorage.removeItem("current_analysis_id");
      } catch {
        // ignore
      }
    };

    const onBeforeUnload = () => clearTransientResults();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      clearTransientResults();
    };
  }, []);

  const copyCv = async () => {
    if (!optimizedCv) {
      setStatus(t("results.noOptimizedCv"));
      return;
    }
    try {
      await navigator.clipboard.writeText(optimizedCv);
      setStatus(t("results.copiedToClipboard"));
    } catch (err) {
      console.error("Copy failed:", err);
      setStatus(t("results.copyFailed"));
    }
  };

  const shareResult = () => {
    if (shareBefore === null || shareAfter === null) {
      setStatus(t("results.matchLoadFailed"));
      return;
    }
    setIsShareSheetOpen(true);
  };

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareOnWhatsApp = () => {
    setIsShareSheetOpen(false);
    openShareWindow(
      `https://wa.me/?text=${encodeURIComponent(composedShareMessage)}`,
    );
  };

  const shareOnFacebook = () => {
    setIsShareSheetOpen(false);
    openShareWindow(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    );
  };

  const shareOnMessages = () => {
    setIsShareSheetOpen(false);
    const smsUrl = `sms:?&body=${encodeURIComponent(composedShareMessage)}`;
    window.location.href = smsUrl;
  };

  const shareOnTelegram = () => {
    setIsShareSheetOpen(false);
    openShareWindow(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    );
  };

  const shareForInstagram = async () => {
    try {
      await navigator.clipboard.writeText(composedShareMessage);
      setStatus(t("results.shareForInstagramCopied"));
      setIsShareSheetOpen(false);
      openShareWindow("https://www.instagram.com/");
    } catch {
      setStatus(t("results.copyFailed"));
    }
  };

  const shareForTikTok = async () => {
    try {
      await navigator.clipboard.writeText(composedShareMessage);
      setStatus(t("results.shareForTikTokCopied"));
      setIsShareSheetOpen(false);
      openShareWindow("https://www.tiktok.com/upload");
    } catch {
      setStatus(t("results.copyFailed"));
    }
  };

  const fetchInterviewPrep = async () => {
    const email = await fetchWorkspaceEmail(apiBase);
    const wid = workspaceIdFromEmail(email);
    migrateLegacyGuestWorkspace(wid);
    const jobText = localStorage.getItem(wsFieldKey(wid, "job_text")) || "";
    if (!jobText) {
      console.warn("No job_text found in localStorage");
      return;
    }

    setIsLoadingPrep(true);
    setPrepError(null);
    try {
      const response = await fetch(`${apiBase}/analyze/interview-prep`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          job_text: jobText,
          missing_keywords: missing,
          ui_language: language,
          analysis_id: sessionId ? parseInt(sessionId, 10) : null,
        }),
      });

      if (response.status === 402) {
        setShowUpgradeModal(true);
        setIsLoadingPrep(false);
        return;
      }

      if (!response.ok) {
        if (response.status === 404) throw new Error("error404");
        if (response.status === 503) throw new Error("error503");
        if (response.status === 502) throw new Error("error502");
        if (response.status >= 500) throw new Error("error500");
        throw new Error("genericError");
      }
      
      const data = await response.json();
      setInterviewQuestions(data.questions || []);
    } catch (err: any) {
      console.error("Interview prep error:", err);
      setPrepError(err.message || "genericError");
    } finally {
      setIsLoadingPrep(false);
    }
  };

  const fetchCoverLetter = async () => {
    const email = await fetchWorkspaceEmail(apiBase);
    const wid = workspaceIdFromEmail(email);
    const jobText = localStorage.getItem(wsFieldKey(wid, "job_text")) || "";
    const cvText = optimizedCv || localStorage.getItem(wsFieldKey(wid, "cv_text")) || "";
    
    if (!jobText || !cvText) {
      console.warn("Required text not found for cover letter");
      return;
    }

    setIsLoadingCL(true);
    setClError(null);
    try {
      const response = await fetch(`${apiBase}/optimize/cover-letter`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          cv_text: cvText,
          job_text: jobText,
          ui_language: language,
          analysis_id: sessionId ? parseInt(sessionId, 10) : null,
        }),
      });

      if (response.status === 402) {
        setShowUpgradeModal(true);
        setIsLoadingCL(false);
        return;
      }

      if (!response.ok) {
        throw new Error("genericError");
      }
      
      const data = await response.json();
      setCoverLetter(data.content || "");
    } catch (err: any) {
      console.error("Cover letter error:", err);
      setClError(err.message || "genericError");
    } finally {
      setIsLoadingCL(false);
    }
  };

  const downloadCoverLetterPdf = () => {
    if (!coverLetter) return;
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const margin = 50;
      const pageWidth = doc.internal.pageSize.getWidth();
      const contentWidth = pageWidth - margin * 2;
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text(t("results.coverLetterTitle"), margin, 60);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(coverLetter, contentWidth);
      doc.text(lines, margin, 90);

      if (showBrandingFooter) {
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text("Powered by CVboosta", margin, doc.internal.pageSize.getHeight() - 20);
        const rightText = "cvboosta.com";
        const rightX = pageWidth - margin - doc.getTextWidth(rightText);
        doc.text(rightText, rightX, doc.internal.pageSize.getHeight() - 20);
      }

      if (showFullPageWatermark) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(52);
        doc.setTextColor(235, 238, 245);
        doc.text("CVboosta", pageWidth / 2, doc.internal.pageSize.getHeight() / 2, {
          align: "center",
          angle: 32,
        } as any);
      }

      doc.save(showBrandingFooter || showFullPageWatermark ? "Cover_Letter_CVboosta.pdf" : "Cover_Letter.pdf");
    } catch (err) {
      console.error(err);
    }
  };

  const updateTemplate = (value: PdfTemplateId) => {
    setPdfTemplate(value);
    try {
      localStorage.setItem("pdf_template", value);
    } catch {
      // ignore
    }
  };

  const downloadPdf = () => {
    if (!cleanedCv) {
      setStatus(t("results.noOptimizedCv"));
      return;
    }
    try {
      const template = activeTemplate;
      const accent = template.accent;
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = template.marginX;
      const marginY = template.marginY;
      const contentWidth = pageWidth - marginX * 2;

      const fontBody = template.fontBody;
      const fontHeader = template.fontHeader;
      const fontTitle = template.fontTitle;
      const lineGap = template.lineGap;
      const fontFamily = template.fontFamily;

      const looksLikeHeader = (line: string) => {
        return isSectionHeading(line);
      };

      const normalizeBulletLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return { isBullet: false, text: "" };
        const match = trimmed.match(/^([•\-\*●○■□])\s+(.*)$/);
        if (match) return { isBullet: true, text: match[2].trim() };
        const matchNoSpace = trimmed.match(/^([•\-\*●○■□])(.*)$/);
        if (matchNoSpace) return { isBullet: true, text: matchNoSpace[2].trim() };
        return { isBullet: false, text: trimmed };
      };

      const ensureSpace = (y: number, neededHeight: number) => {
        if (y + neededHeight <= pageHeight - marginY) return y;
        doc.addPage();
        if (template.layout === "sidebar") {
          drawSidebarBg();
        }
        return marginY;
      };

      const drawSidebarBg = () => {
        if (template.layout !== "sidebar") return;
        doc.setFillColor(248, 250, 252); 
        doc.rect(0, 0, 180, pageHeight, "F");
        doc.setDrawColor(226, 232, 240); 
        doc.setLineWidth(0.5);
        doc.line(180, 0, 180, pageHeight);
      };

      const renderWrapped = (text: string, x: number, y: number, width: number, fontSize: number, bold = false) => {
        doc.setFont(fontFamily, bold ? "bold" : "normal");
        doc.setFontSize(fontSize);
        const wrapped = doc.splitTextToSize(text, width);
        const lineHeight = fontSize + lineGap;
        let cy = y;
        for (const chunk of wrapped) {
          cy = ensureSpace(cy, lineHeight);
          doc.text(chunk, x, cy);
          cy += lineHeight;
        }
        return cy;
      };

      const { title: titleLineRaw, sections } = parsedCv;
      const titleLine = extractNameOnly(titleLineRaw);
      const titleDetails = extractHeaderDetails(cleanedCv, titleLineRaw);
      let cursorY = marginY;

      if (template.layout === "sidebar") {
        drawSidebarBg();
        const sidebarWidth = 140;
        const leftX = marginX;
        const mainX = 200 + marginX;
        const mainWidth = pageWidth - mainX - marginX;

        doc.setFont(fontFamily, "bold");
        doc.setFontSize(fontTitle);
        doc.setTextColor(30, 41, 59);
        cursorY = renderWrapped(titleLine.trim(), mainX, cursorY, mainWidth, fontTitle, true);
        cursorY += 20;

        const sidebarSections = sections.filter(s => /skills|lang|contact|cert|award/i.test(s.heading));
        const mainSections = sections.filter(s => !/skills|lang|contact|cert|award/i.test(s.heading));

        let sy = marginY + 20;
        for (const sec of sidebarSections) {
          doc.setTextColor(accent.r, accent.g, accent.b);
          sy = renderWrapped(sec.heading.toUpperCase(), leftX, sy, sidebarWidth, 10, true);
          doc.setTextColor(51, 65, 85);
          sy += 4;
          for (const line of sec.lines) {
            if (!line.trim()) { sy += 4; continue; }
            sy = renderWrapped(line.trim(), leftX, sy, sidebarWidth, 9, false);
            sy += 2;
          }
          sy += 16;
        }

        for (const sec of mainSections) {
          doc.setTextColor(accent.r, accent.g, accent.b);
          cursorY = renderWrapped(sec.heading.toUpperCase(), mainX, cursorY, mainWidth, fontHeader, true);
          doc.setDrawColor(accent.r, accent.g, accent.b);
          doc.setLineWidth(1);
          doc.line(mainX, cursorY - 2, mainX + 40, cursorY - 2);
          cursorY += 10;
          doc.setTextColor(51, 65, 85);

          for (const raw of sec.lines) {
            const line = raw.trim();
            if (!line) { cursorY += 6; continue; }
            const bullet = normalizeBulletLine(line);
            if (bullet.isBullet) {
              doc.setTextColor(accent.r, accent.g, accent.b);
              doc.text("•", mainX, cursorY + (fontBody * 0.85));
              doc.setTextColor(51, 65, 85);
              cursorY = renderWrapped(bullet.text, mainX + 12, cursorY, mainWidth - 12, fontBody, false);
            } else {
              cursorY = renderWrapped(line, mainX, cursorY, mainWidth, fontBody, false);
            }
          }
          cursorY += 18;
        }
      } else {
        if (template.titleBar) {
          doc.setFillColor(accent.r, accent.g, accent.b);
          doc.rect(0, 0, pageWidth, 100, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFont(fontFamily, "bold");
          doc.setFontSize(fontTitle);
          const titleWrapped = doc.splitTextToSize(titleLine.trim(), contentWidth);
          doc.text(titleWrapped, marginX, 60);
          cursorY = 124;
          if (titleDetails.length > 0) {
            doc.setTextColor(71, 85, 105);
            doc.setFont(fontFamily, "normal");
            doc.setFontSize(Math.max(10, fontBody));
            for (const line of titleDetails) {
              cursorY = renderWrapped(line, marginX, cursorY, contentWidth, Math.max(10, fontBody), false);
              cursorY += 2;
            }
            cursorY += 10;
          }
        } else {
          doc.setTextColor(accent.r, accent.g, accent.b);
          cursorY = renderWrapped(titleLine.trim(), marginX, cursorY, contentWidth, fontTitle, true);
          cursorY += 12;
        }

        for (let secIdx = 0; secIdx < sections.length; secIdx += 1) {
          const sec = sections[secIdx];
          cursorY = ensureSpace(cursorY, fontHeader + 20);
          doc.setFont(fontFamily, "bold");
          doc.setFontSize(fontHeader);
          doc.setTextColor(accent.r, accent.g, accent.b);
          
          if (template.id === "timeline") {
             doc.setFillColor(accent.r, accent.g, accent.b);
             doc.circle(marginX - 20, cursorY - 4, 3, "F");
          }

          doc.text(sec.heading.toUpperCase(), marginX, cursorY);
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.5);
          doc.line(marginX, cursorY + 4, pageWidth - marginX, cursorY + 4);
          cursorY += 20;

          doc.setTextColor(30, 41, 59);
          const normalizedTitleDetails = titleDetails.map((line) => line.trim());
          const sectionLines =
            template.titleBar && secIdx === 0 && normalizedTitleDetails.length > 0
              ? (() => {
                  const linesCopy = [...sec.lines];
                  let idx = 0;
                  while (
                    idx < normalizedTitleDetails.length &&
                    linesCopy[idx] &&
                    linesCopy[idx].trim() === normalizedTitleDetails[idx]
                  ) {
                    idx += 1;
                  }
                  return linesCopy.slice(idx);
                })()
              : sec.lines;

          for (const raw of sectionLines) {
            const line = raw.trim();
            if (!line) { cursorY += 8; continue; }
            
            const bullet = normalizeBulletLine(line);
            if (bullet.isBullet) {
              doc.setTextColor(accent.r, accent.g, accent.b);
              doc.text("•", marginX + 4, cursorY + fontBody);
              doc.setTextColor(30, 41, 59);
              cursorY = renderWrapped(bullet.text, marginX + 18, cursorY, contentWidth - 18, fontBody, false);
            } else {
              cursorY = renderWrapped(line, marginX, cursorY, contentWidth, fontBody, false);
            }
          }
          cursorY += 12;
        }
      }

      if (template.id === "timeline") {
        const pageCount = doc.getNumberOfPages();
        for (let p = 1; p <= pageCount; p++) {
          doc.setPage(p);
          doc.setDrawColor(accent.r, accent.g, accent.b);
          doc.setLineWidth(1);
          doc.line(marginX - 20, marginY, marginX - 20, pageHeight - marginY);
        }
      }

      if (showBrandingFooter) {
        const pageCount = doc.getNumberOfPages();
        for (let page = 1; page <= pageCount; page += 1) {
          doc.setPage(page);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184); 
          doc.text("Powered by CVboosta", marginX, pageHeight - 20);
          const rightText = "cvboosta.com";
          const rightX = pageWidth - marginX - doc.getTextWidth(rightText);
          doc.text(rightText, rightX, pageHeight - 20);
        }
      }

      if (showFullPageWatermark) {
        const pageCount = doc.getNumberOfPages();
        for (let page = 1; page <= pageCount; page += 1) {
          doc.setPage(page);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(52);
          doc.setTextColor(235, 238, 245);
          doc.text("CVboosta", pageWidth / 2, pageHeight / 2, {
            align: "center",
            angle: 32,
          } as any);
        }
      }

      const safeFileTitle = titleLine.replace(/[^A-Za-z0-9_-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "") || "Optimized_CV";
      const fileName = showBrandingFooter || showFullPageWatermark
        ? `${safeFileTitle}_CVboosta_${template.id}.pdf`
        : `${safeFileTitle}_${template.id}.pdf`;
      doc.save(fileName);
      setStatus(t("results.pdfDownloaded"));
    } catch (err) {
      console.error(err);
      setStatus(t("results.pdfFailed"));
    }
  };

  void activeTemplate;

  return (
    <main className="page">
      <TopNav />
      {sessionId && sessionLoadError && !isLoadingSession && (
        <div className="shell" style={{ paddingTop: "1rem" }}>
          <div
            className="card"
            style={{
              borderColor: "#b42318",
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <p style={{ color: "#b42318", margin: 0, flex: "1 1 200px" }}>
              {sessionLoadError}
            </p>
            <button
              className="btn primary"
              type="button"
              onClick={() => void loadHistorySession()}
            >
              {t("results.sessionRetry")}
            </button>
            <Link className="btn ghost" href="/login">
              {t("nav.login")}
            </Link>
          </div>
        </div>
      )}
      {isLoadingSession && (
        <div className="modal-backdrop" style={{ zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(9, 12, 18, 0.8)' }}>
          <div className="spinner" style={{ marginBottom: '16px' }}></div>
          <p style={{ color: 'white', fontWeight: 500 }}>{t("results.loadingSession")}</p>
        </div>
      )}
      {optimizedCv && (
        <div className="print-only">
          {cleanedCv.split(/\r?\n/).map((line, idx) => {
            const isHeading = line === line.toUpperCase() && line.length > 2 && line.length < 50 && !line.startsWith("-");
            if (idx === 0) return <h1 key={`line-${idx}`} style={{ fontSize: "24pt", margin: "0 0 16pt", borderBottom: "2px solid #333", paddingBottom: "8pt" }}>{line}</h1>;
            if (isHeading) return <h2 key={`line-${idx}`} style={{ fontSize: "12pt", color: "#1e3a8a", margin: "16pt 0 4pt", textTransform: "uppercase", borderBottom: "1px solid #ccc", paddingBottom: "2pt" }}>{line}</h2>;
            if (!line.trim()) return <div key={`line-${idx}`} style={{ height: "8pt" }} />;
            if (line.startsWith("-") || line.startsWith("•")) return <p key={`line-${idx}`} style={{ margin: "2pt 0 2pt 16pt", textIndent: "-8pt" }}>• {line.substring(1).trim()}</p>;
            return <p key={`line-${idx}`} style={{ margin: "2pt 0" }}>{line}</p>;
          })}
        </div>
      )}
      <div className="shell hide-print">
        <div className="mobile-only" style={{ marginBottom: "20px" }}>
           <div style={{ display: "flex", background: "var(--surface-2)", padding: "4px", borderRadius: "12px", gap: "4px" }}>
              <button 
                className="btn" 
                style={{ flex: 1, padding: "8px", borderRadius: "8px", background: activeTab === 'document' ? 'var(--accent)' : 'transparent', color: activeTab === 'document' ? 'white' : 'var(--muted)', border: 'none' }}
                onClick={() => setActiveTab('document')}
              >
                {t("results.optimizedCv")}
              </button>
              <button 
                className="btn" 
                style={{ flex: 1, padding: "8px", borderRadius: "8px", background: activeTab === 'metrics' ? 'var(--accent)' : 'transparent', color: activeTab === 'metrics' ? 'white' : 'var(--muted)', border: 'none' }}
                onClick={() => setActiveTab('metrics')}
              >
                {t("results.resultMetrics")}
              </button>
           </div>
        </div>

        <section className="split fade-up">
          <div className={`hero-card ${activeTab === 'document' ? "" : "desktop-only"}`}>
            <h2 className="section-title">{t("results.optimizedCv")}</h2>
              <div className="grid">
                <div className="kpi">
                  <h3>{matchBefore !== null ? `${matchBefore}%` : "—"}</h3>
                  <p>{t("results.fitBefore")}</p>
                </div>
                <div className="kpi">
                  <h3>{matchAfter !== null ? `${matchAfter}%` : "—"}</h3>
                  <p>{t("results.fitAfter")}</p>
                </div>
              </div>
              <div className={`result-box${showFullCv ? " is-expanded" : ""}`}>
                <div className="result-box-head">
                  <h3>{t("results.summary")}</h3>
                  <button
                    className="mini-btn"
                    type="button"
                    onClick={() => setShowFullCv((value) => !value)}
                    disabled={!cleanedCv}
                  >
                    {showFullCv ? t("results.collapse") : t("results.expand")}
                  </button>
                </div>
                <p className="summary-snippet">{compactSummary || "—"}</p>
                {showFullCv && (
                  <div className="cv-full" aria-label="Full optimized CV">
                    {cleanedCv.split(/\r?\n/).map((line, idx) => (
                      <div key={`cv-${idx}`}>{line}</div>
                    ))}
                  </div>
                )}
              </div>
              <div className="section">
                <h3 className="section-title">{t("results.pdfTemplate")}</h3>
                <div className="template-picker" role="group" aria-label="PDF template">
                  {PDF_TEMPLATES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`chip${item.id === pdfTemplate ? " is-active" : ""}`}
                      onClick={() => updateTemplate(item.id)}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
                <div className={`pdf-preview template-${pdfTemplate}`} aria-label="PDF preview">
                  {pdfTemplate === "sidebar" ? (
                    <>
                      <div className="pdf-col sidebar">
                        <div className="pdf-title">{parsedCv.title}</div>
                        {(parsedCv.sections
                          .filter((s) => /skills|languages|cert|award|contact/i.test(s.heading))
                          .slice(0, 2)
                        ).map((sec, idx) => (
                          <div key={`left-${sec.heading}-${idx}`}>
                            <div className="pdf-heading">{sec.heading}</div>
                            {sec.lines
                              .filter((l) => l.trim())
                              .slice(0, 6)
                              .map((line, idx) => (
                                <div className="pdf-bullet" key={`lb-${idx}`}>
                                  <span className="pdf-bullet-dot">•</span>
                                  <span>{line.replace(/^(?:[•\-\*]+)\s+/, "")}</span>
                                </div>
                              ))}
                          </div>
                        ))}
                      </div>
                      <div className="pdf-col">
                        {(parsedCv.sections
                          .filter((s) => !/skills|languages|cert|award|contact/i.test(s.heading))
                          .slice(0, 3)
                        ).map((sec, idx) => (
                          <div key={`right-${sec.heading}-${idx}`}>
                            <div className="pdf-heading">{sec.heading}</div>
                            {sec.lines
                              .filter((l) => l.trim())
                              .slice(0, 8)
                              .map((line, idx) => (
                                <div className="pdf-text" key={`rt-${idx}`}>
                                  {line.replace(/^(?:[•\-\*]+)\s+/, "")}
                                </div>
                              ))}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : activeTemplate.titleBar ? (
                    <>
                      <div className="pdf-bar-title">{headerName}</div>
                      {headerDetails.map((line, idx) => (
                        <div className="pdf-contact-line" key={`c-${idx}`}>
                          {line}
                        </div>
                      ))}
                      {titleBarPreviewBlocks
                        .slice(0, 22)
                        .map((block, idx) => {
                          if (block.type === "spacer") return <div className="pdf-spacer" key={`s-${idx}`} />;
                          if (block.type === "heading") return <div className="pdf-heading" key={`h-${idx}`}>{block.text}</div>;
                          if (block.type === "bullet") return (
                            <div className="pdf-bullet" key={`b-${idx}`}>
                              <span className="pdf-bullet-dot">•</span>
                              <span>{block.text}</span>
                            </div>
                          );
                          return <div className="pdf-text" key={`p-${idx}`}>{block.text}</div>;
                        })}
                    </>
                  ) : (
                    previewBlocks.slice(0, 28).map((block, idx) => {
                      if (block.type === "spacer") return <div className="pdf-spacer" key={`s-${idx}`} />;
                      if (block.type === "title") return <div className="pdf-title" key={`t-${idx}`}>{block.text}</div>;
                      if (block.type === "heading") return <div className="pdf-heading" key={`h-${idx}`}>{block.text}</div>;
                      if (block.type === "bullet") return (
                        <div className="pdf-bullet" key={`b-${idx}`}>
                          <span className="pdf-bullet-dot">•</span>
                          <span>{block.text}</span>
                        </div>
                      );
                      return <div className="pdf-text" key={`p-${idx}`}>{block.text}</div>;
                    })
                  )}
                </div>
              </div>
              <div className="nav-actions main-actions">
                <button className="btn primary" onClick={copyCv}>
                  {t("results.copyFullCv")}
                </button>
                <button className="btn secondary" onClick={downloadPdf}>
                  {t("results.downloadPdf")}
                </button>
                <button className="btn ghost" onClick={shareResult}>
                  {t("results.shareResult")}
                </button>
              </div>
              {status && status !== t("results.missingInputs") && <p>{status}</p>}
            </div>
            {isShareSheetOpen && (
              <div
                className="modal-backdrop"
                onClick={() => setIsShareSheetOpen(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="modal-card fade-up share-modal-card"
                >
                  <div className="share-modal-header">
                    <h3 className="share-modal-title">{t("results.shareYourResult")}</h3>
                    <button className="btn ghost" onClick={() => setIsShareSheetOpen(false)}>
                      {t("common.dismiss")}
                    </button>
                  </div>
                  <div className="share-modal-actions">
                    <button className="btn ghost" type="button" onClick={shareOnWhatsApp}>
                      {t("results.shareOnWhatsApp")}
                    </button>
                    <button className="btn ghost" type="button" onClick={shareOnFacebook}>
                      {t("results.shareOnFacebook")}
                    </button>
                    <button className="btn ghost" type="button" onClick={shareOnMessages}>
                      {t("results.shareOnMessages")}
                    </button>
                    <button className="btn ghost" type="button" onClick={shareOnTelegram}>
                      {t("results.shareOnTelegram")}
                    </button>
                    <button className="btn ghost" type="button" onClick={shareForInstagram}>
                      {t("results.shareForInstagram")}
                    </button>
                    <button className="btn ghost" type="button" onClick={shareForTikTok}>
                      {t("results.shareForTikTok")}
                    </button>
                  </div>
                </div>
              </div>
            )}

          <div className={`metrics-column ${activeTab === 'metrics' ? "" : "desktop-only"}`}>
            <div className="form-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ flex: 1 }}>
                  <h2 className="section-title" style={{ marginBottom: "4px" }}>
                    {t("results.coverLetterTitle")}
                  </h2>
                  <p className="hero-subtitle" style={{ fontSize: "14px", margin: 0, opacity: 0.8 }}>
                    {t("results.coverLetterSubtitle")}
                  </p>
                </div>
                {!coverLetter && (
                  <button
                    className="btn secondary"
                    onClick={fetchCoverLetter}
                    disabled={isLoadingCL}
                    style={{ marginLeft: "16px" }}
                  >
                    {isLoadingCL ? t("results.loadingCoverLetter") : t("results.generateCoverLetter")}
                  </button>
                )}
              </div>
              {isLoadingCL && (
                <div style={{ padding: "30px 0", textAlign: "center" }}>
                  <div className="spinner" style={{ margin: "0 auto 12px" }}></div>
                  <p style={{ color: "var(--muted)" }}>{t("results.loadingCoverLetter")}</p>
                </div>
              )}
              {coverLetter && (
                <div className="fade-in">
                  <div style={{ 
                    background: "rgba(255, 255, 255, 0.03)", 
                    border: "1px solid var(--glass-border)", 
                    padding: "24px", 
                    borderRadius: "16px",
                    fontFamily: "var(--font-serif, serif)",
                    lineHeight: "1.6",
                    fontSize: "15px",
                    whiteSpace: "pre-wrap",
                    color: "var(--ink)"
                  }}>
                    {coverLetter}
                  </div>
                  <div className="nav-actions" style={{ marginTop: "16px" }}>
                    <button className="btn ghost" onClick={async () => {
                      await navigator.clipboard.writeText(coverLetter);
                      setStatus(t("results.copiedToClipboard"));
                    }}>
                      {t("results.copyCoverLetter")}
                    </button>
                    <button className="btn ghost" onClick={downloadCoverLetterPdf}>
                      {t("results.downloadCoverLetterPdf")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div id="interview-prep-section" className="form-card" style={{ marginTop: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ flex: 1 }}>
                  <h2 className="section-title" style={{ marginBottom: "4px" }}>
                    {t("results.interviewPrepTitle")}
                  </h2>
                  <p className="hero-subtitle" style={{ fontSize: "14px", margin: 0, opacity: 0.8 }}>
                    {t("results.interviewPrepSubtitle")}
                  </p>
                </div>
                {interviewQuestions.length === 0 && (
                  <button
                    className="btn secondary"
                    onClick={async () => {
                      await fetchInterviewPrep();
                      setTimeout(() => {
                        document.getElementById("interview-prep-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 800);
                    }}
                    disabled={isLoadingPrep}
                    style={{ marginLeft: "16px" }}
                  >
                    {isLoadingPrep ? t("results.loadingPrep") : t("results.generateInterviewPrep")}
                  </button>
                )}
              </div>
              {prepError && (
                <div style={{ marginBottom: "16px", padding: "12px", background: "rgba(180, 35, 24, 0.1)", border: "1px solid rgba(180, 35, 24, 0.2)", borderRadius: "12px", color: "#f04438", fontSize: "14px" }}>
                  {t(`results.${prepError}`)}
                </div>
              )}
              {isLoadingPrep && (
                <div style={{ padding: "40px 0", textAlign: "center" }}>
                  <div className="spinner" style={{ margin: "0 auto 12px" }}></div>
                  <p style={{ color: "var(--muted)" }}>{t("results.loadingPrep")}</p>
                </div>
              )}
              <div className="questions-list" style={{ display: "grid", gap: "12px" }}>
                {interviewQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="question-card"
                    onClick={() => setExpandedQuestion(expandedQuestion === idx ? null : idx)}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "16px",
                      padding: "16px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold", flexShrink: 0 }}>
                        {idx + 1}
                      </span>
                      <p style={{ margin: 0, fontWeight: 600, flexGrow: 1, fontSize: "15px" }}>
                        {q.question}
                      </p>
                      <span style={{ fontSize: "20px", opacity: 0.4 }}>
                        {expandedQuestion === idx ? "−" : "+"}
                      </span>
                    </div>
                    {expandedQuestion === idx && (
                      <div className="fade-in" style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--glass-border)" }}>
                        <div style={{ marginBottom: "16px" }}>
                          <label style={{ display: "block", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "var(--accent)", marginBottom: "6px", letterSpacing: "0.05em" }}>
                            {t("results.whyThisIsAsked")}
                          </label>
                          <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5", color: "var(--ink)", opacity: 0.9 }}>{q.why}</p>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "var(--accent)", marginBottom: "6px", letterSpacing: "0.05em" }}>
                            {t("results.howToAnswer")}
                          </label>
                          <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5", color: "var(--ink)", opacity: 0.9 }}>{q.tips}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-card" style={{ marginTop: "24px" }}>
              <h2 className="section-title">{t("results.resultMetrics")}</h2>
              <div className="grid">
                <div className="kpi">
                  <h3>{missing.length}</h3>
                  <p>{t("results.missingKeywords")}</p>
                </div>
                <div className="kpi">
                  <h3>{recommendations.length}</h3>
                  <p>{t("results.recommendations")}</p>
                </div>
              </div>
              <div className="section">
                <h3 className="section-title">{t("results.missingKeywordsTitle")}</h3>
                <div className="tag-list">
                  {missing.length === 0 && <span className="tag">—</span>}
                  {missing.map((item, idx) => (
                    <span className="tag" key={`miss-${idx}`}>{item}</span>
                  ))}
                </div>
              </div>
              <div className="section">
                <h3 className="section-title">{t("results.recommendationsTitle")}</h3>
                <div className="steps">
                  {recommendations.length === 0 && (
                    <div className="step"><span>1</span><p>—</p></div>
                  )}
                  {recommendations.map((item, index) => {
                    let translatedItem = item;
                    if (item.includes("Tighten bullet points")) translatedItem = t("dashboard.rec1");
                    else if (item.includes("Align the Summary")) translatedItem = t("dashboard.rec2");
                    else if (item.includes("Ensure Skills section mirrors")) translatedItem = t("dashboard.rec3");
                    else if (item.includes("Highlight your strongest")) translatedItem = t("dashboard.rec4");
                    else if (item.startsWith("Add a bullet that demonstrates hands-on experience with ")) {
                      const skill = item.replace("Add a bullet that demonstrates hands-on experience with ", "").replace(".", "");
                      translatedItem = t("dashboard.recSkill").replace("{skill}", skill);
                    }
                    return (
                      <div className="step" key={`rec-${index}`}>
                        <span>{index + 1}</span>
                        <p>{translatedItem}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="section">
                <h3 className="section-title">{t("results.appliedChanges")}</h3>
                <div className="steps">
                  <div className="step">
                    <span>1</span>
                    <p>
                      {t("results.addedKeywords")}{" "}
                      {addedKeywords.length > 0 ? addedKeywords.join(" · ") : "—"}
                    </p>
                  </div>
                  <div className="step">
                    <span>2</span>
                    <p>
                      {t("results.stillMissing")}{" "}
                      {remainingKeywords.length > 0 ? remainingKeywords.join(" · ") : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="history-actions">
          <Link className="btn secondary" href="/history">
            {t("results.saveToHistory")}
          </Link>
        </div>
      </div>
      <PremiumModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </main>
  );
}
