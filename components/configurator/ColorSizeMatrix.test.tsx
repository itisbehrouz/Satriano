import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ColorSizeMatrix } from "./ColorSizeMatrix";

describe("ColorSizeMatrix Component", () => {
  const sampleColors = [
    { id: "col_navy", name: "Navy Blue", hexCode: "#0B1E3D" },
    { id: "col_white", name: "Crisp White", hexCode: "#FFFFFF" },
  ];

  const sampleSizeSystems = [
    {
      id: "sys_eu",
      name: "Alpha",
      region: "EU" as const,
      options: [
        { id: "opt_m", label: "M", sortOrder: 1 },
        { id: "opt_l", label: "L", sortOrder: 2 },
      ],
    },
  ];

  it("renders matrix grid with colour rows and size columns", () => {
    render(
      <ColorSizeMatrix
        selectedColors={sampleColors}
        sizeSystems={sampleSizeSystems}
        activeRegion="EU"
        onRegionChange={vi.fn()}
        matrixQuantities={{}}
        onQuantityChange={vi.fn()}
        onClearAll={vi.fn()}
        moqPerFabric={50}
        moqPerColor={20}
        fabricName="Pique Cotton"
      />
    );

    expect(screen.getByText("Navy Blue")).toBeInTheDocument();
    expect(screen.getByText("Crisp White")).toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
    expect(screen.getByText("L")).toBeInTheDocument();
  });

  it("displays live per-colour MOQ running total and pass/fail indicators", () => {
    const quantities = {
      col_navy: { M: 45 },
      col_white: { M: 5 },
    };

    render(
      <ColorSizeMatrix
        selectedColors={sampleColors}
        sizeSystems={sampleSizeSystems}
        activeRegion="EU"
        onRegionChange={vi.fn()}
        matrixQuantities={quantities}
        onQuantityChange={vi.fn()}
        onClearAll={vi.fn()}
        moqPerFabric={50}
        moqPerColor={20}
        fabricName="Pique Cotton"
      />
    );

    expect(screen.getByText("45 / 20")).toBeInTheDocument();
    expect(screen.getByText("5 / 20")).toBeInTheDocument();
    expect(screen.getByText("Crisp White requires at least 20 units. Currently 5.")).toBeInTheDocument();
  });

  it("triggers onQuantityChange when cell input is modified", () => {
    const handleQuantityChange = vi.fn();
    render(
      <ColorSizeMatrix
        selectedColors={sampleColors}
        sizeSystems={sampleSizeSystems}
        activeRegion="EU"
        onRegionChange={vi.fn()}
        matrixQuantities={{}}
        onQuantityChange={handleQuantityChange}
        onClearAll={vi.fn()}
        moqPerFabric={50}
        moqPerColor={20}
        fabricName="Pique Cotton"
      />
    );

    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "15" } });
    expect(handleQuantityChange).toHaveBeenCalledWith("col_navy", "M", 15);
  });
});
