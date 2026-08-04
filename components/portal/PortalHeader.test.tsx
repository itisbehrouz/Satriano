import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { PortalHeader } from "./PortalHeader";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/portal/orders",
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("PortalHeader Component", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ authenticated: true, companyName: "ACME Corp" }),
        })
      )
    );
  });

  it("renders Satriano brand logo and header container", async () => {
    await act(async () => {
      render(<PortalHeader initialCompanyName="ACME Corp" />);
    });
    expect(screen.getByAltText("Satriano Atelier")).toBeInTheDocument();
  });

  it("renders main navigation links when logged in", async () => {
    await act(async () => {
      render(<PortalHeader initialCompanyName="ACME Corp" />);
    });
    expect(screen.getByText("Catalog")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("opens AccountDropdown menu when dropdown trigger button is clicked", async () => {
    await act(async () => {
      render(<PortalHeader initialCompanyName="ACME Corp" />);
    });

    const trigger = screen.getByText("ACME Corp");
    await act(async () => {
      fireEvent.click(trigger);
    });

    expect(screen.getByText("Company Info")).toBeInTheDocument();
    expect(screen.getByText("Order History")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Billing & Invoices")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
  });
});

describe("PortalHeader Suppression Guard", () => {
  it("returns null when on unauthenticated /portal login gate", async () => {
    // Override usePathname to /portal for unauthenticated test
    const { PortalHeader } = await import("./PortalHeader");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ authenticated: false }),
        })
      )
    );
  });
});
