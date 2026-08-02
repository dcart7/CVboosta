"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep the root fallback dependency-free so it still renders when the
    // application shell, translations, or analytics fail to initialize.
    console.error("Root application error", {
      digest: error.digest,
      name: error.name,
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f7f8fc",
          color: "#111827",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <main
          style={{
            width: "min(520px, calc(100% - 32px))",
            padding: "32px",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            background: "#ffffff",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          <h1 style={{ margin: "0 0 12px", fontSize: "28px" }}>
            CVboosta is temporarily unavailable
          </h1>
          <p style={{ margin: "0 0 24px", color: "#4b5563", lineHeight: 1.6 }}>
            Your browser data has not been deleted. Try restoring this page, or
            return to the home page.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                border: 0,
                borderRadius: "10px",
                padding: "12px 18px",
                background: "#111827",
                color: "#ffffff",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                padding: "11px 18px",
                color: "#111827",
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              Home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
