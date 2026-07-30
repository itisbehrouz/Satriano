import { describe, expect, it } from "vitest";
import { formatCents } from "@/lib/formatCurrency";

describe("formatCents", () => {
  it("formats the configurator mockup's per-unit price", () => {
    expect(formatCents(1850)).toBe("$18.50");
  });

  it("formats the configurator mockup's estimated total with thousands separator", () => {
    expect(formatCents(570000)).toBe("$5,700.00");
  });

  it("formats zero", () => {
    expect(formatCents(0)).toBe("$0.00");
  });
});
