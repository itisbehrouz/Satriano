import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PriceSidebar } from "@/components/configurator/PriceSidebar";

describe("PriceSidebar", () => {
  it("renders estimated price range and totals: Pique Cotton ($15-$20), 300 units", () => {
    render(
      <PriceSidebar
        fabric={{ name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 }}
        sizeQuantities={[{ size: "M", quantity: 300 }]}
      />,
    );

    expect(screen.getByText(/fabric range \(pique cotton\)/i)).toBeInTheDocument();
    expect(screen.getByText("$15.00 – $20.00 / unit")).toBeInTheDocument();
    expect(screen.getByText("$150.00")).toBeInTheDocument();
    expect(screen.getByText("300")).toBeInTheDocument();
    expect(screen.getByText("$4,650.00 – $6,150.00")).toBeInTheDocument();
  });

  it("renders estimated total range from a multi-size order", () => {
    render(
      <PriceSidebar
        fabric={{ name: "Custom", priceMinCents: 4000, priceMaxCents: 5000, setupFeeCents: 25000 }}
        sizeQuantities={[
          { size: "S", quantity: 150 },
          { size: "M", quantity: 300 },
          { size: "L", quantity: 250 },
          { size: "XL", quantity: 100 },
        ]}
      />,
    );

    expect(screen.getByText("800")).toBeInTheDocument();
    expect(screen.getByText("$32,250.00 – $40,250.00")).toBeInTheDocument();
  });

  it("disables the submit button when total units is 0", () => {
    render(
      <PriceSidebar
        fabric={{ name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 }}
        sizeQuantities={[{ size: "M", quantity: 0 }]}
      />,
    );

    expect(screen.getByRole("button", { name: /submit order for feasibility review/i })).toBeDisabled();
  });

  it("calls onSubmit when the submit button is clicked with a non-empty order", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <PriceSidebar
        fabric={{ name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 }}
        sizeQuantities={[{ size: "M", quantity: 300 }]}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: /submit order for feasibility review/i }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("disables the button and shows a submitting label while submitting", () => {
    render(
      <PriceSidebar
        fabric={{ name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 }}
        sizeQuantities={[{ size: "M", quantity: 300 }]}
        submitting
      />,
    );

    expect(screen.getByRole("button", { name: /submitting/i })).toBeDisabled();
  });

  it("renders an error message when provided", () => {
    render(
      <PriceSidebar
        fabric={{ name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 }}
        sizeQuantities={[{ size: "M", quantity: 300 }]}
        errorMessage="Company name and email are required."
      />,
    );

    expect(screen.getByText("Company name and email are required.")).toBeInTheDocument();
  });
});
