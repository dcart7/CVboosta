"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="page" style={{ padding: "2rem", maxWidth: 520, margin: "0 auto" }}>
      <h1 className="hero-title" style={{ fontSize: "1.5rem" }}>
        Something went wrong
      </h1>
      <p className="hero-subtitle" style={{ marginTop: "0.75rem" }}>
        The page hit an unexpected error. You can retry, or go back to the dashboard. If the API was
        starting up, wait a few seconds and try again.
      </p>
      <div className="nav-actions" style={{ marginTop: "1.5rem" }}>
        <button className="btn primary" type="button" onClick={() => reset()}>
          Try again
        </button>
        <Link className="btn ghost" href="/app">
          Dashboard
        </Link>
      </div>
    </main>
  );
}
