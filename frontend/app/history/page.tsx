"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import { getApiBase } from "../lib/apiBase";
import { fetchWithRetry } from "../lib/fetchRetry";
import { useTranslation } from "../lib/LanguageContext";

type HistoryItem = {
  id: number;
  role: string | null;
  company: string | null;
  score: number;
  created_at: string;
};

export default function HistoryPage() {
  const apiBase = getApiBase();
  const { t } = useTranslation();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  /** loginRequired | offline — only offline is retryable */
  const [errorKind, setErrorKind] = useState<"login" | "offline" | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    setErrorKind(null);
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError(t("history.loginRequired"));
      setErrorKind("login");
      setLoading(false);
      return;
    }
    try {
      const res = await fetchWithRetry(
        `${apiBase}/history`,
        { headers: { Authorization: `Bearer ${token}` } },
        { attempts: 5, baseDelayMs: 400, timeoutMs: 20_000 },
      );
      if (res.status === 401) {
        setError(t("history.loginRequired"));
        setErrorKind("login");
        setItems([]);
        return;
      }
      if (!res.ok) {
        setError(t("history.offlineDetail"));
        setErrorKind("offline");
        setItems([]);
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setError(t("history.offlineDetail"));
      setErrorKind("offline");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase, t]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const formatDate = (value: string) =>
    new Date(value).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

  const scoreToLabel = (score: number) => `${score}%`;

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="form-card fade-up">
          <div className="nav-actions">
            <div>
              <h1 className="hero-title">{t("history.title")}</h1>
              <p className="hero-subtitle">{t("history.subtitle")}</p>
            </div>
            <Link className="btn primary" href="/app">
              {t("history.newSession")}
            </Link>
          </div>

          <div className="section">
            <div className="history-row">
              <strong>{t("history.role")}</strong>
              <strong>{t("history.company")}</strong>
              <strong>{t("history.score")}</strong>
              <strong>{t("history.date")}</strong>
              <strong></strong>
            </div>
            {loading && <p>{t("history.loading")}</p>}
            {error && (
              <div className="section">
                <p style={{ color: "#b42318" }}>{error}</p>
                {errorKind === "offline" && (
                  <button className="btn primary" type="button" onClick={() => void loadHistory()}>
                    {t("history.retry")}
                  </button>
                )}
              </div>
            )}
            {!loading && !error && items.length === 0 && (
              <p>{t("history.empty")}</p>
            )}
            {items.map((item) => (
              <Link 
                href={`/results?id=${item.id}`} 
                key={item.id} 
                className="history-row" 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div>{item.role || "—"}</div>
                <div>{item.company || "—"}</div>
                <div>{scoreToLabel(item.score)}</div>
                <div>{formatDate(item.created_at)}</div>
                <div style={{ textAlign: 'right' }}>
                  <span className="btn secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>
                    {t("history.view")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
