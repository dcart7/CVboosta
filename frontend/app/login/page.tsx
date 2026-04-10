"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TopNav from "../components/TopNav";
import { getApiBase } from "../lib/apiBase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const apiBase = getApiBase();

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || "Login failed");
      }
      const data = await response.json();
      localStorage.setItem("auth_token", data.access_token);
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
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
            <h1 className="hero-title">Welcome back.</h1>
            <p className="hero-subtitle">
              Log in to continue your CV projects, drafts, and history.
            </p>
            <div className="card">
              <h3>What&apos;s new</h3>
              <p>
                Faster parsing, clearer recommendations, and organized history
                for every role.
              </p>
            </div>
          </div>
          <form className="form-card form-grid">
            <div>
              <div className="label">Email</div>
              <input
                className="input"
                placeholder="you@domain.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div>
              <div className="label">Password</div>
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
              {loading ? "Signing in..." : "Log in"}
            </button>
            <Link className="btn ghost" href="/register">
              Create a new account
            </Link>
          </form>
        </section>
      </div>
    </main>
  );
}
