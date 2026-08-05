import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ColorPicker } from "./ColorPicker";

describe("ColorPicker Component", () => {
  const sampleColors = [
    { id: "col_navy", name: "Navy Blue", hexCode: "#0B1E3D" },
    { id: "col_white", name: "Crisp White", hexCode: "#FFFFFF" },
  ];

  it("renders colourway cards with swatches and names", () => {
    render(
      <ColorPicker
        colors={sampleColors}
        selectedColorIds={["col_navy"]}
        onToggleColor={vi.fn()}
        onSelectAll={vi.fn()}
      />
    );

    expect(screen.getByText("Navy Blue")).toBeInTheDocument();
    expect(screen.getByText("Crisp White")).toBeInTheDocument();
  });

  it("renders standard fallback badge when colors array is empty", () => {
    render(
      <ColorPicker
        colors={[]}
        selectedColorIds={[]}
        onToggleColor={vi.fn()}
        onSelectAll={vi.fn()}
      />
    );

    expect(screen.getByText("Standard Fabric Colorway")).toBeInTheDocument();
  });

  it("triggers onToggleColor when a card is clicked", () => {
    const handleToggle = vi.fn();
    render(
      <ColorPicker
        colors={sampleColors}
        selectedColorIds={["col_navy"]}
        onToggleColor={handleToggle}
        onSelectAll={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("Crisp White"));
    expect(handleToggle).toHaveBeenCalledWith("col_white");
  });
});
