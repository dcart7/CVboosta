"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import TopNav from "../components/TopNav";
import { getApiBase } from "../lib/apiBase";
import { fetchWithRetry } from "../lib/fetchRetry";
import { useTranslation } from "../lib/LanguageContext";
import {
  ANALYTICS_EVENTS,
  getOrCreateShareReferralCode,
  trackEvent,
} from "../lib/analytics";
import PaywallModal from "../components/PaywallModal";
import {
  clearLegacyPersistentFunnelData,
  loadResultContext,
  saveResultContext,
} from "../lib/funnelIntent";

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

let jsPdfImportPromise: Promise<typeof import("jspdf")> | null = null;
const loadJsPdf = async () => {
  if (!jsPdfImportPromise) jsPdfImportPromise = import("jspdf");
  return jsPdfImportPromise;
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
const ADVOCACY_PROMPT_KEY = "cvboosta.advocacy-prompt.v1";
const ADVOCACY_PROMPT_TTL_MS = 90 * 24 * 60 * 60 * 1000;

type PreviewBlock =
  | { type: "title"; text: string }
  | { type: "heading"; text: string }
  | { type: "bullet"; text: string }
  | { type: "text"; text: string }
  | { type: "spacer" };

const DEMO_FALLBACK = {
  matchBefore: 64,
  matchAfter: 69,
  jobText:
    "Job Title: BI Engineer / Analytics Engineer\n\nWe are looking for a BI Engineer / Analytics Engineer.\n\nResponsibilities:\n- Build data models and dashboards\n- Own KPI definitions and reporting\n- Improve observability and alerting\n\nRequirements:\n- Python\n- SQL\n- Snowflake\n- ETL pipelines",
  optimizedCv:
    [
      "Alex Johnson",
      "",
      "SUMMARY",
      "Backend engineer focused on Python services, APIs, and analytics foundations. Strong emphasis on reliability, performance, and maintainable systems.",
      "",
      "EXPERIENCE",
      "Independent / Consulting Projects",
      "Burnout Risk Tracker | Feb 2026 - Present | Remote",
      "• Engineered a production-ready backend system using Python, Django, and Django REST Framework, focusing on reusable code and scalability.",
      "• Developed analytics services to calculate dimension scores and a Burnout Index using moving average techniques.",
      "• Optimized data processing performance through Redis caching and PostgreSQL query optimization.",
      "",
      "SKILLS",
      "Python · Django · Django REST Framework · PostgreSQL · Redis · Celery · Docker · JWT · REST APIs",
    ].join("\n"),
  missing: ["Monitoring", "Snowflake", "observability", "alerting", "ETL pipelines"],
  addedKeywords: ["curated analytics datasets", "maintainable SQL transformations"],
  recommendations: [
    "Add a bullet that demonstrates hands-on experience with Monitoring.",
    "Add a bullet that demonstrates hands-on experience with Snowflake.",
    "Tighten bullet points to include metrics and scope.",
  ],
} as const;

function sanitizeCvText(input: string): string {
  if (!input) return "";
  return (
    input
      .replace(/\r\n/g, "\n")
      .replace(/[\x00-\x08\x0B-\x1F\x7F]/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/`+/g, "")
      .replace(/^CVboosta\s*•\s*Page.*$/gim, "")
      .replace(/^CVboosta\s*•\s*P.*$/gim, "")
      .replace(/^\s*[•·]\s*$/gim, "")
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
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://cvboosta.com").replace(/\/$/, "");
  const [optimizedCv, setOptimizedCv] = useState("");
  const [jobTextForUi, setJobTextForUi] = useState("");
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
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [isLoadingCL, setIsLoadingCL] = useState(false);
  const [clError, setClError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"document" | "metrics">("document");
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [shareReferralCode, setShareReferralCode] = useState("shared_result");
  const [showAdvocacyPrompt, setShowAdvocacyPrompt] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string>("unknown");
  const [resultCanExport, setResultCanExport] = useState<boolean | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const advocacyPromptShownRef = useRef(false);

  const sessionId = searchParams.get("id");
  const isDemo = searchParams.get("demo") === "1";
  const shareBefore = typeof matchBefore === "number" ? Math.max(0, Math.min(100, Math.round(matchBefore))) : null;
  const shareAfter = typeof matchAfter === "number" ? Math.max(0, Math.min(100, Math.round(matchAfter))) : null;
  const shareQuery = new URLSearchParams({
    utm_source: "shared_result",
    utm_medium: "referral",
    utm_campaign: "results_share",
    ref: shareReferralCode,
  });
  if (shareBefore !== null) shareQuery.set("before", String(shareBefore));
  if (shareAfter !== null) shareQuery.set("after", String(shareAfter));
  const shareUrl = `${siteUrl}/share/result?${shareQuery.toString()}`;
  const shareTitle =
    shareAfter !== null
      ? `My CV-to-job match score is ${shareAfter}/100`
      : "I compared my CV with a real vacancy";
  const shareText =
    shareAfter !== null && shareBefore !== null
      ? `I reviewed my CV-to-job match from ${shareBefore}% to ${shareAfter}% with CVboosta.`
      : "I compared my CV with a real job description using CVboosta.";
  const composedShareMessage = `${shareText} ${shareUrl}`;

  const advocacyCopy = {
    en: { title: "Was this useful?", body: "You can share a privacy-safe score summary or leave an honest review—positive, negative, or mixed. Your CV and job description are never included.", share: "Share summary", review: "Leave an honest review", later: "Not now" },
    uk: { title: "Це було корисно?", body: "Можете поділитися безпечним summary score або залишити чесний відгук — позитивний, негативний чи змішаний. CV та опис вакансії не додаються.", share: "Поділитися summary", review: "Залишити чесний відгук", later: "Не зараз" },
    pl: { title: "Czy to było przydatne?", body: "Możesz udostępnić bezpieczne podsumowanie wyniku albo dodać szczerą opinię — pozytywną, negatywną lub mieszaną. CV i oferta nie są dołączane.", share: "Udostępnij wynik", review: "Dodaj szczerą opinię", later: "Nie teraz" },
    sk: { title: "Bolo to užitočné?", body: "Môžete zdieľať bezpečné zhrnutie skóre alebo zanechať úprimnú recenziu — pozitívnu, negatívnu či zmiešanú. CV ani popis práce sa nezdieľajú.", share: "Zdieľať zhrnutie", review: "Napísať úprimnú recenziu", later: "Teraz nie" },
    cs: { title: "Bylo to užitečné?", body: "Můžete sdílet bezpečné shrnutí skóre nebo zanechat upřímnou recenzi — pozitivní, negativní či smíšenou. CV ani popis práce se nesdílí.", share: "Sdílet shrnutí", review: "Napsat upřímnou recenzi", later: "Teď ne" },
    es: { title: "¿Te resultó útil?", body: "Puedes compartir un resumen seguro del score o dejar una reseña sincera, positiva, negativa o mixta. El CV y la oferta nunca se incluyen.", share: "Compartir resumen", review: "Dejar una reseña sincera", later: "Ahora no" },
  }[language];
  const shareControlsCopy = {
    en: { native: "Share…", copy: "Copy private-safe link", privacy: "Only the before/after match scores are shared. Your CV and job description stay private." },
    uk: { native: "Поділитися…", copy: "Копіювати безпечне посилання", privacy: "Публікуються лише match score до/після. CV та опис вакансії залишаються приватними." },
    pl: { native: "Udostępnij…", copy: "Kopiuj bezpieczny link", privacy: "Udostępniane są tylko wyniki przed/po. CV i oferta pozostają prywatne." },
    sk: { native: "Zdieľať…", copy: "Kopírovať bezpečný odkaz", privacy: "Zdieľa sa iba skóre pred/po. CV a popis práce zostávajú súkromné." },
    cs: { native: "Sdílet…", copy: "Kopírovat bezpečný odkaz", privacy: "Sdílí se pouze skóre před/po. CV a popis práce zůstávají soukromé." },
    es: { native: "Compartir…", copy: "Copiar enlace seguro", privacy: "Solo se comparten los scores antes/después. El CV y la oferta siguen siendo privados." },
  }[language];

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
      if (res.status === 402) {
        setResultCanExport(false);
        setSubscriptionTier("free");
        setSessionLoadError(null);
        setShowUnlockModal(true);
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
      setJobTextForUi(sanitizeCvText(data.job_description || ""));
      setResultCanExport(
        typeof data.can_export === "boolean" ? data.can_export : null,
      );
    } catch {
      setSessionLoadError(t("results.sessionLoadFailed"));
    } finally {
      setIsLoadingSession(false);
    }
  }, [apiBase, sessionId, t]);

  useEffect(() => {
    trackEvent("ats_view_results", { page_type: "results" });
    if (sessionId) void loadHistorySession();
  }, [sessionId, loadHistorySession]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      clearLegacyPersistentFunnelData();
      const storedTemplate = window.localStorage.getItem("pdf_template");
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
      if (sessionId) return;

      if (isDemo) {
        // Demo results are generated server-side via /demo/optimize (real pipeline).
        setIsLoadingDemo(true);
        try {
          const res = await fetchWithRetry(
            `${apiBase}/demo/optimize`,
            undefined,
            { attempts: 3, baseDelayMs: 300, timeoutMs: 25_000 },
          );
          if (!res.ok) throw new Error("demo_failed");
          const data = await res.json();
          setOptimizedCv(data.optimized_cv || "");
          setMissing(data.missing_skills || []);
          setAddedKeywords(data.added_keywords || []);
          setRecommendations(data.recommendations || []);
          setMatchBefore(typeof data.match_before === "number" ? data.match_before : null);
          setMatchAfter(typeof data.match_after === "number" ? data.match_after : null);
          setJobTextForUi(sanitizeCvText(data.job_description || ""));
          setResultCanExport(true);
        } catch {
          // Fallback so demo never renders as blank if backend is down.
          setOptimizedCv(DEMO_FALLBACK.optimizedCv);
          setMissing(DEMO_FALLBACK.missing as unknown as string[]);
          setAddedKeywords(DEMO_FALLBACK.addedKeywords as unknown as string[]);
          setRecommendations(DEMO_FALLBACK.recommendations as unknown as string[]);
          setMatchBefore(DEMO_FALLBACK.matchBefore);
          setMatchAfter(DEMO_FALLBACK.matchAfter);
          setJobTextForUi(sanitizeCvText(DEMO_FALLBACK.jobText));
          setResultCanExport(true);
        } finally {
          setIsLoadingDemo(false);
        }
        return;
      }

      const context = loadResultContext();
      if (!context) {
        setStatus(t("results.missingInputs"));
        return;
      }
      if (cancelled) return;
      setOptimizedCv(context.optimizedCv);
      setJobTextForUi(sanitizeCvText(context.jobText));
      setMissing(context.missingSkills);
      setAddedKeywords(context.addedKeywords);
      setRecommendations(context.recommendations);
      setMatchBefore(context.matchBefore);
      setMatchAfter(context.matchAfter);
      setResultCanExport(context.canExport);
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase, isDemo, sessionId, t]);

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
          if (!cancelled) setSubscriptionTier("unknown");
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setSubscriptionTier(typeof data?.tier === "string" ? data.tier : "unknown");
        }
      } catch {
        if (!cancelled) setSubscriptionTier("unknown");
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
  const normalizedTier = subscriptionTier.toLowerCase();
  const hasPaidTier = ["single", "go", "pro", "lifetime"].includes(normalizedTier);
  const hasPaidEntitlement =
    resultCanExport === true ||
    hasPaidTier;
  // A per-result denial is authoritative. In particular, the API can return
  // it when generation failed after billing access was verified; the user's
  // original CV must never be downloadable as an "optimized" result.
  const canExportCurrentResult = hasPaidEntitlement && resultCanExport !== false;
  const entitlementResolved =
    isDemo || resultCanExport !== null || normalizedTier !== "unknown";
  // Fail closed while billing is loading or unavailable. Demo content is
  // synthetic and can remain fully visible.
  const isFreeTier = !hasPaidEntitlement && !isDemo;
  const isPreviewOnly = !hasPaidEntitlement && !isDemo;
  const isWithinFirstMonthFromLaunch = useMemo(() => {
    const launchDate = new Date(SITE_LAUNCH_DATE_RAW);
    if (Number.isNaN(launchDate.getTime())) return false;
    const gracePeriodEnd = new Date(launchDate.getTime() + WATERMARK_GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
    return Date.now() < gracePeriodEnd.getTime();
  }, []);
  const showBrandingFooter = isFreeTier && isWithinFirstMonthFromLaunch;
  const showFullPageWatermark = isFreeTier && !isWithinFirstMonthFromLaunch;

  useEffect(() => {
    if (resultCanExport === false && hasPaidTier) {
      setStatus(t("app.optimizationFailedTryAgain"));
    }
  }, [hasPaidTier, resultCanExport, t]);

  useEffect(() => {
    if (!entitlementResolved) return;
    if (!isPreviewOnly) return;
    if (!optimizedCv) return;
    if (sessionLoadError) return;
    if (isDemo) return;
    try {
      const skipOnce = localStorage.getItem("results_skip_paywall_once") === "1";
      if (skipOnce) {
        localStorage.removeItem("results_skip_paywall_once");
        return;
      }
    } catch {
      // ignore
    }
    try {
      const key = `results_paywall_seen:${sessionId || "latest"}`;
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
      setShowUnlockModal(true);
    } catch {
      setShowUnlockModal(true);
    }
  }, [entitlementResolved, isDemo, isPreviewOnly, optimizedCv, sessionLoadError, sessionId]);

  useEffect(() => {
    if (hasPaidEntitlement) setShowUnlockModal(false);
  }, [hasPaidEntitlement]);

  // Keep modal centered with fixed overlay; allow background to scroll behind it.

  const extractedJobTitle = useMemo(() => {
    const jobText = jobTextForUi.trim();
    if (!jobText) return null;
    const lines = jobText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) return null;
    const jobTitleLine = lines.find((line) => /^job title\s*[:\-]/i.test(line));
    if (jobTitleLine) {
      const value = jobTitleLine.replace(/^job title\s*[:\-]\s*/i, "").trim();
      return value ? value.slice(0, 80) : null;
    }
    const firstLine = lines[0];
    return firstLine ? firstLine.slice(0, 80) : null;
  }, [jobTextForUi]);

  const criticalIssuesCount = useMemo(() => {
    return (
      (Array.isArray(missing) ? missing.length : 0) +
      (Array.isArray(recommendations) ? recommendations.length : 0)
    );
  }, [missing, recommendations]);

  const previewBullets = useMemo(() => {
    const bullets = previewBlocks
      .filter((block) => block.type === "bullet")
      .slice(0, 3)
      .map((block) => ("text" in block ? block.text : ""))
      .filter(Boolean);
    return bullets;
  }, [previewBlocks]);

  const experiencePreviewLines = useMemo(() => {
    const experienceSection =
      parsedCv.sections.find((s) => /experience|employment|work history/i.test(s.heading)) ||
      parsedCv.sections.find((s) => s.lines.some((line) => /experience|employment/i.test(line)));
    if (!experienceSection) return [];
    return experienceSection.lines.filter((line) => line.trim()).slice(0, 10);
  }, [parsedCv.sections]);

  const copyCv = async () => {
    if (!optimizedCv) {
      setStatus(t("results.noOptimizedCv"));
      return;
    }
    if (!isPreviewOnly && !canExportCurrentResult) {
      setStatus(t("app.optimizationFailedTryAgain"));
      return;
    }
    try {
      if (isPreviewOnly) {
        const previewText = [
          t("results.previewCopyTitle"),
          "",
          ...previewBullets.map((line) => `• ${line}`),
        ]
          .filter(Boolean)
          .join("\n");
        await navigator.clipboard.writeText(previewText);
      } else {
        await navigator.clipboard.writeText(optimizedCv);
      }
      setStatus(t("results.copiedToClipboard"));
    } catch (err) {
      console.error("Copy failed:", err);
      setStatus(t("results.copyFailed"));
    }
  };

  const startUnlockFlow = () => {
    trackEvent("cta_click", {
      cta_type: "unlock_job_matched",
      location: "results_paywall",
    });
    setShowUnlockModal(true);
  };

  const shareResult = () => {
    if (shareBefore === null || shareAfter === null) {
      setStatus(t("results.matchLoadFailed"));
      return;
    }
    setShareReferralCode(getOrCreateShareReferralCode());
    trackEvent(ANALYTICS_EVENTS.resultShareOpened, { location: "results" });
    setIsShareSheetOpen(true);
  };

  const recordShare = (channel: string) => {
    trackEvent(ANALYTICS_EVENTS.resultShared, {
      channel,
      score_included: shareBefore !== null && shareAfter !== null,
    });
  };

  const openShareWindow = (url: string, channel: string) => {
    recordShare(channel);
    setIsShareSheetOpen(false);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shareNatively = async () => {
    if (typeof navigator.share !== "function") {
      try {
        await navigator.clipboard.writeText(composedShareMessage);
        recordShare("copy");
        setStatus(t("results.copiedToClipboard"));
        setIsShareSheetOpen(false);
      } catch {
        setStatus(t("results.copyFailed"));
      }
      return;
    }
    try {
      await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
      recordShare("native");
      setIsShareSheetOpen(false);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus(t("results.copyFailed"));
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      recordShare("copy_link");
      setStatus(t("results.copiedToClipboard"));
      setIsShareSheetOpen(false);
    } catch {
      setStatus(t("results.copyFailed"));
    }
  };

  const shareOnWhatsApp = () => {
    openShareWindow(
      `https://wa.me/?text=${encodeURIComponent(composedShareMessage)}`,
      "whatsapp",
    );
  };

  const shareOnLinkedIn = () => {
    openShareWindow(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "linkedin",
    );
  };

  const shareOnX = () => {
    openShareWindow(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      "x",
    );
  };

  const maybeShowAdvocacyPrompt = () => {
    if (isDemo || showAdvocacyPrompt || advocacyPromptShownRef.current) return;
    try {
      const raw = window.localStorage.getItem(ADVOCACY_PROMPT_KEY);
      const parsed = raw ? JSON.parse(raw) as { shownAt?: number } : null;
      if (
        typeof parsed?.shownAt === "number" &&
        Date.now() - parsed.shownAt < ADVOCACY_PROMPT_TTL_MS
      ) {
        advocacyPromptShownRef.current = true;
        return;
      }
      window.localStorage.setItem(
        ADVOCACY_PROMPT_KEY,
        JSON.stringify({ shownAt: Date.now() }),
      );
    } catch {
      // The in-memory guard still prevents repeats within this page view.
    }
    advocacyPromptShownRef.current = true;
    setShowAdvocacyPrompt(true);
    trackEvent(ANALYTICS_EVENTS.advocacyPromptViewed, {
      trigger: "successful_export",
    });
  };

  const fetchInterviewPrep = async () => {
    if (isPreviewOnly) {
      trackEvent("cta_click", { cta_type: "interview_prep_locked", location: "results" });
      setShowUnlockModal(true);
      return;
    }
    const jobText = jobTextForUi;
    if (!jobText) {
      console.warn("No job description is available for interview prep");
      return;
    }

    setIsLoadingPrep(true);
    setPrepError(null);
    try {
      const response = await fetchWithRetry(
        `${apiBase}/analyze/interview-prep`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job_text: jobText,
            missing_keywords: missing,
            ui_language: language,
            analysis_id: sessionId ? parseInt(sessionId, 10) : null,
          }),
        },
        { attempts: 3, baseDelayMs: 300, timeoutMs: 20_000 },
      );

      if (response.status === 402) {
        setShowUnlockModal(true);
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
    if (isPreviewOnly) {
      trackEvent("cta_click", { cta_type: "cover_letter_locked", location: "results" });
      setShowUnlockModal(true);
      return;
    }
    const jobText = jobTextForUi;
    const cvText = optimizedCv;
    
    if (!jobText || !cvText) {
      console.warn("Required text not found for cover letter");
      return;
    }

    setIsLoadingCL(true);
    setClError(null);
    try {
      const response = await fetchWithRetry(
        `${apiBase}/optimize/cover-letter`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cv_text: cvText,
            job_text: jobText,
            ui_language: language,
            analysis_id: sessionId ? parseInt(sessionId, 10) : null,
          }),
        },
        { attempts: 3, baseDelayMs: 300, timeoutMs: 20_000 },
      );

      if (response.status === 402) {
        setShowUnlockModal(true);
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

  const downloadCoverLetterPdf = async () => {
    if (!coverLetter) return;
    try {
      const { jsPDF } = await loadJsPdf();
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
      trackEvent(ANALYTICS_EVENTS.assetDownloaded, { asset_type: "cover_letter_pdf" });
      maybeShowAdvocacyPrompt();
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

  const downloadPdf = async () => {
    if (!cleanedCv) {
      setStatus(t("results.noOptimizedCv"));
      return;
    }
    try {
      const template = activeTemplate;
      const accent = template.accent;
      const { jsPDF } = await loadJsPdf();
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
      trackEvent(ANALYTICS_EVENTS.assetDownloaded, { asset_type: "resume_pdf" });
      maybeShowAdvocacyPrompt();
      setStatus(t("results.pdfDownloaded"));
    } catch (err) {
      console.error(err);
      setStatus(t("results.pdfFailed"));
    }
  };

  const downloadPreviewPdf = async () => {
    if (!optimizedCv) {
      setStatus(t("results.noOptimizedCv"));
      return;
    }
    try {
      const { jsPDF } = await loadJsPdf();
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const margin = 50;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin * 2;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(t("results.previewPdfTitle"), margin, 60);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const jobLine = extractedJobTitle
        ? t("results.previewPdfJobLine").replace("{jobTitle}", extractedJobTitle)
        : t("results.previewPdfJobLineFallback");
      doc.text(jobLine, margin, 80, { maxWidth: contentWidth } as any);

      const yStart = 110;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(t("results.previewPdfImprovementsTitle"), margin, yStart);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const bullets = previewBullets.length ? previewBullets : [compactSummary].filter(Boolean);
      let y = yStart + 18;
      bullets.slice(0, 3).forEach((line) => {
        const wrapped = doc.splitTextToSize(`• ${line}`, contentWidth);
        doc.text(wrapped, margin, y);
        y += wrapped.length * 14 + 4;
        if (y > pageHeight - 110) {
          doc.addPage();
          y = 60;
        }
      });

      if (experiencePreviewLines.length) {
        y += 10;
        doc.setFont("helvetica", "bold");
        doc.text(t("results.previewPdfExperienceTitle"), margin, y);
        y += 18;
        doc.setFont("helvetica", "normal");
        const experienceText = experiencePreviewLines.slice(0, 10).join("\n");
        const wrapped = doc.splitTextToSize(experienceText, contentWidth);
        doc.text(wrapped, margin, y);
      }

      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Preview — Powered by CVboosta", margin, pageHeight - 20);
      const rightText = "cvboosta.com";
      const rightX = pageWidth - margin - doc.getTextWidth(rightText);
      doc.text(rightText, rightX, pageHeight - 20);

      doc.save("Resume_Preview_CVboosta.pdf");
      trackEvent(ANALYTICS_EVENTS.assetDownloaded, { asset_type: "resume_pdf_preview" });
      setStatus(t("results.pdfDownloaded"));
    } catch (err) {
      console.error(err);
      setStatus(t("results.pdfFailed"));
    }
  };

  const requestDownloadPdf = () => {
    if (isPreviewOnly) {
      setShowUnlockModal(true);
      return;
    }
    if (!canExportCurrentResult) {
      setStatus(t("app.optimizationFailedTryAgain"));
      return;
    }
    void downloadPdf();
  };

  const downloadDocx = async () => {
    if (!cleanedCv) {
      setStatus(t("results.noOptimizedCv"));
      return;
    }
    try {
      const docx = await import("docx");
      const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;

      const lines = cleanedCv.split(/\r?\n/);
      const children: any[] = [];

      const bulletRegex = /^(?:[•\-\*]+)\s+(.*)$/;
      for (const raw of lines) {
        const line = raw.trimEnd();
        if (!line.trim()) {
          children.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
          continue;
        }

        const trimmed = line.trim();
        const bulletMatch = trimmed.match(bulletRegex);
        if (bulletMatch?.[1]) {
          children.push(
            new Paragraph({
              text: bulletMatch[1].trim(),
              bullet: { level: 0 },
            }),
          );
          continue;
        }

        if (isSectionHeading(trimmed)) {
          children.push(
            new Paragraph({
              text: trimmed.replace(/:$/, ""),
              heading: HeadingLevel.HEADING_2,
            }),
          );
          continue;
        }

        children.push(
          new Paragraph({
            children: [new TextRun({ text: trimmed })],
          }),
        );
      }

      const doc = new Document({
        sections: [{ properties: {}, children }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Optimized_CV.docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      trackEvent(ANALYTICS_EVENTS.assetDownloaded, { asset_type: "resume_docx" });
      maybeShowAdvocacyPrompt();
    } catch (err) {
      console.error(err);
      setStatus(t("results.pdfFailed"));
    }
  };

  const requestDownloadDocx = () => {
    if (isPreviewOnly) {
      setShowUnlockModal(true);
      return;
    }
    if (!canExportCurrentResult) {
      setStatus(t("app.optimizationFailedTryAgain"));
      return;
    }
    void downloadDocx();
  };

  const openDemoResults = async () => {
    setShowUnlockModal(false);
    setIsLoadingDemo(true);
    try {
      const res = await fetchWithRetry(
        `${apiBase}/demo/optimize`,
        undefined,
        { attempts: 3, baseDelayMs: 300, timeoutMs: 25_000 },
      );
      if (!res.ok) throw new Error("demo_failed");
      const data = await res.json();
      try {
        saveResultContext({
          optimizedCv: data.optimized_cv || "",
          jobText: data.job_description || "",
          missingSkills: data.missing_skills || [],
          addedKeywords: data.added_keywords || [],
          recommendations: data.recommendations || [],
          matchBefore: typeof data.match_before === "number" ? data.match_before : null,
          matchAfter: typeof data.match_after === "number" ? data.match_after : null,
          canExport: true,
        });
        localStorage.setItem("results_skip_paywall_once", "1");
      } catch {
        // ignore
      }
      window.location.href = "/results";
    } catch {
      // If backend is down, still show something usable.
      try {
        saveResultContext({
          optimizedCv: DEMO_FALLBACK.optimizedCv,
          jobText: DEMO_FALLBACK.jobText,
          missingSkills: [...DEMO_FALLBACK.missing],
          addedKeywords: [...DEMO_FALLBACK.addedKeywords],
          recommendations: [...DEMO_FALLBACK.recommendations],
          matchBefore: DEMO_FALLBACK.matchBefore,
          matchAfter: DEMO_FALLBACK.matchAfter,
          canExport: true,
        });
        localStorage.setItem("results_skip_paywall_once", "1");
      } catch {
        // ignore
      }
      window.location.href = "/results";
    } finally {
      setIsLoadingDemo(false);
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
      {isLoadingDemo && (
        <div className="modal-backdrop" style={{ zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(9, 12, 18, 0.8)' }}>
          <div className="spinner" style={{ marginBottom: '16px' }}></div>
          <p style={{ color: 'white', fontWeight: 500 }}>{t("common.loading")}</p>
        </div>
      )}
      {optimizedCv && !isPreviewOnly && (
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
            <h2 className="section-title">
              {isPreviewOnly ? t("results.previewTitle") : t("results.optimizedCv")}
            </h2>
              <div className="grid">
                <div className="kpi">
                  <h3>{matchBefore !== null ? `${matchBefore}%` : "—"}</h3>
                  <p>{isPreviewOnly ? t("results.scoreToday") : t("results.fitBefore")}</p>
                </div>
                <div className="kpi">
                  <h3>
                    {matchAfter !== null
                      ? isPreviewOnly
                        ? t("results.potentialScoreLocked").replace("{score}", `${matchAfter}%`)
                        : `${matchAfter}%`
                      : "—"}
                  </h3>
                  <p>{isPreviewOnly ? t("results.potentialAfter") : t("results.fitAfter")}</p>
                </div>
              </div>
              {isPreviewOnly ? (
                <>
                  <div className="result-box">
                    <div className="result-box-head">
                      <h3>{t("results.verdictTitle")}</h3>
                      {criticalIssuesCount > 0 ? (
                        <span className="tag">{t("results.issuesFound").replace("{count}", String(criticalIssuesCount))}</span>
                      ) : null}
                    </div>
                    <p className="summary-snippet">{t("results.verdictCopy")}</p>
                  </div>

                  <div className="section">
                    <h3 className="section-title">{t("results.previewImprovementsTitle")}</h3>
                    <p style={{ marginTop: "-8px", color: "var(--muted)" }}>{t("results.previewImprovementsSubtitle")}</p>
                    <div className="steps">
                      {(previewBullets.length ? previewBullets : [compactSummary].filter(Boolean))
                        .slice(0, 3)
                        .map((line, idx) => (
                          <div className="step" key={`pv-b-${idx}`}>
                            <span>{idx + 1}</span>
                            <p>{line}</p>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="section">
                    <h3 className="section-title">{t("results.experiencePreviewTitle")}</h3>
                    <div className="locked-preview">
                      <div className="locked-preview-content">
                        {experiencePreviewLines.length ? (
                          experiencePreviewLines.map((line, idx) => (
                            <div key={`exp-${idx}`} className="locked-preview-line">
                              {line}
                            </div>
                          ))
                        ) : (
                          <div className="locked-preview-line">—</div>
                        )}
                      </div>
                      <div className="locked-preview-fade" aria-hidden="true" />
                      <div className="locked-preview-lock">
                        <span className="tag">{t("results.lockedLabel")}</span>
                        <p style={{ margin: 0, color: "var(--muted)" }}>{t("results.lockedExperienceRemainder")}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
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
              )}
              <div className="section">
                {!isPreviewOnly && (
                  <>
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
                  </>
                )}
              </div>
              <div className="nav-actions main-actions">
                <button
                  className="btn primary"
                  onClick={copyCv}
                  disabled={!isPreviewOnly && !canExportCurrentResult}
                >
                  {isPreviewOnly ? t("results.copyPreview") : t("results.copyFullCv")}
                </button>
                <button
                  className="btn secondary"
                  onClick={isPreviewOnly ? startUnlockFlow : requestDownloadPdf}
                  disabled={!isPreviewOnly && !canExportCurrentResult}
                >
                  {isPreviewOnly ? t("results.unlockToDownload") : t("results.downloadPdf")}
                </button>
                <button
                  className="btn ghost desktop-only"
                  onClick={requestDownloadDocx}
                  disabled={!isPreviewOnly && !canExportCurrentResult}
                >
                  {t("results.downloadDocx")}
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
                  <p className="muted" style={{ fontSize: "13px", margin: "0 0 14px" }}>
                    {shareControlsCopy.privacy}
                  </p>
                  <div className="share-modal-actions">
                    <button className="btn primary" type="button" onClick={() => void shareNatively()}>
                      {shareControlsCopy.native}
                    </button>
                    <button className="btn ghost" type="button" onClick={() => void copyShareLink()}>
                      {shareControlsCopy.copy}
                    </button>
                    <button className="btn ghost" type="button" onClick={shareOnLinkedIn}>
                      LinkedIn
                    </button>
                    <button className="btn ghost" type="button" onClick={shareOnX}>
                      X
                    </button>
                    <button className="btn ghost" type="button" onClick={shareOnWhatsApp}>
                      WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showAdvocacyPrompt && (
              <div className="modal-backdrop" onClick={() => setShowAdvocacyPrompt(false)}>
                <div
                  className="modal-card fade-up share-modal-card"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="advocacy-title"
                  onClick={(event) => event.stopPropagation()}
                >
                  <h3 id="advocacy-title" className="share-modal-title">{advocacyCopy.title}</h3>
                  <p className="muted" style={{ lineHeight: 1.6 }}>{advocacyCopy.body}</p>
                  <div className="share-modal-actions">
                    <button
                      className="btn primary"
                      type="button"
                      onClick={() => {
                        setShowAdvocacyPrompt(false);
                        setShareReferralCode(getOrCreateShareReferralCode());
                        trackEvent(ANALYTICS_EVENTS.resultShareOpened, { location: "post_export_prompt" });
                        setIsShareSheetOpen(true);
                      }}
                    >
                      {advocacyCopy.share}
                    </button>
                    <a
                      className="btn ghost"
                      href="https://www.trustpilot.com/evaluate/cvboosta.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        trackEvent(ANALYTICS_EVENTS.honestReviewOpened, { location: "post_export_prompt" });
                        setShowAdvocacyPrompt(false);
                      }}
                    >
                      {advocacyCopy.review}
                    </a>
                    <button className="btn ghost" type="button" onClick={() => setShowAdvocacyPrompt(false)}>
                      {advocacyCopy.later}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showUnlockModal && (
              <PaywallModal
                open={showUnlockModal}
                onClose={() => setShowUnlockModal(false)}
                title={t("results.paywallHeadline")}
                subtitle={`${t("results.paywallSubtext")}\n${t("results.paywallJobMatchedLine")}`}
                actions={
                  <>
                    <Link
                      className="btn primary"
                      href="/pricing?from=results&intent=unlock"
                      onClick={() => {
                        trackEvent("payment_started", { product_type: "optimization", location: "results_paywall_modal" });
                        setShowUnlockModal(false);
                      }}
                    >
                      {t("results.paywallCta")}
                    </Link>
                    <p className="paywall-microcopy">{t("results.paywallMicrocopy")}</p>
                    <button className="btn secondary" type="button" onClick={() => setShowUnlockModal(false)}>
                      {t("results.paywallMaybeLater")}
                    </button>
                    <button className="btn ghost mobile-only" type="button" onClick={() => setShowUnlockModal(false)}>
                      {t("results.paywallMaybeLater")}
                    </button>
                    <button
                      className="btn ghost desktop-only"
                      type="button"
                      onClick={() => {
                        void downloadPreviewPdf();
                        setShowUnlockModal(false);
                      }}
                    >
                      {t("results.downloadPreviewPdf")}
                    </button>
                    <button
                      className="btn ghost desktop-only"
                      type="button"
                      onClick={() => {
                        trackEvent("cta_click", { cta_type: "view_demo_results", location: "results_paywall_modal" });
                        void openDemoResults();
                      }}
                    >
                      {t("results.viewDemoResults")}
                    </button>
                  </>
                }
              >
                <div className="mobile-only">
                  <ul className="paywall-mobile-points">
                    <li>✔ {t("results.paywallMobilePoint1")}</li>
                    <li>✔ {t("results.paywallMobilePoint2")}</li>
                    <li>✔ {t("results.paywallMobilePoint3")}</li>
                  </ul>
                  <div className="paywall-mobile-locked">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                      <p style={{ margin: 0, fontWeight: 900 }}>{t("results.lockedPreviewTitle")}</p>
                      <span className="tag">{t("results.lockedLabel")}</span>
                    </div>
                    <div className="paywall-locked-row is-long" style={{ marginTop: "10px" }} />
                  </div>
                </div>

                <div className="desktop-only">
                <div className="paywall-section" style={{ textAlign: "center" }}>
                  {extractedJobTitle && (
                    <span className="tag">
                      {t("results.optimizedFor").replace("{jobTitle}", extractedJobTitle)}
                    </span>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginTop: extractedJobTitle ? "10px" : 0 }}>
                    {criticalIssuesCount > 0 ? (
                      <span className="tag">{t("results.issuesFound").replace("{count}", String(criticalIssuesCount))}</span>
                    ) : null}
                    <span className="tag">
                      {t("results.keywordMatchLine")
                        .replace("{before}", matchBefore !== null ? `${matchBefore}%` : "—")
                        .replace("{after}", t("results.lockedValue"))}
                    </span>
                  </div>
                </div>

                <div className="paywall-benefits" aria-label="Paywall benefits">
                  <div className="paywall-benefit-card">
                    <div className="paywall-benefit-top">
                      <div className="paywall-benefit-icon" aria-hidden="true">✍️</div>
                      <p className="paywall-benefit-title">{t("results.paywallCard1Title")}</p>
                    </div>
                    <p className="paywall-benefit-desc">{t("results.paywallCard1Desc")}</p>
                  </div>
                  <div className="paywall-benefit-card">
                    <div className="paywall-benefit-top">
                      <div className="paywall-benefit-icon" aria-hidden="true">🎯</div>
                      <p className="paywall-benefit-title">{t("results.paywallCard2Title")}</p>
                    </div>
                    <p className="paywall-benefit-desc">{t("results.paywallCard2Desc")}</p>
                  </div>
                  <div className="paywall-benefit-card">
                    <div className="paywall-benefit-top">
                      <div className="paywall-benefit-icon" aria-hidden="true">🧱</div>
                      <p className="paywall-benefit-title">{t("results.paywallCard3Title")}</p>
                    </div>
                    <p className="paywall-benefit-desc">{t("results.paywallCard3Desc")}</p>
                  </div>
                  <div className="paywall-benefit-card">
                    <div className="paywall-benefit-top">
                      <div className="paywall-benefit-icon" aria-hidden="true">⬇️</div>
                      <p className="paywall-benefit-title">{t("results.paywallCard4Title")}</p>
                    </div>
                    <p className="paywall-benefit-desc">{t("results.paywallCard4Desc")}</p>
                  </div>
                </div>

                <div className="paywall-locked" aria-label="Locked content preview">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <p style={{ margin: 0, fontWeight: 900 }}>{t("results.lockedPreviewTitle")}</p>
                    <span className="tag">{t("results.lockedLabel")}</span>
                  </div>
                  <div className="paywall-locked-row is-long" />
                  <div className="paywall-locked-row is-mid" />
                  <div className="paywall-locked-row is-long" />
                  <div className="paywall-locked-row is-short" />
                </div>

                {!jobTextForUi.trim() && (
                  <div className="paywall-note" style={{ marginTop: "14px" }}>
                    <p style={{ margin: 0 }}>{t("results.jobDescriptionMissing")}</p>
                  </div>
                )}
                </div>
              </PaywallModal>
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
                    <button className="btn ghost" onClick={() => void downloadCoverLetterPdf()}>
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
                  {(isPreviewOnly ? missing.slice(0, 5) : missing).map((item, idx) => (
                    <span className="tag" key={`miss-${idx}`}>{item}</span>
                  ))}
                  {isPreviewOnly && missing.length > 5 && (
                    <span className="tag">{t("results.lockedValue")}</span>
                  )}
                </div>
              </div>
              <div className="section">
                <h3 className="section-title">{t("results.recommendationsTitle")}</h3>
                <div className="steps">
                  {recommendations.length === 0 && (
                    <div className="step"><span>1</span><p>—</p></div>
                  )}
                  {(isPreviewOnly ? recommendations.slice(0, 2) : recommendations).map((item, index) => {
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
                  {isPreviewOnly && recommendations.length > 2 && (
                    <div className="step">
                      <span>…</span>
                      <p>{t("results.lockedLabel")}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="section">
                <h3 className="section-title">{t("results.appliedChanges")}</h3>
                <div className="steps">
                  <div className="step">
                    <span>1</span>
                    <p>
                      {t("results.addedKeywords")}{" "}
                      {addedKeywords.length > 0
                        ? (isPreviewOnly ? addedKeywords.slice(0, 6).join(" · ") : addedKeywords.join(" · "))
                        : "—"}
                    </p>
                  </div>
                  <div className="step">
                    <span>2</span>
                    <p>
                      {t("results.stillMissing")}{" "}
                      {remainingKeywords.length > 0
                        ? (isPreviewOnly ? remainingKeywords.slice(0, 6).join(" · ") : remainingKeywords.join(" · "))
                        : "—"}
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
    </main>
  );
}
