import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FabricPicker, type FabricOption } from "@/components/configurator/FabricPicker";

const fabrics: FabricOption[] = [
  {
    id: "fabric-pique",
    name: "Pique Cotton",
    description: "Classic, breathable texture.",
    imageUrl: null,
    priceMinCents: 1500,
    priceMaxCents: 2000,
    setupFeeCents: 15000,
  },
  {
    id: "fabric-organic",
    name: "Organic Cotton",
    description: "Sustainable, ultra-soft feel.",
    imageUrl: null,
    priceMinCents: 1900,
    priceMaxCents: 2400,
    setupFeeCents: 15000,
  },
];

describe("FabricPicker", () => {
  it("renders each fabric's name, description, and formatted estimated unit price range", () => {
    render(
      <FabricPicker fabrics={fabrics} selectedFabricId="fabric-pique" onSelect={() => {}} />,
    );

    expect(screen.getByText("Pique Cotton")).toBeInTheDocument();
    expect(screen.getByText("Classic, breathable texture.")).toBeInTheDocument();
    expect(screen.getByText("Est. Range: $15.00 – $20.00 / unit")).toBeInTheDocument();
    expect(screen.getByText("Est. Range: $19.00 – $24.00 / unit")).toBeInTheDocument();
  });

  it("marks the selected fabric's radio input as checked", () => {
    render(
      <FabricPicker fabrics={fabrics} selectedFabricId="fabric-organic" onSelect={() => {}} />,
    );

    expect(screen.getByRole("radio", { name: /pique cotton/i })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: /organic cotton/i })).toBeChecked();
  });

  it("calls onSelect with the fabric id when a card is clicked", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <FabricPicker fabrics={fabrics} selectedFabricId="fabric-pique" onSelect={onSelect} />,
    );

    await user.click(screen.getByRole("radio", { name: /organic cotton/i }));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith("fabric-organic");
  });
});
