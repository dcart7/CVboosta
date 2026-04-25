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
    AppleID?: {
      auth?: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
        }) => void;
        signIn: () => Promise<{
          authorization?: { id_token?: string };
          user?: { name?: { firstName?: string; lastName?: string } };
        }>;
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
  const [appleReady, setAppleReady] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<"google" | "apple" | null>(null);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
  const appleClientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "";
  const appleRedirectUri =
    process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || (typeof window !== "undefined" ? `${window.location.origin}/${mode}` : "");
  const hasGoogle = Boolean(googleClientId);
  const hasApple = Boolean(appleClientId);
  const hasAnyProvider = hasGoogle || hasApple;

  const labels = useMemo(
    () => {
      const map = {
        en: { or: "Or continue with", apple: "Continue with Apple", loading: "Please wait..." },
        uk: { or: "Або продовжити через", apple: "Продовжити через Apple", loading: "Зачекайте..." },
        pl: { or: "Lub kontynuuj przez", apple: "Kontynuuj przez Apple", loading: "Proszę czekać..." },
        sk: { or: "Alebo pokračovať cez", apple: "Pokračovať cez Apple", loading: "Počkajte..." },
        cs: { or: "Nebo pokračovat přes", apple: "Pokračovat přes Apple", loading: "Počkejte..." },
        es: { or: "O continuar con", apple: "Continuar con Apple", loading: "Espera..." },
      } as const;
      return map[language] || map.en;
    },
    [language],
  );

  const finishOAuth = async (provider: "google" | "apple", idToken: string, fullName?: string) => {
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

  const handleAppleSignIn = async () => {
    if (!window.AppleID?.auth || !appleClientId) return;
    setLoadingProvider("apple");
    try {
      const result = await window.AppleID.auth.signIn();
      const idToken = result?.authorization?.id_token;
      if (!idToken) throw new Error("Apple token is missing");
      const firstName = result?.user?.name?.firstName || "";
      const lastName = result?.user?.name?.lastName || "";
      const fullName = `${firstName} ${lastName}`.trim();
      await finishOAuth("apple", idToken, fullName || undefined);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Apple sign in failed";
      onError(message);
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
  }, [googleReady, hasGoogle, mode, onError]);

  useEffect(() => {
    if (!appleReady || !hasApple || !appleRedirectUri || !window.AppleID?.auth) return;
    window.AppleID.auth.init({
      clientId: appleClientId,
      scope: "name email",
      redirectURI: appleRedirectUri,
      usePopup: true,
    });
  }, [appleReady, hasApple, appleClientId, appleRedirectUri]);

  if (!hasAnyProvider) {
    return null;
  }

  return (
    <div className="social-auth-wrap">
      {hasGoogle && (
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
          onLoad={() => setGoogleReady(true)}
        />
      )}
      {hasApple && (
        <Script
          src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
          strategy="afterInteractive"
          onLoad={() => setAppleReady(true)}
        />
      )}

      <div className="social-auth-divider">{labels.or}</div>
      <div className="social-auth-grid">
        {hasGoogle && <div className="social-google-slot" ref={googleBtnRef} />}
        {hasApple && (
          <button
            type="button"
            className="btn ghost social-apple-btn"
            onClick={() => void handleAppleSignIn()}
            disabled={disabled || loadingProvider !== null}
          >
            {loadingProvider === "apple" ? labels.loading : labels.apple}
          </button>
        )}
      </div>
    </div>
  );
}
