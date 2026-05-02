"use client";

import Link from "next/link";
import { useState } from "react";
import { getApiBase } from "../lib/apiBase";
import { fetchWithRetry } from "../lib/fetchRetry";
import { useTranslation } from "../lib/LanguageContext";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const apiBase = getApiBase();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await fetchWithRetry(
        `${apiBase}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
        { attempts: 4, baseDelayMs: 350, timeoutMs: 20_000 },
      );
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.detail || t("auth.resetRequestFailed"));
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.resetRequestFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="shell">
        <section className="split auth-split fade-up">
          <div className="auth-header">
            <h1 className="hero-title">{t("auth.forgotPasswordTitle")}</h1>
            <p className="hero-subtitle">{t("auth.forgotPasswordSubtitle")}</p>
          </div>
          <form className="form-card form-grid auth-form" onSubmit={(e) => e.preventDefault()}>
            <div>
              <div className="label">{t("auth.email")}</div>
              <input
                className="input"
                placeholder="you@domain.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            {done ? (
              <p style={{ color: "var(--accent)" }}>{t("auth.resetEmailSent")}</p>
            ) : (
              <button className="btn primary" type="button" onClick={submit} disabled={loading}>
                {loading ? t("auth.sendingResetLink") : t("auth.sendResetLink")}
              </button>
            )}
            {error && <p style={{ color: "#b42318" }}>{error}</p>}
            <Link className="btn ghost" href="/login">
              {t("auth.backToLogin")}
            </Link>
          </form>
          <div className="card auth-footer-card">
            <h3>{t("auth.checkInbox")}</h3>
            <p>{t("auth.checkInboxDesc")}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
