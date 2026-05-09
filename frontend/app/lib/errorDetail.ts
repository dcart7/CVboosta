export const errorDetailToMessage = (detail: unknown): string => {
  if (typeof detail === "string") return detail;
  if (!detail) return "";

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "msg" in item) {
          const msg = (item as any).msg;
          if (typeof msg === "string") return msg;
        }
        return "";
      })
      .filter(Boolean);
    if (messages.length) return messages.slice(0, 2).join("; ");
    try {
      return JSON.stringify(detail);
    } catch {
      return String(detail);
    }
  }

  if (detail && typeof detail === "object") {
    for (const key of ["message", "error", "detail"] as const) {
      if (key in (detail as any) && typeof (detail as any)[key] === "string") {
        return (detail as any)[key];
      }
    }
    try {
      return JSON.stringify(detail);
    } catch {
      return String(detail);
    }
  }

  return String(detail);
};

