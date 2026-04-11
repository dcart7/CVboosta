"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TopNav from "../components/TopNav";
import { getApiBase } from "../lib/apiBase";
import { fetchWithRetry } from "../lib/fetchRetry";
import { useTranslation } from "../lib/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const apiBase = getApiBase();

  const submit = async () => {
    setError("");
    setLoading(true);
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
        throw new Error(payload.detail || "Login failed");
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
      setError(network ? t("auth.networkError") : msg || t("auth.loginFailed"));
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
            <h1 className="hero-title">{t("auth.welcomeBack")}</h1>
            <p className="hero-subtitle">
              {t("auth.loginSubtitle")}
            </p>
            <div className="card">
              <h3>{t("auth.whatsNew")}</h3>
              <p>{t("auth.whatsNewDesc")}</p>
            </div>
          </div>
          <form className="form-card form-grid">
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
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {error && <p style={{ color: "#b42318" }}>{error}</p>}
            <button className="btn primary" type="button" onClick={submit}>
              {loading ? t("auth.signingIn") : t("auth.logIn")}
            </button>
            <Link className="btn ghost" href="/register">
              {t("auth.createAccount")}
            </Link>
          </form>
        </section>
      </div>
    </main>
  );
}
