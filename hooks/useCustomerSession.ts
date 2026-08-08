"use client";

import { useState, useEffect, useCallback } from "react";

export interface CustomerSession {
  authenticated: boolean;
  email?: string;
  companyName?: string;
  createdAt?: string;
  accountStatus?: string;
}

export function useCustomerSession() {
  const [session, setSession] = useState<CustomerSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/customer/session");
      if (res.ok) {
        const data = await res.json();
        setSession(data.authenticated ? data : { authenticated: false });
      } else {
        setSession({ authenticated: false });
      }
    } catch {
      setSession({ authenticated: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/customer/session")
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data) => {
        if (active) {
          setSession(data.authenticated ? data : { authenticated: false });
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setSession({ authenticated: false });
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return { session, loading, refetch: fetchSession };
}
