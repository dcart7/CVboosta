export function getApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE;
  
  if (configured && configured.trim()) {
    return configured.trim();
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // For production missing var, /api is a safer relative fallback than localhost
    const fallback = hostname === "localhost" || hostname === "127.0.0.1" 
      ? `http://${hostname}:8000` 
      : "/api"; 
    
    return fallback;
  }

  return "http://127.0.0.1:8000";
}
