"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getApiBase } from "../lib/apiBase";
import { fetchWithRetry } from "../lib/fetchRetry";
import { useTranslation } from "../lib/LanguageContext";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [token, setToken] = useState("");
  const apiBase = getApiBase();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const value = new URLSearchParams(window.location.search).get("token") || "";
    setToken(value);
  }, []);

  const submit = async () => {
    setError("");
    if (!token) {
      setError(t("auth.invalidResetLink"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.passwordsDoNotMatch"));
      return;
    }

    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 10;
    if (!isLongEnough || !hasNumber || !hasSymbol) {
      setError(t("auth.passwordWeak"));
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithRetry(
        `${apiBase}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, new_password: password }),
        },
        { attempts: 3, baseDelayMs: 350, timeoutMs: 20_000 },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.detail || t("auth.resetPasswordFailed"));
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.resetPasswordFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="shell">
        <section className="split auth-split fade-up">
          <div className="auth-header">
            <h1 className="hero-title">{t("auth.resetPasswordTitle")}</h1>
            <p className="hero-subtitle">{t("auth.resetPasswordSubtitle")}</p>
          </div>
          <form className="form-card form-grid auth-form" onSubmit={(e) => e.preventDefault()}>
            <div>
              <div className="label">{t("auth.newPassword")}</div>
              <input
                className="input"
                type="password"
                placeholder={t("auth.passwordPlaceholder")}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <div>
              <div className="label">{t("account.confirmPassword")}</div>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
            {done ? (
              <p style={{ color: "var(--accent)" }}>{t("auth.passwordResetSuccess")}</p>
            ) : (
              <button className="btn primary" type="button" onClick={submit} disabled={loading}>
                {loading ? t("auth.updatingPassword") : t("auth.resetPasswordCta")}
              </button>
            )}
            {error && <p style={{ color: "#b42318" }}>{error}</p>}
            <Link className="btn ghost" href="/login">
              {t("auth.backToLogin")}
            </Link>
          </form>
          <div className="card auth-footer-card">
            <h3>{t("auth.securityFirst")}</h3>
            <p>{t("auth.securityFirstDesc")}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
