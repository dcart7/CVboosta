export function getApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE;
  
  if (configured && configured.trim()) {
    const url = configured.trim();
    // In production client-side, this helps us see if the variable was baked in correctly
    if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
      console.log("DEBUG: Using configured API Base:", url);
    }
    return url;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // For production missing var, /api is a safer relative fallback than localhost
    const fallback = hostname === "localhost" || hostname === "127.0.0.1" 
      ? `http://${hostname}:8000` 
      : "/api"; 
    
    if (hostname !== "localhost") {
      console.warn("WARNING: NEXT_PUBLIC_API_BASE is missing! Falling back to:", fallback);
    }
    return fallback;
  }

  return "http://127.0.0.1:8000";
}

