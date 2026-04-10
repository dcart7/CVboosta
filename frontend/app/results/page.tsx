"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import TopNav from "../components/TopNav";
import { getApiBase } from "../lib/apiBase";
import { useTranslation } from "../lib/LanguageContext";

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

const PDF_TEMPLATES: PdfTemplate[] = [
  {
    id: "modern",
    name: "Modern",
    accent: { r: 30, g: 58, b: 138 },
    marginX: 48,
    marginY: 56,
    fontBody: 11,
    fontHeader: 14,
    fontTitle: 22,
    lineGap: 3,
    titleBar: false,
    footer: true,
    layout: "single",
    fontFamily: "helvetica",
  },
  {
    id: "executive",
    name: "Executive",
    accent: { r: 10, g: 132, b: 255 },
    marginX: 50,
    marginY: 64,
    fontBody: 11,
    fontHeader: 13.5,
    fontTitle: 20,
    lineGap: 3,
    titleBar: true,
    footer: true,
    layout: "single",
    fontFamily: "helvetica",
  },
  {
    id: "classic",
    name: "Classic",
    accent: { r: 17, g: 17, b: 17 },
    marginX: 54,
    marginY: 64,
    fontBody: 11,
    fontHeader: 14,
    fontTitle: 20,
    lineGap: 3,
    titleBar: false,
    footer: false,
    layout: "single",
    fontFamily: "helvetica",
  },
  {
    id: "minimal",
    name: "Minimal",
    accent: { r: 17, g: 17, b: 17 },
    marginX: 62,
    marginY: 72,
    fontBody: 11,
    fontHeader: 13.5,
    fontTitle: 20,
    lineGap: 3,
    titleBar: false,
    footer: false,
    layout: "single",
    fontFamily: "helvetica",
  },
  {
    id: "compact",
    name: "Compact",
    accent: { r: 30, g: 58, b: 138 },
    marginX: 38,
    marginY: 46,
    fontBody: 10.25,
    fontHeader: 12.5,
    fontTitle: 19,
    lineGap: 2.5,
    titleBar: false,
    footer: true,
    layout: "single",
    fontFamily: "helvetica",
  },
  {
    id: "noir",
    name: "Noir",
    accent: { r: 99, g: 166, b: 255 },
    marginX: 48,
    marginY: 62,
    fontBody: 11,
    fontHeader: 13,
    fontTitle: 20,
    lineGap: 3,
    titleBar: true,
    footer: true,
    layout: "single",
    fontFamily: "helvetica",
  },
  {
    id: "sidebar",
    name: "Sidebar",
    accent: { r: 10, g: 132, b: 255 },
    marginX: 46,
    marginY: 58,
    fontBody: 10.5,
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
    name: "Serif",
    accent: { r: 30, g: 58, b: 138 },
    marginX: 54,
    marginY: 64,
    fontBody: 11,
    fontHeader: 13,
    fontTitle: 22,
    lineGap: 3,
    titleBar: false,
    footer: true,
    layout: "single",
    fontFamily: "times",
  },
  {
    id: "timeline",
    name: "Timeline",
    accent: { r: 30, g: 58, b: 138 },
    marginX: 54,
    marginY: 64,
    fontBody: 10.75,
    fontHeader: 13,
    fontTitle: 20,
    lineGap: 3,
    titleBar: false,
    footer: true,
    layout: "timeline",
    fontFamily: "helvetica",
  },
];

