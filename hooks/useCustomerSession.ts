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
        if (data.authenticated) {
          setSession(data);
        } else {
          setSession({ authenticated: false });
        }
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
    fetchSession();
  }, [fetchSession]);

  return { session, loading, refetch: fetchSession };
}
