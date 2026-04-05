"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TopNav from "../components/TopNav";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.detail || "Registration failed");
      }
      const data = await response.json();
      localStorage.setItem("auth_token", data.access_token);
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
            <h1 className="hero-title">Create your workspace.</h1>
            <p className="hero-subtitle">
              One account, all your job-specific CV versions in one place.
            </p>
            <div className="steps">
              <div className="step">
                <span>1</span>
                <h3>Set up profile</h3>
                <p>Use your name and target role to personalize outputs.</p>
              </div>
              <div className="step">
                <span>2</span>
                <h3>Upload your CV</h3>
                <p>We will store and version it for every job.</p>
              </div>
            </div>
          </div>
          <form className="form-card form-grid">
            <div>
              <div className="label">Full name</div>
              <input
                className="input"
                placeholder="Alex Morgan"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
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
                placeholder="Create a secure password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {error && <p style={{ color: "#b42318" }}>{error}</p>}
            <button className="btn secondary" type="button" onClick={submit}>
              {loading ? "Creating..." : "Create account"}
            </button>
            <Link className="btn ghost" href="/login">
              I already have an account
            </Link>
          </form>
        </section>
      </div>
    </main>
  );
}