const DEFAULT_PDF_TEMPLATE: PdfTemplateId = "modern";

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
      .replace(/^Smart CV Optimizer\s*•\s*Page.*$/gim, "")
      .replace(/^Smart CV Optimizer\s*•\s*P.*$/gim, "")
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
  ]);
  if (known.has(key)) return true;
  if (trimmed.length > 42) return false;
  const letters = trimmed.replace(/[^A-Za-z]/g, "");
  if (letters.length >= 4) {
    const upperLetters = letters.replace(/[^A-Z]/g, "");
    if (upperLetters.length / letters.length > 0.85) return true;
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

export default function ResultsPage() {
  const apiBase = getApiBase();
  const { t } = useTranslation();
  const [optimizedCv, setOptimizedCv] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [matchBefore, setMatchBefore] = useState<number | null>(null);
  const [matchAfter, setMatchAfter] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [pdfTemplate, setPdfTemplate] =
    useState<PdfTemplateId>(DEFAULT_PDF_TEMPLATE);
  const [showFullCv, setShowFullCv] = useState(false);

  useEffect(() => {
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
    let storedRecs: string[] = [];
    try {
      storedMissing = JSON.parse(localStorage.getItem("missing_skills") || "[]");
      storedRecs = JSON.parse(localStorage.getItem("recommendations") || "[]");
    } catch (e) {
      console.error("Failed to parse storage:", e);
    }
    const storedBefore = localStorage.getItem("match_before");
    const storedAfter = localStorage.getItem("match_after");
    setOptimizedCv(storedCv);
    setMissing(storedMissing);
    setRecommendations(storedRecs);
    if (storedBefore !== null && !Number.isNaN(Number(storedBefore))) {
      setMatchBefore(Number(storedBefore));
    }
    if (storedAfter !== null && !Number.isNaN(Number(storedAfter))) {
      setMatchAfter(Number(storedAfter));
    }

    const cvText = localStorage.getItem("cv_text") || "";
    const jobText = localStorage.getItem("job_text") || "";
    if (!cvText || !jobText) {
      setStatus("Missing CV or job description. Run optimization first.");
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
        setStatus("Failed to load match scores.");
      }
    };
    loadScores();
  }, [apiBase]);

  const activeTemplate =
    PDF_TEMPLATES.find((item) => item.id === pdfTemplate) || PDF_TEMPLATES[0];

  const cleanedCv = useMemo(() => sanitizeCvText(optimizedCv), [optimizedCv]);
  const previewBlocks = useMemo(
    () => parsePreviewBlocks(optimizedCv),
    [optimizedCv],
  );
  const parsedCv = useMemo(() => extractSections(cleanedCv), [cleanedCv]);
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

  const normalizedOptimized = optimizedCv.toLowerCase();
  const addedKeywords = missing.filter((skill) =>
    normalizedOptimized.includes(skill.toLowerCase()),
  );
  const remainingKeywords = missing.filter(
    (skill) => !normalizedOptimized.includes(skill.toLowerCase()),
  );

  const copyCv = async () => {
    if (!optimizedCv) {
      setStatus("No optimized CV found yet.");
      return;
    }
    await navigator.clipboard.writeText(optimizedCv);
    setStatus("Copied to clipboard.");
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
      setStatus("No optimized CV found yet.");
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
        if (trimmed.startsWith("•")) return { isBullet: true, text: trimmed.slice(1).trim() };
        if (trimmed.startsWith("-")) return { isBullet: true, text: trimmed.slice(1).trim() };
        if (trimmed.startsWith("*")) return { isBullet: true, text: trimmed.slice(1).trim() };
        return { isBullet: false, text: trimmed };
      };

      const ensureSpace = (y: number, neededHeight: number) => {
        if (y + neededHeight <= pageHeight - marginY) return y;
        doc.addPage();
        return marginY;
      };

      const renderWrapped = (text: string, x: number, y: number, fontSize: number) => {
        doc.setFont(fontFamily, "normal");
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, contentWidth - (x - marginX));
        const lineHeight = fontSize + lineGap;
        let cursorY = y;
        for (const chunk of lines) {
          cursorY = ensureSpace(cursorY, lineHeight);
          doc.text(chunk, x, cursorY);
          cursorY += lineHeight;
        }
        return cursorY;
      };

      const { title: titleLine, sections } = parsedCv;
      let cursorY = marginY;

      if (template.titleBar) {
        doc.setFillColor(8, 11, 18);
        doc.rect(0, 0, pageWidth, 86, "F");
        doc.setFont(fontFamily, "bold");
        doc.setFontSize(fontTitle);
        doc.setTextColor(255, 255, 255);
        doc.text(titleLine.trim().slice(0, 80), marginX, 54);
        doc.setDrawColor(accent.r, accent.g, accent.b);
        doc.setLineWidth(2);
        doc.line(marginX, 66, marginX + 140, 66);
        doc.setLineWidth(1);
        doc.setTextColor(0, 0, 0);
        cursorY = 120;
      } else {
        doc.setFont(fontFamily, "bold");
        doc.setFontSize(fontTitle);
        doc.setTextColor(17, 17, 17);
        cursorY = renderWrapped(titleLine.trim().slice(0, 120), marginX, cursorY, fontTitle);
        cursorY += 8;
      }

      const drawSection = (heading: string) => {
        cursorY = ensureSpace(cursorY, fontHeader + 14);
        doc.setFont(fontFamily, "bold");
        doc.setFontSize(fontHeader);
        doc.setTextColor(accent.r, accent.g, accent.b);
        const headerText = heading.trim().toUpperCase();
        cursorY = renderWrapped(headerText, marginX, cursorY, fontHeader);
        doc.setDrawColor(210, 210, 210);
        doc.line(marginX, cursorY + 4, pageWidth - marginX, cursorY + 4);
        doc.setTextColor(0, 0, 0);
        cursorY += 10;
      };

      const drawBullet = (text: string) => {
        const indent = 16;
        const bulletGap = 10;
        const lineHeight = fontBody + lineGap;
        cursorY = ensureSpace(cursorY, lineHeight);
        doc.setFont(fontFamily, "normal");
        doc.setFontSize(fontBody);
        doc.setTextColor(accent.r, accent.g, accent.b);
        doc.text("•", marginX, cursorY);
        doc.setTextColor(0, 0, 0);
        const wrapped = doc.splitTextToSize(text, contentWidth - indent - bulletGap);
        let localY = cursorY;
        for (const chunk of wrapped) {
          localY = ensureSpace(localY, lineHeight);
          doc.text(chunk, marginX + indent, localY);
          localY += lineHeight;
        }
        cursorY = localY;
      };

      const drawText = (text: string) => {
        cursorY = renderWrapped(text, marginX, cursorY, fontBody);
      };

      if (template.layout === "sidebar") {
        const sidebarWidth = 170;
        const colGap = 18;
        const leftX = marginX;
        const rightX = marginX + sidebarWidth + colGap;
        const rightWidth = pageWidth - marginX - rightX;

        const inSidebar = (heading: string) => {
          const key = heading.toLowerCase();
          return (
            key.includes("skill") ||
            key.includes("language") ||
            key.includes("cert") ||
            key.includes("award") ||
            key.includes("contact")
          );
        };

        const leftSections = sections.filter((s) => inSidebar(s.heading));
        const rightSections = sections.filter((s) => !inSidebar(s.heading));

        doc.setFillColor(245, 247, 252);
        doc.rect(marginX - 10, cursorY - 6, sidebarWidth + 20, pageHeight - cursorY - marginY + 12, "F");
        doc.setDrawColor(220, 227, 240);
        doc.line(rightX - 9, cursorY - 6, rightX - 9, pageHeight - marginY + 6);

        const renderWrappedCol = (text: string, x: number, y: number, width: number, size: number, bold = false) => {
          doc.setFont(fontFamily, bold ? "bold" : "normal");
          doc.setFontSize(size);
          const lines = doc.splitTextToSize(text, width);
          const lh = size + lineGap;
          let cy = y;
          for (const chunk of lines) {
            cy = ensureSpace(cy, lh);
            doc.text(chunk, x, cy);
            cy += lh;
          }
          return cy;
        };

        let leftY = cursorY;
        for (const sec of leftSections) {
          doc.setTextColor(accent.r, accent.g, accent.b);
          leftY = renderWrappedCol(sec.heading.toUpperCase(), leftX, leftY, sidebarWidth, 10.5, true);
          doc.setTextColor(0, 0, 0);
          leftY += 6;
          for (const raw of sec.lines) {
            const trimmed = raw.trim();
            if (!trimmed) { leftY += 6; continue; }
            const bullet = normalizeBulletLine(trimmed);
            if (bullet.isBullet) {
              doc.setTextColor(accent.r, accent.g, accent.b);
              doc.text("•", leftX, leftY);
              doc.setTextColor(0, 0, 0);
              leftY = renderWrappedCol(bullet.text, leftX + 12, leftY, sidebarWidth - 12, 9.75, false);
            } else {
              leftY = renderWrappedCol(bullet.text, leftX, leftY, sidebarWidth, 9.75, false);
            }
          }
          leftY += 12;
        }

        let rightY = cursorY;
        const ensureRightSpace = (y: number, needed: number) => {
          if (y + needed <= pageHeight - marginY) return y;
          doc.addPage();
          doc.setFillColor(245, 247, 252);
          doc.rect(marginX - 10, marginY - 6, sidebarWidth + 20, pageHeight - marginY - marginY + 12, "F");
          doc.setDrawColor(220, 227, 240);
          doc.line(rightX - 9, marginY - 6, rightX - 9, pageHeight - marginY + 6);
          return marginY;
        };

        const renderWrappedRight = (text: string, x: number, y: number, size: number, bold = false) => {
          doc.setFont(fontFamily, bold ? "bold" : "normal");
          doc.setFontSize(size);
          const lines = doc.splitTextToSize(text, rightWidth);
          const lh = size + lineGap;
          let cy = y;
          for (const chunk of lines) {
            cy = ensureRightSpace(cy, lh);
            doc.text(chunk, x, cy);
            cy += lh;
          }
          return cy;
        };

        for (const sec of rightSections) {
          rightY = ensureRightSpace(rightY, fontHeader + 14);
          doc.setFont(fontFamily, "bold");
          doc.setFontSize(fontHeader);
          doc.setTextColor(accent.r, accent.g, accent.b);
          rightY = renderWrappedRight(sec.heading.toUpperCase(), rightX, rightY, fontHeader, true);
          doc.setTextColor(0, 0, 0);
          doc.setDrawColor(210, 210, 210);
          doc.line(rightX, rightY + 4, pageWidth - marginX, rightY + 4);
          rightY += 12;

          for (const raw of sec.lines) {
            const trimmed = raw.trim();
            if (!trimmed) { rightY = ensureRightSpace(rightY, 10); rightY += 8; continue; }
            const bullet = normalizeBulletLine(trimmed);
            if (bullet.isBullet) {
              const lh = fontBody + lineGap;
              rightY = ensureRightSpace(rightY, lh);
              doc.setFont(fontFamily, "normal");
              doc.setFontSize(fontBody);
              doc.setTextColor(accent.r, accent.g, accent.b);
              doc.text("•", rightX, rightY);
              doc.setTextColor(0, 0, 0);
              const wrapped = doc.splitTextToSize(bullet.text, rightWidth - 18);
              let localY = rightY;
              for (const chunk of wrapped) {
                localY = ensureRightSpace(localY, lh);
                doc.text(chunk, rightX + 14, localY);
                localY += lh;
              }
              rightY = localY;
            } else {
              rightY = renderWrappedRight(bullet.text, rightX, rightY, fontBody, false);
            }
          }
          rightY += 10;
        }
      } else {
        if (template.layout === "timeline") {
          doc.setDrawColor(accent.r, accent.g, accent.b);
          doc.setLineWidth(2);
          doc.line(marginX - 8, cursorY, marginX - 8, pageHeight - marginY);
          doc.setLineWidth(1);
          doc.setDrawColor(0, 0, 0);
        }

        for (const sec of sections) {
          drawSection(sec.heading);
          for (const raw of sec.lines) {
            const line = raw.trimEnd();
            if (!line.trim()) {
              cursorY = ensureSpace(cursorY, fontBody + 8);
              cursorY += 8;
              continue;
            }
            const bullet = normalizeBulletLine(line);
            if (bullet.isBullet) { drawBullet(bullet.text); continue; }
            drawText(bullet.text);
          }
        }
      }

      if (template.footer) {
        const pageCount = doc.getNumberOfPages();
        for (let page = 1; page <= pageCount; page += 1) {
          doc.setPage(page);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(140, 140, 140);
          doc.text(
            `Smart CV Optimizer • Page ${page} / ${pageCount}`,
            marginX,
            pageHeight - marginY + 28,
          );
        }
        doc.setTextColor(0, 0, 0);
      }

      doc.save(`optimized_cv_${template.id}.pdf`);
      setStatus("PDF downloaded.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to generate PDF.");
    }
  };

  // suppress unused warning
  void activeTemplate;

  return (
    <main className="page">
      <TopNav />
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
        <section className="split fade-up">
          <div className="hero-card">
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
                {previewBlocks.length === 0 && (
                  <div className="pdf-preview-empty">—</div>
                )}
                {pdfTemplate === "sidebar" ? (
                  <>
                    <div className="pdf-col sidebar">
                      <div className="pdf-title">{parsedCv.title}</div>
                      {(parsedCv.sections
                        .filter((s) => /skills|languages|cert|award|contact/i.test(s.heading))
                        .slice(0, 2)
                      ).map((sec) => (
                        <div key={`left-${sec.heading}`}>
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
                      ).map((sec) => (
                        <div key={`right-${sec.heading}`}>
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
              <button className="btn ghost" onClick={downloadPdf}>
                {t("results.downloadPdf")}
              </button>
            </div>
            {status && <p>{status}</p>}
          </div>

          <div className="form-card">
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
                {recommendations.map((item, index) => (
                  <div className="step" key={`rec-${index}`}>
                    <span>{index + 1}</span>
                    <p>{item}</p>
                  </div>
                ))}
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
            <div className="history-actions">
              <Link className="btn secondary" href="/history">
                {t("results.saveToHistory")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
