"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    // 1. Service Worker Registration
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("Service Worker registered successfully:", reg.scope);
          })
          .catch((err) => {
            console.error("Service Worker registration failed:", err);
          });
      });
    }

    // 2. Dynamic System prefers-color-scheme listener
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleSystemThemeChange(e: MediaQueryListEvent | MediaQueryList) {
      try {
        const storedTheme = localStorage.getItem("satriano-theme");
        const pathname = window.location.pathname;

        // Skip admin route theme changes
        if (pathname.startsWith("/admin")) return;

        // Only auto-update theme if user has NOT set a manual preference in localStorage
        if (!storedTheme) {
          const newTheme = pathname.startsWith("/portal")
            ? "dark"
            : e.matches
            ? "dark"
            : "light";

          document.documentElement.setAttribute("data-theme", newTheme);

          // Update theme-color meta tag dynamically
          const themeMeta = document.querySelector('meta[name="theme-color"]');
          if (themeMeta) {
            themeMeta.setAttribute(
              "content",
              newTheme === "dark" ? "#0B1E3D" : "#F5F7FA"
            );
          }
        }
      } catch (err) {
        console.error("Theme system sync error:", err);
      }
    }

    // Attach listener for real-time system dark/light preference shifts
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  return null;
}
