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

  it("calls onSubmit when the submit button is clicked with a non-empty order above MOQ", async () => {
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

    expect(screen.getByRole("button", { name: /submit order for feasibility review/i })).toBeDisabled();
    expect(screen.getByText(/adding\.\.\./i)).toBeInTheDocument();
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

  describe("MOQ gating logic", () => {
    it("disables the submit button when total units is below MOQ (default moqPerFabric=50)", () => {
      render(
        <PriceSidebar
          fabric={{ name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 }}
          sizeQuantities={[{ size: "M", quantity: 30 }]}
        />,
      );

      expect(screen.getByRole("button", { name: /submit order for feasibility review/i })).toBeDisabled();
    });

    it("enables the submit button when total units equals MOQ (default moqPerFabric=50)", () => {
      render(
        <PriceSidebar
          fabric={{ name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 }}
          sizeQuantities={[{ size: "M", quantity: 50 }]}
        />,
      );

      expect(screen.getByRole("button", { name: /submit order for feasibility review/i })).not.toBeDisabled();
    });

    it("enables the submit button when total units exceeds MOQ (default moqPerFabric=50)", () => {
      render(
        <PriceSidebar
          fabric={{ name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 }}
          sizeQuantities={[{ size: "M", quantity: 80 }]}
        />,
      );

      expect(screen.getByRole("button", { name: /submit order for feasibility review/i })).not.toBeDisabled();
    });

    it("disables the submit button when total units is below a custom MOQ (moqPerFabric=80)", () => {
      render(
        <PriceSidebar
          fabric={{ name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 }}
          sizeQuantities={[{ size: "M", quantity: 62 }]}
          moqPerFabric={80}
        />,
      );

      expect(screen.getByRole("button", { name: /submit order for feasibility review/i })).toBeDisabled();
    });

    it("enables the submit button when total units equals a custom MOQ (moqPerFabric=80)", () => {
      render(
        <PriceSidebar
          fabric={{ name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 }}
          sizeQuantities={[{ size: "M", quantity: 80 }]}
          moqPerFabric={80}
        />,
      );

      expect(screen.getByRole("button", { name: /submit order for feasibility review/i })).not.toBeDisabled();
    });

    it("shows the correct progress percentage when below MOQ", () => {
      render(
        <PriceSidebar
          fabric={{ name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 }}
          sizeQuantities={[{ size: "M", quantity: 62 }]}
          moqPerFabric={80}
        />,
      );

      expect(screen.getByText(/62 \/ 80 units/)).toBeInTheDocument();
      // 62/80 = 77.5% -> rounds to 78%
      expect(screen.getByText(/\(78%\)/)).toBeInTheDocument();
    });

    it("shows the correct progress percentage when at MOQ", () => {
      render(
        <PriceSidebar
          fabric={{ name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 }}
          sizeQuantities={[{ size: "M", quantity: 80 }]}
          moqPerFabric={80}
        />,
      );

      expect(screen.getByText(/80 \/ 80 units/)).toBeInTheDocument();
      expect(screen.getByText(/\(100%\)/)).toBeInTheDocument();
    });

    it("caps progress percentage at 100% when above MOQ", () => {
      render(
        <PriceSidebar
          fabric={{ name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 }}
          sizeQuantities={[{ size: "M", quantity: 120 }]}
          moqPerFabric={80}
        />,
      );

      expect(screen.getByText(/\(100%\)/)).toBeInTheDocument();
    });

    it("shows the correct units remaining message when below MOQ", () => {
      render(
        <PriceSidebar
          fabric={{ name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 }}
          sizeQuantities={[{ size: "M", quantity: 62 }]}
          moqPerFabric={80}
        />,
      );

      expect(screen.getByText(/18 more units needed/)).toBeInTheDocument();
    });

    it("shows singular 'unit' when exactly 1 unit remaining", () => {
      render(
        <PriceSidebar
          fabric={{ name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 }}
          sizeQuantities={[{ size: "M", quantity: 79 }]}
          moqPerFabric={80}
        />,
      );

      expect(screen.getByText(/1 more unit needed/)).toBeInTheDocument();
    });

    it("shows the minimum met message when at MOQ", () => {
      render(
        <PriceSidebar
          fabric={{ name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 }}
          sizeQuantities={[{ size: "M", quantity: 80 }]}
          moqPerFabric={80}
        />,
      );

      expect(screen.getByText(/minimum order quantity met/i)).toBeInTheDocument();
    });

    it("shows the gating inline message when below MOQ", () => {
      render(
        <PriceSidebar
          fabric={{ name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 }}
          sizeQuantities={[{ size: "M", quantity: 62 }]}
          moqPerFabric={80}
        />,
      );

      expect(screen.getByText(/Submission disabled/)).toBeInTheDocument();
    });

    it("does not show the gating message when at MOQ", () => {
      const { queryByText } = render(
        <PriceSidebar
          fabric={{ name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 }}
          sizeQuantities={[{ size: "M", quantity: 80 }]}
          moqPerFabric={80}
        />,
      );

      expect(queryByText(/Submission disabled/)).not.toBeInTheDocument();
    });
  });
});
