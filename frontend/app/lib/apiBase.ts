export function getApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE;
  if (configured && configured.trim()) {
    return configured.trim();
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const safeHost = hostname === "localhost" ? "127.0.0.1" : hostname;
    return `http://${safeHost}:8000`;
  }

  return "http://127.0.0.1:8000";
}

