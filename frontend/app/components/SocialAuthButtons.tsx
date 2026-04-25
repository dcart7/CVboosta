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
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
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
  const tokenClientRef = useRef<{ requestAccessToken: (options?: { prompt?: string }) => void } | null>(null);
  const pendingClickRef = useRef(false);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const hasGoogle = Boolean(googleClientId);

  const labels = useMemo(
    () => {
      const map = {
        en: { or: "Or continue with", unavailable: "Google sign-in failed. Please try again." },
        uk: { or: "Або продовжити через", unavailable: "Не вдалося увійти через Google. Спробуйте ще раз." },
        pl: { or: "Lub kontynuuj przez", unavailable: "Logowanie przez Google nie powiodło się. Spróbuj ponownie." },
        sk: { or: "Alebo pokračovať cez", unavailable: "Prihlásenie cez Google zlyhalo. Skúste to znova." },
        cs: { or: "Nebo pokračovat přes", unavailable: "Přihlášení přes Google selhalo. Zkuste to znovu." },
        es: { or: "O continuar con", unavailable: "El inicio de sesión con Google falló. Inténtalo de nuevo." },
      } as const;
      return map[language] || map.en;
    },
    [language],
  );

  const finishOAuth = async (
    provider: "google",
    options: { idToken?: string; accessToken?: string; fullName?: string },
  ) => {
    setLoadingProvider(provider);
    try {
      const response = await fetchWithRetry(
        `${apiBase}/auth/oauth/${provider}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_token: options.idToken || null,
            access_token: options.accessToken || null,
            full_name: options.fullName || null,
          }),
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
    if (!googleReady || !hasGoogle || !window.google?.accounts?.oauth2?.initTokenClient) {
      return;
    }
    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: googleClientId,
      callback: (response) => {
        if (!pendingClickRef.current || disabled) {
          return;
        }
        pendingClickRef.current = false;
        const token = response?.access_token || "";
        if (!token) {
          setLoadingProvider(null);
          onError(labels.unavailable);
          return;
        }
        void finishOAuth("google", { accessToken: token });
      },
      scope: "openid email profile",
    });
  }, [googleReady, hasGoogle, onError, disabled, googleClientId, labels.unavailable]);

  const handleGoogleClick = () => {
    if (!hasGoogle || disabled || loadingProvider || !tokenClientRef.current) {
      return;
    }
    setLoadingProvider("google");
    pendingClickRef.current = true;
    try {
      tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
    } catch {
      pendingClickRef.current = false;
      setLoadingProvider(null);
      onError(labels.unavailable);
    }
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
