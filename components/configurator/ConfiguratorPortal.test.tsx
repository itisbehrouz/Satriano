import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { GuestLoginModal } from "@/components/configure/GuestLoginModal";
import ConfiguratorSuccessPage from "@/app/configure/success/page";
import GuestConfirmationPage from "@/app/configure/guest-confirmation/page";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/configure",
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams("orderId=ORD-TEST-99&email=guest@company.com"),
}));

describe("Configurator Portal & Guest Flow Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders GuestLoginModal with Option 1 and Option 2", () => {
    const onClose = vi.fn();
    const onSendMagicLink = vi.fn().mockResolvedValue(undefined);
    const onSubmitGuestOrder = vi.fn().mockResolvedValue(undefined);

    render(
      <GuestLoginModal
        isOpen={true}
        onClose={onClose}
        onSendMagicLink={onSendMagicLink}
        onSubmitGuestOrder={onSubmitGuestOrder}
        initialEmail="executive@acme.com"
      />
    );

    expect(screen.getByText("Login to Save Your Order")).toBeInTheDocument();
    expect(screen.getByText("Option 1: Magic Link Login")).toBeInTheDocument();
    expect(screen.getByText("Option 2: Continue as Guest")).toBeInTheDocument();
    expect(screen.getByText("SEND MAGIC LINK")).toBeInTheDocument();
    expect(screen.getByText("SUBMIT ORDER AS GUEST")).toBeInTheDocument();
  });

  it("handles magic link submission in GuestLoginModal", async () => {
    const onClose = vi.fn();
    const onSendMagicLink = vi.fn().mockResolvedValue(undefined);
    const onSubmitGuestOrder = vi.fn().mockResolvedValue(undefined);

    render(
      <GuestLoginModal
        isOpen={true}
        onClose={onClose}
        onSendMagicLink={onSendMagicLink}
        onSubmitGuestOrder={onSubmitGuestOrder}
        initialEmail="executive@acme.com"
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByText("SEND MAGIC LINK"));
    });

    expect(onSendMagicLink).toHaveBeenCalledWith("executive@acme.com");
  });

  it("renders logged-in success page with Order ID and Portal buttons", async () => {
    await act(async () => {
      render(<ConfiguratorSuccessPage />);
    });

    expect(screen.getByText("ORDER CREATED SUCCESSFULLY")).toBeInTheDocument();
    expect(screen.getByText("ORD-TEST-99")).toBeInTheDocument();
    expect(screen.getByText("VIEW IN PORTAL ORDERS")).toBeInTheDocument();
    expect(screen.getByText("CREATE ANOTHER ORDER")).toBeInTheDocument();
    expect(screen.getByText("CONTACT SUPPORT →")).toBeInTheDocument();
  });

  it("renders guest confirmation page with email and resend button", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, message: "Magic link re-sent to guest@company.com." }),
      })
    );

    await act(async () => {
      render(<GuestConfirmationPage />);
    });

    expect(screen.getByText("ORDER CREATED — CHECK YOUR EMAIL")).toBeInTheDocument();
    expect(screen.getByText("guest@company.com")).toBeInTheDocument();
    expect(screen.getByText("BACK TO CATALOG")).toBeInTheDocument();
    expect(screen.getByText("RESEND MAGIC LINK →")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText("RESEND MAGIC LINK →"));
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/customer/resend-magic-link",
      expect.objectContaining({ method: "POST" })
    );
  });
});
