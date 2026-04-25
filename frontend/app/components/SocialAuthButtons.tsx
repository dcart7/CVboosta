"use client";

import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import { getApiBase } from "../lib/apiBase";
import { fetchWithRetry } from "../lib/fetchRetry";
import { useTranslation } from "../lib/LanguageContext";

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
            ux_mode?: "popup" | "redirect";
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | number | boolean>,
          ) => void;
        };
      };
    };
  }
}

type Props = {
  mode: "login" | "register";
  onSuccess: (data: { access_token: string; email?: string }) => void;
  onError: (message: string) => void;
  disabled?: boolean;
};

function parseOAuthError(payload: unknown): string {
  if (payload && typeof payload === "object" && "detail" in payload) {
    const detail = (payload as { detail?: unknown }).detail;
    if (typeof detail === "string") return detail;
  }
  return "Social login failed";
}

export default function SocialAuthButtons({
  mode,
  onSuccess,
  onError,
  disabled = false,
}: Props) {
  const { language } = useTranslation();
  const apiBase = getApiBase();
  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"google" | null>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const hasGoogle = Boolean(googleClientId);

  const labels = useMemo(
    () => {
      const map = {
        en: { or: "Or continue with" },
        uk: { or: "Або продовжити через" },
        pl: { or: "Lub kontynuuj przez" },
        sk: { or: "Alebo pokračovať cez" },
        cs: { or: "Nebo pokračovat přes" },
        es: { or: "O continuar con" },
      } as const;
      return map[language] || map.en;
    },
    [language],
  );

  const finishOAuth = async (provider: "google", idToken: string, fullName?: string) => {
    setLoadingProvider(provider);
    try {
      const response = await fetchWithRetry(
        `${apiBase}/auth/oauth/${provider}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_token: idToken, full_name: fullName || null }),
        },
        { attempts: 3, baseDelayMs: 300, timeoutMs: 20_000 },
      );
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(parseOAuthError(payload));
      }
      onSuccess(payload as { access_token: string; email?: string });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Social login failed";
      onError(msg);
    } finally {
      setLoadingProvider(null);
    }
  };

  useEffect(() => {
    if (!googleReady || !hasGoogle || !googleBtnRef.current || !window.google?.accounts?.id) {
      return;
    }

    const parent = googleBtnRef.current;
    parent.innerHTML = "";
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response) => {
        if (disabled || loadingProvider) {
          return;
        }
        const token = response?.credential || "";
        if (!token) {
          onError("Google token is missing");
          return;
        }
        void finishOAuth("google", token);
      },
      ux_mode: "popup",
    });
    window.google.accounts.id.renderButton(parent, {
      theme: "outline",
      size: "large",
      shape: "pill",
      width: Math.max(240, Math.floor(parent.getBoundingClientRect().width || 320)),
      text: mode === "login" ? "signin_with" : "signup_with",
      logo_alignment: "left",
    });
  }, [googleReady, hasGoogle, mode, onError, disabled, loadingProvider, googleClientId]);

  if (!hasGoogle) {
    return null;
  }

  return (
    <div className="social-auth-wrap">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGoogleReady(true)}
      />

      <div className="social-auth-divider">{labels.or}</div>
      <div className="social-auth-grid">
        <div className="social-google-slot" ref={googleBtnRef} />
      </div>
    </div>
  );
}
