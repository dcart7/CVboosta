"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import { getApiBase } from "../lib/apiBase";

type HistoryItem = {
  id: number;
  role: string | null;
  company: string | null;
  score: number;
  created_at: string;
};

export default function HistoryPage() {
  const apiBase = getApiBase();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setError("Please log in to view history.");
      setLoading(false);
      return;
    }
    fetch(`${apiBase}/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setItems(data.items || []))
      .catch(() => setError("Failed to load history."))
      .finally(() => setLoading(false));
  }, [apiBase]);

  const formatDate = (value: string) =>
    new Date(value).toLocaleString("ru-RU", {
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
              <h1 className="hero-title">History</h1>
              <p className="hero-subtitle">
                Every optimized CV version, ready to open or export.
              </p>
            </div>
            <Link className="btn primary" href="/app">
              New session
            </Link>
          </div>

          <div className="section">
            <div className="history-row">
              <strong>Role</strong>
              <strong>Company</strong>
              <strong>Score</strong>
              <strong>Date</strong>
            </div>
            {loading && <p>Loading history...</p>}
            {error && <p style={{ color: "#b42318" }}>{error}</p>}
            {!loading && !error && items.length === 0 && (
              <p>No optimized CVs yet. Run optimization to see history.</p>
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
