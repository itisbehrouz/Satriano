import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SizeQtyTable } from "@/components/configurator/SizeQtyTable";
import { DEFAULT_SIZE_QUANTITIES } from "@/lib/configuratorLogic";

function ControlledSizeQtyTable({ onChange }: { onChange: (q: Record<string, number>) => void }) {
  const [quantities, setQuantities] = useState(DEFAULT_SIZE_QUANTITIES);
  return (
    <SizeQtyTable
      activeRegion="EU"
      onRegionChange={() => {}}
      quantities={quantities}
      onChange={(next) => {
        setQuantities(next);
        onChange(next);
      }}
    />
  );
}

describe("SizeQtyTable", () => {
  it("renders a cell per size starting at 0 quantity", () => {
    render(
      <SizeQtyTable
        activeRegion="EU"
        onRegionChange={() => {}}
        quantities={DEFAULT_SIZE_QUANTITIES}
        onChange={() => {}}
      />,
    );

    expect(screen.getByLabelText("XS EU")).toHaveValue(0);
    expect(screen.getByLabelText("S EU")).toHaveValue(0);
    expect(screen.getByLabelText("M EU")).toHaveValue(0);
    expect(screen.getByLabelText("L EU")).toHaveValue(0);
    expect(screen.getByLabelText("XL EU")).toHaveValue(0);
  });

  it("calls onChange with only the edited size updated, others preserved", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ControlledSizeQtyTable onChange={onChange} />);

    await user.clear(screen.getByLabelText("M EU"));
    await user.type(screen.getByLabelText("M EU"), "75");

    const lastCall = onChange.mock.calls.at(-1)?.[0];
    expect(lastCall).toEqual({ ...DEFAULT_SIZE_QUANTITIES, M: 75 });
  });

  it("sanitizes a negative value to 0 via parseQuantityInput", () => {
    const onChange = vi.fn();
    render(<ControlledSizeQtyTable onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("XS EU"), { target: { value: "-5" } });

    const lastCall = onChange.mock.calls.at(-1)?.[0];
    expect(lastCall?.XS).toBe(0);
  });
});
