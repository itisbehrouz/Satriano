import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import AccountPage from "@/app/portal/account/page";

const mockPush = vi.fn();
let mockTabParam = "company";

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (param: string) => (param === "tab" ? mockTabParam : null),
  }),
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}));

describe("Account Page & Tabs", () => {
  beforeEach(() => {
    mockTabParam = "company";
    mockPush.mockReset();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            authenticated: true,
            email: "procurement@apex.com",
            companyName: "Apex Retail Group",
          }),
      })
    );
  });

  it("renders company info tab by default", async () => {
    await act(async () => {
      render(<AccountPage />);
    });

    expect(screen.getAllByText("Apex Retail Group")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Company Information")[0]).toBeInTheDocument();
    expect(screen.getByText("procurement@apex.com")).toBeInTheDocument();
  });

  it("renders settings tab when tab=settings searchParam is active", async () => {
    mockTabParam = "settings";
    await act(async () => {
      render(<AccountPage />);
    });

    expect(screen.getByText("Account Preferences & Security")).toBeInTheDocument();
    expect(screen.getByText("Email Notifications")).toBeInTheDocument();
    expect(screen.getByText("Proforma Auto-Download")).toBeInTheDocument();
  });

  it("renders billing tab when tab=billing searchParam is active", async () => {
    mockTabParam = "billing";
    await act(async () => {
      render(<AccountPage />);
    });

    expect(screen.getByText("Billing & Tax Documents")).toBeInTheDocument();
    expect(screen.getByText("Corporate Billing Address")).toBeInTheDocument();
    expect(screen.getByText("INV-2026-001")).toBeInTheDocument();
  });

  it("updates query parameter on tab click", async () => {
    await act(async () => {
      render(<AccountPage />);
    });

    const settingsTabBtn = screen.getByText("Account Settings");
    fireEvent.click(settingsTabBtn);

    expect(mockPush).toHaveBeenCalledWith("/portal/account?tab=settings", {
      scroll: false,
    });
  });
});
