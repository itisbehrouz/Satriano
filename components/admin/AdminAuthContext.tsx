"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface AdminAuthContextValue {
  isAuthenticated: boolean | null;
  setAuthenticated: (value: boolean) => void;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const res = await fetch("/api/admin/session");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setIsAuthenticated(!!data.authenticated);
          return;
        }
      } catch {
        // Session check failed
      }
      if (!cancelled) setIsAuthenticated(false);
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const setAuthenticated = useCallback((value: boolean) => {
    setIsAuthenticated(value);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Sign-out request failed
    }
    setIsAuthenticated(false);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, setAuthenticated, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
