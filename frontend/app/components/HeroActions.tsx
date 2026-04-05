"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeroActions() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setIsAuthed(Boolean(localStorage.getItem("auth_token")));
  }, []);

  return (
    <div className="nav-actions">
      <Link className="btn primary" href="/app">
        Start with a CV
      </Link>
      {!isAuthed && (
        <Link className="btn secondary" href="/register">
          Create account
        </Link>
      )}
    </div>
  );
}
