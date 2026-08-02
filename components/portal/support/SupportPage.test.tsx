import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import SupportPage from "@/app/portal/support/page";

vi.mock("next/navigation", () => ({
  usePathname: () => "/portal/support",
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("Support Page & Components", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("/api/customer/support-ticket")) {
          return Promise.resolve({
            ok: true,
            status: 201,
            json: () =>
              Promise.resolve({
                ticketId: "TCK-999",
                status: "OPEN",
                message: "Support ticket received.",
              }),
          });
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({}),
        });
      })
    );
  });

  it("renders support page header and sections", () => {
    render(<SupportPage />);
    expect(screen.getByText("Customer Support & Technical Helpdesk")).toBeInTheDocument();
    expect(screen.getByText("Direct Communication Channels")).toBeInTheDocument();
    expect(screen.getByText("Submit a Support Ticket")).toBeInTheDocument();
    expect(screen.getByText("FAQ Quick Links & Knowledge Base")).toBeInTheDocument();
  });

  it("renders direct contact links", () => {
    render(<SupportPage />);
    expect(screen.getByText("+90 532 000 0000")).toBeInTheDocument();
    expect(screen.getByText("@SatrianoAtelier")).toBeInTheDocument();
    expect(screen.getByText("support@satriano.com")).toBeInTheDocument();
  });

  it("submits support ticket form successfully", async () => {
    render(<SupportPage />);

    const subjectInput = screen.getByPlaceholderText(/Order #ORD-901/i);
    const messageInput = screen.getByPlaceholderText(/Describe your inquiry/i);
    const submitBtn = screen.getByText("Submit Ticket");

    fireEvent.change(subjectInput, { target: { value: "Test Fabric Question" } });
    fireEvent.change(messageInput, { target: { value: "Can we request swatch samples?" } });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByText("✓ Ticket Created #TCK-999")).toBeInTheDocument();
  });
});
