"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import { getApiBase } from "../lib/apiBase";
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

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError(t("history.loginRequired"));
      setLoading(false);
      return;
    }
    fetch(`${apiBase}/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setItems(data.items || []))
      .catch(() => setError(t("history.failed")))
      .finally(() => setLoading(false));
  }, [apiBase, t]);

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
            </div>
            {loading && <p>{t("history.loading")}</p>}
            {error && <p style={{ color: "#b42318" }}>{error}</p>}
            {!loading && !error && items.length === 0 && (
              <p>{t("history.empty")}</p>
            )}
            {items.map((item) => (
              <div className="history-row" key={item.id}>
                <div>{item.role || "—"}</div>
                <div>{item.company || "—"}</div>
                <div>{scoreToLabel(item.score)}</div>
                <div>{formatDate(item.created_at)}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
