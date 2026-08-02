import { ImageResponse } from "next/og";

export const alt = "CVboosta — match your CV to a real job description";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          color: "#f8fafc",
          background:
            "radial-gradient(circle at 80% 20%, #2563eb 0, #111827 38%, #030712 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "#3b82f6",
              fontSize: 36,
              fontWeight: 800,
            }}
          >
            C
          </div>
          <div style={{ fontSize: 34, fontWeight: 700 }}>CVboosta</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 900 }}>
          <div style={{ fontSize: 68, lineHeight: 1.05, fontWeight: 800 }}>
            Match your CV to the job you actually want.
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.35, color: "#cbd5e1" }}>
            Compare a CV with a real vacancy, see the gaps, and review every suggested change.
          </div>
        </div>

        <div style={{ display: "flex", gap: 18, fontSize: 24, color: "#bfdbfe" }}>
          <span>Job match score</span>
          <span>•</span>
          <span>Missing signals</span>
          <span>•</span>
          <span>You approve the final draft</span>
        </div>
      </div>
    ),
    size,
  );
}
