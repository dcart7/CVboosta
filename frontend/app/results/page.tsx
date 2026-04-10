"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import TopNav from "../components/TopNav";

export default function ResultsPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const [optimizedCv, setOptimizedCv] = useState("");
  const [missing, setMissing] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [matchBefore, setMatchBefore] = useState<number | null>(null);
  const [matchAfter, setMatchAfter] = useState<number | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
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

  const downloadPdf = () => {
    if (!optimizedCv) {
      setStatus("No optimized CV found yet.");
      return;
    }
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginX = 48;
      const marginY = 56;
      const contentWidth = pageWidth - marginX * 2;

      const fontBody = 10.5;
      const fontHeader = 12.5;
      const lineGap = 3;

      const looksLikeHeader = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return false;
        if (trimmed.length > 48) return false;
        if (trimmed.endsWith(":")) return true;
        const letters = trimmed.replace(/[^A-Za-z]/g, "");
        if (letters.length < 4) return false;
        const upperLetters = letters.replace(/[^A-Z]/g, "");
        return upperLetters.length / letters.length > 0.85;
      };

      const normalizeBulletLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return { isBullet: false, text: "" };
        if (trimmed.startsWith("•")) return { isBullet: true, text: trimmed.slice(1).trim() };
        if (trimmed.startsWith("-")) return { isBullet: true, text: trimmed.slice(1).trim() };
        return { isBullet: false, text: trimmed };
      };

      const ensureSpace = (y: number, neededHeight: number) => {
        if (y + neededHeight <= pageHeight - marginY) return y;
        doc.addPage();
        return marginY;
      };

      const renderWrapped = (text: string, x: number, y: number, fontSize: number) => {
        doc.setFont("helvetica", "normal");
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

      let cursorY = marginY;
      const lines = optimizedCv.replace(/\r\n/g, "\n").split("\n");

      for (const rawLine of lines) {
        const line = rawLine.trimEnd();
        if (!line.trim()) {
          cursorY = ensureSpace(cursorY, fontBody + 8);
          cursorY += 8;
          continue;
        }

        if (looksLikeHeader(line)) {
          cursorY = ensureSpace(cursorY, fontHeader + 14);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(fontHeader);
          doc.setTextColor(30, 58, 138);
          const headerText = line.trim().replace(/:$/, "").toUpperCase();
          cursorY = renderWrapped(headerText, marginX, cursorY, fontHeader);
          doc.setDrawColor(210, 210, 210);
          doc.line(marginX, cursorY + 4, pageWidth - marginX, cursorY + 4);
          doc.setTextColor(0, 0, 0);
          cursorY += 10;
          continue;
        }

        const bullet = normalizeBulletLine(line);
        if (bullet.isBullet) {
          const indent = 16;
          const bulletGap = 10;
          const lineHeight = fontBody + lineGap;
          cursorY = ensureSpace(cursorY, lineHeight);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(fontBody);
          doc.text("•", marginX, cursorY);
          const wrapped = doc.splitTextToSize(bullet.text, contentWidth - indent - bulletGap);
          let localY = cursorY;
          for (const chunk of wrapped) {
            localY = ensureSpace(localY, lineHeight);
            doc.text(chunk, marginX + indent, localY);
            localY += lineHeight;
          }
          cursorY = localY;
          continue;
        }

        cursorY = renderWrapped(bullet.text, marginX, cursorY, fontBody);
      }

      doc.save("optimized_cv.pdf");
      setStatus("PDF downloaded.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Failed to generate PDF.");
    }
  };

  return (
    <main className="page">
      <TopNav />
      {optimizedCv && (
        <div className="print-only">
          {optimizedCv.split(/\r?\n/).map((line, idx) => {
            const isHeading = line === line.toUpperCase() && line.length > 2 && line.length < 50 && !line.startsWith("-");
            if (idx === 0) return <h1 key={idx} style={{ fontSize: "24pt", margin: "0 0 16pt", borderBottom: "2px solid #333", paddingBottom: "8pt" }}>{line}</h1>;
            if (isHeading) return <h2 key={idx} style={{ fontSize: "12pt", color: "#1e3a8a", margin: "16pt 0 4pt", textTransform: "uppercase", borderBottom: "1px solid #ccc", paddingBottom: "2pt" }}>{line}</h2>;
            if (!line.trim()) return <div key={idx} style={{ height: "8pt" }} />;
            if (line.startsWith("-") || line.startsWith("•")) return <p key={idx} style={{ margin: "2pt 0 2pt 16pt", textIndent: "-8pt" }}>• {line.substring(1).trim()}</p>;
            return <p key={idx} style={{ margin: "2pt 0" }}>{line}</p>;
          })}
        </div>
      )}
      <div className="shell hide-print">
        <section className="split fade-up">
          <div className="hero-card">
            <h2 className="section-title">Optimized CV</h2>
            <div className="grid">
              <div className="kpi">
                <h3>{matchBefore !== null ? `${matchBefore}%` : "—"}</h3>
                <p>fit before edit</p>
              </div>
              <div className="kpi">
                <h3>{matchAfter !== null ? `${matchAfter}%` : "—"}</h3>
                <p>fit after edit</p>
              </div>
            </div>
            <div className="result-box">
              <h3>Summary</h3>
              <p>{optimizedCv || "—"}</p>
            </div>
            <div className="nav-actions">
              <button className="btn primary" onClick={copyCv}>
                Copy full CV
              </button>
              <button className="btn ghost" onClick={downloadPdf}>
                Download PDF
              </button>
            </div>
            {status && <p>{status}</p>}
          </div>

          <div className="form-card">
            <h2 className="section-title">Result metrics</h2>
            <div className="grid">
              <div className="kpi">
                <h3>{missing.length}</h3>
                <p>missing keywords</p>
              </div>
              <div className="kpi">
                <h3>{recommendations.length}</h3>
                <p>recommendations</p>
              </div>
            </div>
            <div className="section">
              <h3 className="section-title">Missing keywords</h3>
              <div className="tag-list">
                {missing.length === 0 && <span className="tag">—</span>}
                {missing.map((item) => (
                  <span className="tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="section">
              <h3 className="section-title">Recommendations</h3>
              <div className="steps">
                {recommendations.length === 0 && (
                  <div className="step">
                    <span>1</span>
                    <p>—</p>
                  </div>
                )}
                {recommendations.map((item, index) => (
                  <div className="step" key={item}>
                    <span>{index + 1}</span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="section">
              <h3 className="section-title">Applied changes</h3>
              <div className="steps">
                <div className="step">
                  <span>1</span>
                  <p>
                    Added keywords:{" "}
                    {addedKeywords.length > 0 ? addedKeywords.join(" · ") : "—"}
                  </p>
                </div>
                <div className="step">
                  <span>2</span>
                  <p>
                    Still missing:{" "}
                    {remainingKeywords.length > 0
                      ? remainingKeywords.join(" · ")
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
            <Link className="btn secondary" href="/history">
              Save to history
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
