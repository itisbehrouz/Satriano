"use client";

import React, { useEffect, useRef } from "react";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  className?: string;
  theme?: "light" | "dark" | "auto";
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: (error: string) => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onTurnstileLoaded?: () => void;
  }
}

export function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  className = "",
  theme = "dark",
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Official Cloudflare Turnstile Site Key or Test Key (Always Pass)
    const siteKey =
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

    let isMounted = true;

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore cleanup errors
        }
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        callback: (token: string) => {
          if (isMounted) onVerify(token);
        },
        "error-callback": (err: string) => {
          if (isMounted && onError) onError(err);
        },
        "expired-callback": () => {
          if (isMounted && onExpire) onExpire();
        },
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      // Check if script element already exists in document
      let script = document.querySelector<HTMLScriptElement>(
        'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
      );

      if (!script) {
        script = document.createElement("script");
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoaded&render=explicit";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      window.onTurnstileLoaded = () => {
        renderWidget();
      };
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
      }
    };
  }, [onVerify, onError, onExpire, theme]);

  return (
    <div
      ref={containerRef}
      className={`my-3 min-h-[65px] flex items-center justify-center ${className}`}
    />
  );
}
