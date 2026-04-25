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
            auto_select?: boolean;
          }) => void;
          prompt: (
            momentListener?: (notification: {
              isNotDisplayed?: () => boolean;
              isSkippedMoment?: () => boolean;
              isDismissedMoment?: () => boolean;
            }) => void,
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
  const [googleReady, setGoogleReady] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"google" | null>(null);
  const googleInitialized = useRef(false);
  const promptInFlight = useRef(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const hasGoogle = Boolean(googleClientId);

  const labels = useMemo(
    () => {
      const map = {
        en: { or: "Or continue with", unavailable: "Google sign-in is not available right now" },
        uk: { or: "Або продовжити через", unavailable: "Вхід через Google зараз недоступний" },
        pl: { or: "Lub kontynuuj przez", unavailable: "Logowanie przez Google jest teraz niedostępne" },
        sk: { or: "Alebo pokračovať cez", unavailable: "Prihlásenie cez Google je teraz nedostupné" },
        cs: { or: "Nebo pokračovat přes", unavailable: "Přihlášení přes Google je teď nedostupné" },
        es: { or: "O continuar con", unavailable: "El inicio de sesión con Google no está disponible ahora" },
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
    if (!googleReady || !hasGoogle || !window.google?.accounts?.id) {
      return;
    }
    if (googleInitialized.current) {
      return;
    }
    googleInitialized.current = true;
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      auto_select: false,
      callback: (response) => {
        if (!promptInFlight.current || disabled) {
          return;
        }
        promptInFlight.current = false;
        const token = response?.credential || "";
        if (!token) {
          setLoadingProvider(null);
          onError("Google token is missing");
          return;
        }
        void finishOAuth("google", token);
      },
      ux_mode: "popup",
    });
  }, [googleReady, hasGoogle, onError, disabled, googleClientId]);

  const handleGoogleClick = () => {
    if (!hasGoogle || disabled || loadingProvider || !window.google?.accounts?.id) {
      return;
    }
    setLoadingProvider("google");
    promptInFlight.current = true;
    window.google.accounts.id.prompt((notification) => {
      if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.() || notification?.isDismissedMoment?.()) {
        if (promptInFlight.current) {
          promptInFlight.current = false;
          setLoadingProvider(null);
          onError(labels.unavailable);
        }
      }
    });
  };

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
        <button
          type="button"
          className="social-google-btn"
          disabled={disabled || loadingProvider !== null}
          onClick={handleGoogleClick}
        >
          {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
        </button>
      </div>
    </div>
  );
}
