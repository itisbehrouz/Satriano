import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SizeQtyTable } from "@/components/configurator/SizeQtyTable";
import { DEFAULT_SIZE_QUANTITIES, type SizeQuantities } from "@/lib/configuratorLogic";

// Controlled inputs only behave realistically in tests if the value prop is
// fed back after every change, exactly like the real page will do.
function ControlledSizeQtyTable({ onChange }: { onChange: (q: SizeQuantities) => void }) {
  const [quantities, setQuantities] = useState(DEFAULT_SIZE_QUANTITIES);
  return (
    <SizeQtyTable
      quantities={quantities}
      onChange={(next) => {
        setQuantities(next);
        onChange(next);
      }}
    />
  );
}

describe("SizeQtyTable", () => {
  it("renders a row per size with the current quantity", () => {
    render(<SizeQtyTable quantities={DEFAULT_SIZE_QUANTITIES} onChange={() => {}} />);

    expect(screen.getByLabelText("S")).toHaveValue(50);
    expect(screen.getByLabelText("M")).toHaveValue(100);
    expect(screen.getByLabelText("L")).toHaveValue(100);
    expect(screen.getByLabelText("XL")).toHaveValue(50);
    expect(screen.getByLabelText("XS")).toHaveValue(0);
    expect(screen.getByLabelText("XXL")).toHaveValue(0);
  });

  it("calls onChange with only the edited size updated, others preserved", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<ControlledSizeQtyTable onChange={onChange} />);

    await user.clear(screen.getByLabelText("M"));
    await user.type(screen.getByLabelText("M"), "75");

    const lastCall = onChange.mock.calls.at(-1)?.[0];
    expect(lastCall).toEqual({ ...DEFAULT_SIZE_QUANTITIES, M: 75 });
  });

  it("sanitizes a negative value to 0 via parseQuantityInput", () => {
    // fireEvent delivers the final "-5" in one change event, like a paste or
    // autofill would — per-keystroke typing is covered by parseQuantityInput's
    // own unit tests in lib/configuratorLogic.test.ts.
    const onChange = vi.fn();
    render(<ControlledSizeQtyTable onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("XS"), { target: { value: "-5" } });

    const lastCall = onChange.mock.calls.at(-1)?.[0];
    expect(lastCall?.XS).toBe(0);
  });
});
