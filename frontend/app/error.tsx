"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary:", error);
  }, [error]);

  return (
    <main className="page">
      <div className="shell" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
        <div className="fade-up" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "64px", marginBottom: "24px" }}>⚠️</div>
          <h2 style={{ fontSize: "24px", color: "var(--ink)", marginBottom: "16px" }}>
            Something went wrong
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: "32px", maxWidth: "450px", margin: "0 auto 32px" }}>
            An unexpected error occurred. We've been notified and are looking into it.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button className="btn primary" onClick={() => reset()}>
              Try again
            </button>
            <a href="/" className="btn ghost">
              Home
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
