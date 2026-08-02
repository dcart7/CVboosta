"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import TopNav from "../components/TopNav";
import { getApiBase } from "../lib/apiBase";
import { fetchWithRetry } from "../lib/fetchRetry";
import { createIdempotencyKey } from "../lib/funnelIntent";
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
  const resetIdempotencyKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const queryToken = new URLSearchParams(window.location.search).get("token") || "";
    const fragment = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const fragmentToken = new URLSearchParams(fragment).get("token") || "";
    const value = queryToken || fragmentToken;
    // Remove the credential before any subsequent navigation, referrer, copy,
    // screenshot, or browser-history interaction can expose it.
    window.history.replaceState({}, "", "/reset-password");
    setToken(value);
  }, []);

  const submit = async () => {
    if (loading || done) return;
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
    const idempotencyKey =
      resetIdempotencyKeyRef.current || createIdempotencyKey("password-reset");
    resetIdempotencyKeyRef.current = idempotencyKey;
    try {
      const response = await fetchWithRetry(
        `${apiBase}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify({ token, new_password: password }),
        },
        { attempts: 3, baseDelayMs: 350, timeoutMs: 20_000 },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const definitiveConflict =
          response.status === 409 && !response.headers.has("Retry-After");
        if (
          [400, 401, 403, 404, 422].includes(response.status) ||
          definitiveConflict
        ) {
          resetIdempotencyKeyRef.current = null;
        }
        throw new Error(payload?.detail || t("auth.resetPasswordFailed"));
      }
      resetIdempotencyKeyRef.current = null;
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
      <TopNav />
      <div className="shell">
        <section className="split auth-split fade-up">
          <div className="auth-header">
            <h1 className="hero-title">{t("auth.resetPasswordTitle")}</h1>
            <p className="hero-subtitle">{t("auth.resetPasswordSubtitle")}</p>
          </div>
          <form
            className="form-card form-grid auth-form"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <div>
              <div className="label">{t("auth.newPassword")}</div>
              <input
                className="input"
                type="password"
                autoComplete="new-password"
                required
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
                autoComplete="new-password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
            {done ? (
              <p style={{ color: "var(--accent)" }}>{t("auth.passwordResetSuccess")}</p>
            ) : (
              <button className="btn primary" type="submit" disabled={loading}>
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
