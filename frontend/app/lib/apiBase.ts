export function getApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE;
  if (configured && configured.trim()) {
    return configured.trim();
  }

  if (typeof window !== "undefined") {
    // Same hostname as the UI (localhost vs 127.0.0.1) to avoid flaky cross-host requests.
    const hostname = window.location.hostname;
    return `http://${hostname}:8000`;
  }

  return "http://127.0.0.1:8000";
}

