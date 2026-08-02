"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import TopNav from "../components/TopNav";
import SocialAuthButtons from "../components/SocialAuthButtons";
import { getApiBase } from "../lib/apiBase";
import { trackEvent } from "../lib/analytics";
import { errorDetailToMessage } from "../lib/errorDetail";
import { fetchWithRetry } from "../lib/fetchRetry";
import {
  authHref,
  createIdempotencyKey,
  nextDestinationFromSearch,
} from "../lib/funnelIntent";
import { useTranslation } from "../lib/LanguageContext";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [nextDestination, setNextDestination] = useState("/account");
  const registrationInFlightRef = useRef(false);
  const registrationAttemptRef = useRef<{
    requestBody: string;
    idempotencyKey: string;
  } | null>(null);
  const apiBase = getApiBase();

  useEffect(() => {
    setNextDestination(nextDestinationFromSearch("/account"));
  }, []);

  const submit = async () => {
    if (registrationInFlightRef.current) return;
    setError("");
    
    // Password security validation
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 10;

    if (!isLongEnough || !hasNumber || !hasSymbol) {
      setError(t("auth.passwordWeak"));
      return;
    }

    registrationInFlightRef.current = true;
    setLoading(true);
    const requestBody = JSON.stringify({ email, password, full_name: name });
    const previousAttempt = registrationAttemptRef.current;
    const idempotencyKey =
      previousAttempt?.requestBody === requestBody
        ? previousAttempt.idempotencyKey
        : createIdempotencyKey("register");
    registrationAttemptRef.current = { requestBody, idempotencyKey };
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
        `${apiBase}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: requestBody,
        },
        { attempts: 5, baseDelayMs: 400, timeoutMs: 25_000 },
      );
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = errorDetailToMessage(payload.detail);
        const failure = new Error(message || "Registration failed") as Error & {
          status?: number;
        };
        failure.status = response.status;
        throw failure;
      }
      await response.json();
      registrationAttemptRef.current = null;
      trackEvent("sign_up", { method: "email" });
      window.dispatchEvent(new Event("auth-change"));
      router.replace(nextDestination);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const network =
        err instanceof TypeError ||
        (err instanceof Error && err.name === "AbortError") ||
        /failed to fetch|load failed|networkerror/i.test(msg);
      const status =
        err && typeof err === "object" && "status" in err
          ? Number((err as { status?: unknown }).status)
          : null;
      const ambiguous =
        network ||
        status === null ||
        status === 408 ||
        status === 409 ||
        status === 425 ||
        status === 429 ||
        status >= 500;
      if (!ambiguous) registrationAttemptRef.current = null;
      setError(
        network ? t("auth.networkError") : msg || t("auth.registerFailed"),
      );
    } finally {
      registrationInFlightRef.current = false;
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <TopNav />
      <div className="shell">
        <section className="split auth-split register-layout fade-up">
          <div className="auth-header">
            <h1 className="hero-title">{t("auth.createWorkspace")}</h1>
            <p className="hero-subtitle">
              {t("auth.registerSubtitle")}
            </p>
          </div>
          <form
            className="form-card form-grid auth-form register-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!loading) void submit();
            }}
          >
            <div>
              <div className="label">{t("auth.fullName")}</div>
              <input
                className="input"
                autoComplete="name"
                required
                placeholder={t("auth.fullNamePlaceholder")}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
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
                  placeholder={t("auth.passwordPlaceholder")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
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
              <ul className="password-rules" aria-label="Password requirements">
                <li>{t("auth.passwordRuleLen")}</li>
                <li>{t("auth.passwordRuleNumber")}</li>
                <li>{t("auth.passwordRuleSymbol")}</li>
              </ul>
            </div>
            {error && <p style={{ color: "#b42318" }}>{error}</p>}
            <SocialAuthButtons
              mode="register"
              disabled={loading}
              onError={(message) =>
                setError(
                  typeof message === "string"
                    ? message
                    : t("auth.registerFailed"),
                )
              }
              onSuccess={() => {
                trackEvent("sign_up", { method: "oauth" });
                window.dispatchEvent(new Event("auth-change"));
                router.replace(nextDestination);
              }}
            />
            <button className="btn secondary" type="submit" disabled={loading}>
              {loading ? t("auth.creating") : t("auth.createBtn")}
            </button>
            <Link
              className="btn ghost"
              href={authHref("/login", nextDestination)}
            >
              {t("auth.alreadyHaveAccount")}
            </Link>
          </form>

          <div className="steps auth-footer-card register-steps">
            <div className="step">
              <span>1</span>
              <h3>{t("auth.setupProfile")}</h3>
              <p>{t("auth.setupProfileDesc")}</p>
            </div>
            <div className="step">
              <span>2</span>
              <h3>{t("auth.uploadCv")}</h3>
              <p>{t("auth.uploadCvDesc")}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
