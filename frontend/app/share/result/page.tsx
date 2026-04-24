import { Suspense } from "react";
import type { Metadata } from "next";
import ShareResultClient from "./ShareResultClient";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ShareResultPage() {
  return (
    <Suspense fallback={<div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spinner"></div></div>}>
      <ShareResultClient />
    </Suspense>
  );
}
