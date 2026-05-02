"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page">
      <div className="shell" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
        <div className="fade-up" style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "120px", fontWeight: "900", margin: "0", background: "linear-gradient(135deg, var(--primary), #8a3ffc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            404
          </h1>
          <h2 style={{ fontSize: "24px", color: "var(--ink)", marginBottom: "16px" }}>
            Page not found
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: "32px", maxWidth: "400px", margin: "0 auto 32px" }}>
            The path you are looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <Link href="/" className="btn primary">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
