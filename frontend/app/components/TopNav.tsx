"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getApiBase } from "../lib/apiBase";
import ThemeToggle from "./ThemeToggle";

export default function TopNav() {
  const [email, setEmail] = useState<string | null>(null);
  const apiBase = getApiBase();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setEmail(null);
      return;
    }
    fetch(`${apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.email) {
          setEmail(data.email);
        } else {
          setEmail(null);
        }
      })
      .catch(() => setEmail(null));
  }, [apiBase]);

  const logout = () => {
    localStorage.removeItem("auth_token");
    setEmail(null);
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link className="brand" href="/">
          <span className="brand-mark">CV</span>
          <span>Smart CV Optimizer</span>
        </Link>
        <nav className="nav-links">
          <Link href="/app">Dashboard</Link>
          <Link href="/results">Results</Link>
          <Link href="/history">History</Link>
          <Link href="/about">About</Link>
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          {email ? (
            <>
              <Link className="btn ghost" href="/account">
                {email}
              </Link>
              <button className="btn" onClick={logout} type="button">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="btn ghost" href="/login">
                Log in
              </Link>
              <Link className="btn primary" href="/register">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
