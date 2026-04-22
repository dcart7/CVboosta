import { Suspense } from "react";
import ShareResultClient from "./ShareResultClient";

export default function ShareResultPage() {
  return (
    <Suspense fallback={<div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spinner"></div></div>}>
      <ShareResultClient />
    </Suspense>
  );
}
