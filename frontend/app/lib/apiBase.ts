export function getApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE;

  if (typeof window !== "undefined") {
    const value = configured?.trim();
    // Only relative API bases are allowed in browser code. Absolute upstreams
    // are proxied by Next.js through /api so auth remains in an HttpOnly,
    // same-site cookie and CORS/third-party-cookie behavior cannot break login.
    return value?.startsWith("/") && !value.startsWith("//") ? value : "/api";
  }

  return configured?.trim() || "http://127.0.0.1:8000";
}
