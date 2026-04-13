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
  const apiBase = getApiBase();

  const submit = async () => {
    setError("");
    
    // Password security validation
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 10;

    if (!isLongEnough || !hasNumber || !hasSymbol) {
      setError("Password is too weak. Must be at least 10 characters and include a number and a symbol.");
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
        <section className="split fade-up">
          <div>
            <h1 className="hero-title">{t("auth.createWorkspace")}</h1>
            <p className="hero-subtitle">
              {t("auth.registerSubtitle")}
            </p>
            <div className="steps">
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
          </div>
          <form className="form-card form-grid">
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
              <input
                className="input"
                placeholder={t("auth.passwordPlaceholder")}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {error && <p style={{ color: "#b42318" }}>{error}</p>}
            <button className="btn secondary" type="button" onClick={submit}>
              {loading ? t("auth.creating") : t("auth.createBtn")}
            </button>
            <Link className="btn ghost" href="/login">
              {t("auth.alreadyHaveAccount")}
            </Link>
          </form>
        </section>
      </div>
    </main>
  );
}
