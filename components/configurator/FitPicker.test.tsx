import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { FitPicker, type FitOption } from "@/components/configurator/FitPicker";

const sampleFits: FitOption[] = [
  { id: "fit-slim", name: "Slim Fit", code: "SLIM", description: "Tailored close to body." },
  { id: "fit-reg", name: "Regular Fit", code: "REGULAR", description: "Classic traditional cut." },
  { id: "fit-rel", name: "Relaxed Fit", code: "RELAXED", description: "Generous casual cut." },
  { id: "fit-over", name: "Oversized", code: "OVERSIZED", description: "Streetwear silhouette." },
];

describe("FitPicker", () => {
  it("renders fit option names, codes, and descriptions", () => {
    render(<FitPicker fits={sampleFits} selectedFitId="fit-slim" onSelect={() => {}} />);

    expect(screen.getByText("Slim Fit")).toBeInTheDocument();
    expect(screen.getByText("SLIM")).toBeInTheDocument();
    expect(screen.getByText("Tailored close to body.")).toBeInTheDocument();
    expect(screen.getByText("Oversized")).toBeInTheDocument();
    expect(screen.getByText("OVERSIZED")).toBeInTheDocument();
  });

  it("checks the radio input for the selected fit", () => {
    render(<FitPicker fits={sampleFits} selectedFitId="fit-reg" onSelect={() => {}} />);

    expect(screen.getByRole("radio", { name: /slim fit/i })).not.toBeChecked();
    expect(screen.getByRole("radio", { name: /regular fit/i })).toBeChecked();
  });

  it("calls onSelect when a fit option is clicked", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<FitPicker fits={sampleFits} selectedFitId="fit-slim" onSelect={onSelect} />);

    await user.click(screen.getByRole("radio", { name: /regular fit/i }));

    expect(onSelect).toHaveBeenCalledWith("fit-reg");
  });

  it("returns null when fits array is empty", () => {
    const { container } = render(<FitPicker fits={[]} selectedFitId="" onSelect={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});
