import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { AdminLanguageProvider, useAdminLanguage } from "@/components/admin/AdminLanguageContext";

describe("AdminLanguageContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AdminLanguageProvider>{children}</AdminLanguageProvider>
  );

  it("defaults to English ('en') dictionary", () => {
    const { result } = renderHook(() => useAdminLanguage(), { wrapper });
    expect(result.current.language).toBe("en");
    expect(result.current.t.consoleTitle).toBe("Admin Console");
    expect(result.current.t.orderLedger).toBe("Order Ledger");
  });

  it("switches to Turkish ('tr') and updates dictionary strings", () => {
    const { result } = renderHook(() => useAdminLanguage(), { wrapper });

    act(() => {
      result.current.setLanguage("tr");
    });

    expect(result.current.language).toBe("tr");
    expect(result.current.t.consoleTitle).toBe("Yönetici Konsolu");
    expect(result.current.t.orderLedger).toBe("Sipariş Defteri");
    expect(localStorage.getItem("satriano-admin-lang")).toBe("tr");
  });
});
