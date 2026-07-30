import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PriceSidebar } from "@/components/configurator/PriceSidebar";

describe("PriceSidebar", () => {
  it("reproduces the configurator mockup: Pique Cotton, 300 units -> $5,700.00", () => {
    render(
      <PriceSidebar
        fabric={{ name: "Pique Cotton", unitPriceCents: 1850, setupFeeCents: 15000 }}
        sizeQuantities={[{ size: "M", quantity: 300 }]}
      />,
    );

    expect(screen.getByText(/fabric base \(pique cotton\)/i)).toBeInTheDocument();
    expect(screen.getByText("$18.50")).toBeInTheDocument();
    expect(screen.getByText("$150.00")).toBeInTheDocument();
    expect(screen.getByText("300")).toBeInTheDocument();
    expect(screen.getByText("$5,700.00")).toBeInTheDocument();
  });

  it("reproduces the proforma mockup total from a multi-size order", () => {
    render(
      <PriceSidebar
        fabric={{ name: "Custom", unitPriceCents: 4500, setupFeeCents: 25000 }}
        sizeQuantities={[
          { size: "S", quantity: 150 },
          { size: "M", quantity: 300 },
          { size: "L", quantity: 250 },
          { size: "XL", quantity: 100 },
        ]}
      />,
    );

    expect(screen.getByText("800")).toBeInTheDocument();
    expect(screen.getByText("$36,250.00")).toBeInTheDocument();
  });

  it("disables the submit button when total units is 0", () => {
    render(
      <PriceSidebar
        fabric={{ name: "Pique Cotton", unitPriceCents: 1850, setupFeeCents: 15000 }}
        sizeQuantities={[{ size: "M", quantity: 0 }]}
      />,
    );

    expect(screen.getByRole("button", { name: /submit configuration/i })).toBeDisabled();
  });

  it("calls onSubmit when the submit button is clicked with a non-empty order", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <PriceSidebar
        fabric={{ name: "Pique Cotton", unitPriceCents: 1850, setupFeeCents: 15000 }}
        sizeQuantities={[{ size: "M", quantity: 300 }]}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: /submit configuration/i }));

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("disables the button and shows a submitting label while submitting", () => {
    render(
      <PriceSidebar
        fabric={{ name: "Pique Cotton", unitPriceCents: 1850, setupFeeCents: 15000 }}
        sizeQuantities={[{ size: "M", quantity: 300 }]}
        submitting
      />,
    );

    expect(screen.getByRole("button", { name: /submitting/i })).toBeDisabled();
  });

  it("renders an error message when provided", () => {
    render(
      <PriceSidebar
        fabric={{ name: "Pique Cotton", unitPriceCents: 1850, setupFeeCents: 15000 }}
        sizeQuantities={[{ size: "M", quantity: 300 }]}
        errorMessage="Company name and email are required."
      />,
    );

    expect(screen.getByText("Company name and email are required.")).toBeInTheDocument();
  });
});
