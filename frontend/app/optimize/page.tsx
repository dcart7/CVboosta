"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import { getApiBase } from "../lib/apiBase";
import { useTranslation } from "../lib/LanguageContext";
import {
  fetchWorkspaceEmail,
  migrateLegacyGuestWorkspace,
  workspaceIdFromEmail,
  wsFieldKey,
} from "../lib/workspaceStorage";

export default function OptimizePage() {
  const apiBase = getApiBase();
  const { t } = useTranslation();
  const [targetRole, setTargetRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [status, setStatus] = useState("");
  const [previewSummary, setPreviewSummary] = useState("");
  const [matchPercent, setMatchPercent] = useState<number | null>(null);
  const [missingCount, setMissingCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const email = await fetchWorkspaceEmail(apiBase);
      if (cancelled) return;
      const wid = workspaceIdFromEmail(email);
      migrateLegacyGuestWorkspace(wid);
      setTargetRole(localStorage.getItem(wsFieldKey(wid, "target_role")) || "");
      setTargetCompany(
        localStorage.getItem(wsFieldKey(wid, "target_company")) || "",
      );
      const optimized = localStorage.getItem("optimized_cv") || "";
      if (optimized) {
        setPreviewSummary(optimized.split("\n")[0] || optimized);
      } else {
        const cvText = localStorage.getItem(wsFieldKey(wid, "cv_text")) || "";
        setPreviewSummary(cvText.split(".")[0] || "—");
      }

      const cvText = localStorage.getItem(wsFieldKey(wid, "cv_text")) || "";
      const jobText = localStorage.getItem(wsFieldKey(wid, "job_text")) || "";
      if (cvText && jobText) {
        fetch(`${apiBase}/analyze/match`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cv_text: cvText, job_text: jobText }),
        })
          .then((res) => (res.ok ? res.json() : Promise.reject()))
          .then((data) => {
            if (!cancelled) {
              setMatchPercent(data.match_percent ?? null);
              setMissingCount((data.missing_keywords || []).length);
            }
          })
          .catch(() => {
            if (!cancelled) {
              setMatchPercent(null);
              setMissingCount(0);
            }
          });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  const runOptimization = async () => {
    const email = await fetchWorkspaceEmail(apiBase);
    const wid = workspaceIdFromEmail(email);
    migrateLegacyGuestWorkspace(wid);
    const cvText = localStorage.getItem(wsFieldKey(wid, "cv_text")) || "";
    const jobText = localStorage.getItem(wsFieldKey(wid, "job_text")) || "";
    const token = localStorage.getItem("auth_token") || "";
    if (!cvText || !jobText) {
      setStatus("Upload CV and job description first.");
      return;
    }
    setStatus(t("common.loading"));
    try {
      const response = await fetch(`${apiBase}/optimize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          cv_text: cvText,
          job_text: jobText,
          cv_analysis: "",
          job_analysis: "",
          target_role: targetRole,
          target_company: targetCompany,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setStatus(payload.detail || "Optimization failed.");
        return;
      }
      const data = await response.json();
      localStorage.setItem("optimized_cv", data.optimized_cv || "");
      localStorage.setItem(
        "missing_skills",
        JSON.stringify(data.missing_skills || []),
      );
      localStorage.setItem(
        "recommendations",
        JSON.stringify(data.recommendations || []),
      );
      if (typeof data.match_before === "number") {
        localStorage.setItem("match_before", String(data.match_before));
      }
      if (typeof data.match_after === "number") {
        localStorage.setItem("match_after", String(data.match_after));
      }
      setStatus("Done. Opening results...");
      window.location.href = "/results";
    } catch (err) {
      setStatus(
        err instanceof Error
          ? err.message
          : "Cannot reach backend. Check that it is running.",
      );
    }
  };

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="split fade-up">
          <div className="form-card">
            <h2 className="section-title">{t("optimize.title")}</h2>
            <div className="form-grid">
              <div>
                <div className="label">{t("optimize.tone")}</div>
                <select className="select">
                  <option>{t("optimize.professional")}</option>
                  <option>{t("optimize.executive")}</option>
                  <option>{t("optimize.creative")}</option>
                </select>
              </div>
              <div>
                <div className="label">{t("optimize.focusAreas")}</div>
                <input
                  className="input"
                  placeholder={t("optimize.focusPlaceholder")}
                />
              </div>
              <div>
                <div className="label">{t("optimize.includeKeywords")}</div>
                <input
                  className="input"
                  placeholder={t("optimize.keywordsPlaceholder")}
                />
              </div>
            </div>
            <div className="nav-actions">
              <button className="btn primary" type="button" onClick={runOptimization}>
                {t("optimize.runOptimization")}
              </button>
              <Link className="btn ghost" href="/analyze">
                {t("optimize.backToAnalysis")}
              </Link>
            </div>
            {status && <p>{status}</p>}
          </div>

          <div className="hero-card">
            <h2 className="section-title">{t("optimize.draftPreview")}</h2>
            <div className="result-box">
              <h3>{t("optimize.optimizedSummary")}</h3>
              <p>{previewSummary || "—"}</p>
            </div>
            <div className="section">
              <h3 className="section-title">{t("optimize.confidenceSignals")}</h3>
              <div className="grid">
                <div className="card">
                  <h3>{t("optimize.keywordAlignment")}</h3>
                  <p>
                    {matchPercent !== null ? `${matchPercent}%` : "—"} {t("optimize.matchToTarget")}
                  </p>
                </div>
                <div className="card">
                  <h3>{t("optimize.impactClarity")}</h3>
                  <p>{missingCount} {t("optimize.missingDetected")}</p>
                </div>
              </div>
            </div>
            <div className="section">
              <h3 className="section-title">{t("optimize.target")}</h3>
              <div className="card">
                <p>
                  {targetRole || t("optimize.roleNotSet")} · {targetCompany || t("optimize.companyNotSet")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
