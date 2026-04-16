"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TopNav from "../components/TopNav";
import { getApiBase } from "../lib/apiBase";
import { fetchWithRetry } from "../lib/fetchRetry";
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
  const apiBase = getApiBase();

  const submit = async () => {
    setError("");
    
    // Password security validation
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
        `${apiBase}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, full_name: name }),
        },
        { attempts: 5, baseDelayMs: 400, timeoutMs: 25_000 },
      );
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || "Registration failed");
      }
      const data = await response.json();
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("user_email", email.trim().toLowerCase());
      window.dispatchEvent(new Event("auth-change"));
      router.push("/account");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      const network =
        err instanceof TypeError ||
        (err instanceof Error && err.name === "AbortError") ||
        /failed to fetch|load failed|networkerror/i.test(msg);
      setError(
        network ? t("auth.networkError") : msg || t("auth.registerFailed"),
      );
    } finally {
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
          <form className="form-card form-grid auth-form register-form">
            <div>
              <div className="label">{t("auth.fullName")}</div>
              <input
                className="input"
                placeholder={t("auth.fullNamePlaceholder")}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div>
              <div className="label">{t("auth.email")}</div>
              <input
                className="input"
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
            <button className="btn secondary" type="button" onClick={submit}>
              {loading ? t("auth.creating") : t("auth.createBtn")}
            </button>
            <Link className="btn ghost" href="/login">
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
