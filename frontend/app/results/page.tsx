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
    const storedMissing = JSON.parse(localStorage.getItem("missing_skills") || "[]");
    const storedRecs = JSON.parse(localStorage.getItem("recommendations") || "[]");
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
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 48;
    const marginY = 56;
    const contentWidth = pageWidth - marginX * 2;
    let cursorY = marginY;

    const addPageIfNeeded = (heightNeeded: number) => {
      if (cursorY + heightNeeded > pageHeight - marginY) {
        doc.addPage();
        cursorY = marginY;
      }
    };

    const addWrappedText = (
      text: string,
      fontSize: number,
      isBold = false,
      indent = 0,
      lineGap = 4,
    ) => {
      doc.setFont("Times", isBold ? "Bold" : "Normal");
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, contentWidth - indent);
      const lineHeight = fontSize + lineGap;
      addPageIfNeeded(lines.length * lineHeight);
      lines.forEach((line: string) => {
        doc.text(line, marginX + indent, cursorY);
        cursorY += lineHeight;
      });
      cursorY += lineGap;
    };

    const lines = optimizedCv.split(/\r?\n/).map((line) => line.trim());

    const isHeader = (line: string) => {
      if (!line) return false;
      const upper = line.toUpperCase();
      if (line.endsWith(":")) return true;
      if (line.length <= 36 && line === upper) return true;
      return false;
    };

    lines.forEach((line) => {
      if (!line) {
        cursorY += 6;
        return;
      }
      if (isHeader(line)) {
        addWrappedText(line.replace(/:$/, ""), 14, true, 0, 6);
        return;
      }
      if (line.startsWith("- ") || line.startsWith("• ")) {
        const bullet = line.replace(/^[-•]\s*/, "");
        addWrappedText(`• ${bullet}`, 12, false, 12, 2);
        return;
      }
      addWrappedText(line, 12, false, 0, 2);
    });

    doc.save("optimized-cv.pdf");
  };

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
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
