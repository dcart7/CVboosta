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
    window.print();
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
