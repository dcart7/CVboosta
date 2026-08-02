"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import SocialAuthButtons from "../components/SocialAuthButtons";
import { getApiBase } from "../lib/apiBase";
import { trackEvent } from "../lib/analytics";
import { fetchWithRetry } from "../lib/fetchRetry";
import {
  authHref,
  nextDestinationFromSearch,
} from "../lib/funnelIntent";
import { useTranslation } from "../lib/LanguageContext";

function extractErrorMessage(payload: unknown): string {
  if (typeof payload === "string") {
    return payload;
  }
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const obj = payload as { detail?: unknown; message?: unknown };
  if (typeof obj.detail === "string") {
    return obj.detail;
  }
  if (Array.isArray(obj.detail)) {
    const firstWithMsg = obj.detail.find(
      (item) =>
        item &&
        typeof item === "object" &&
        "msg" in item &&
        typeof (item as { msg?: unknown }).msg === "string",
    ) as { msg?: string } | undefined;
    if (firstWithMsg?.msg) {
      return firstWithMsg.msg;
    }
  }
  if (obj.detail && typeof obj.detail === "object") {
    const nestedMessage = (obj.detail as { message?: unknown }).message;
    if (typeof nestedMessage === "string") {
      return nestedMessage;
    }
  }
  if (typeof obj.message === "string") {
    return obj.message;
  }
  return "";
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [nextDestination, setNextDestination] = useState("/account");
  const apiBase = getApiBase();

  useEffect(() => {
    setNextDestination(nextDestinationFromSearch("/account"));
  }, []);

  const submit = async () => {
    setError("");
    setLoading(true);
    trackEvent("cta_click", {
      cta_name: "auth_submit",
      method: "email",
      source: nextDestination.startsWith("/pricing")
        ? "checkout"
        : nextDestination.startsWith("/app")
          ? "optimization"
          : "direct",
    });
    try {
      const response = await fetchWithRetry(
        `${apiBase}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
        { attempts: 5, baseDelayMs: 400, timeoutMs: 25_000 },
      );
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(extractErrorMessage(payload) || "Login failed");
      }
      await response.json();
      trackEvent("login", { method: "email" });
      window.dispatchEvent(new Event("auth-change"));
      router.replace(nextDestination);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const network =
        err instanceof TypeError ||
        (err instanceof Error && err.name === "AbortError") ||
        /failed to fetch|load failed|networkerror/i.test(msg);
      const invalidCredentials = /invalid (email|password|credentials)|incorrect password/i.test(
        msg.toLowerCase(),
      );
      setError(
        network
          ? t("auth.networkError")
          : invalidCredentials
            ? t("auth.invalidCredentials")
            : msg || t("auth.loginFailed"),
      );
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
            <h1 className="hero-title">{t("auth.welcomeBack")}</h1>
            <p className="hero-subtitle">
              {t("auth.loginSubtitle")}
            </p>
          </div>
          <form
            className="form-card form-grid auth-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!loading) void submit();
            }}
          >
            <div>
              <div className="label">{t("auth.email")}</div>
              <input
                className="input"
                type="email"
                autoComplete="email"
                required
                placeholder="you@domain.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <div className="label">{t("auth.password")}</div>
              <div className="password-field">
                <input
                  className="input password-input"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  className="password-toggle"
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div style={{ marginTop: 8 }}>
                <Link href="/forgot-password" style={{ fontSize: 13, color: "var(--accent)" }}>
                  {t("auth.forgotPassword")}
                </Link>
              </div>
            </div>
            {error && <p style={{ color: "#b42318" }}>{error}</p>}
            <SocialAuthButtons
              mode="login"
              disabled={loading}
              onError={(message) => setError(message || t("auth.loginFailed"))}
              onSuccess={() => {
                trackEvent("login", { method: "oauth" });
                window.dispatchEvent(new Event("auth-change"));
                router.replace(nextDestination);
              }}
            />
            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? t("auth.signingIn") : t("auth.logIn")}
            </button>
            <Link
              className="btn ghost"
              href={authHref("/register", nextDestination)}
            >
              {t("auth.createAccount")}
            </Link>
          </form>
          
          <div className="card auth-footer-card">
            <h3>{t("auth.whatsNew")}</h3>
            <ul style={{ margin: "10px 0 0", paddingLeft: "18px", color: "var(--muted)", lineHeight: 1.7 }}>
              <li>{t("auth.whatsNewBullet1")}</li>
              <li>{t("auth.whatsNewBullet2")}</li>
              <li>{t("auth.whatsNewBullet3")}</li>
              <li>{t("auth.whatsNewBullet4")}</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
