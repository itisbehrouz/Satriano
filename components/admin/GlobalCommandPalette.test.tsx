import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, act } from "@testing-library/react";
import { GlobalCommandPalette } from "./GlobalCommandPalette";

let mockPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("GlobalCommandPalette Route Scoping & Security Guard", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ products: [], orders: [] }),
        })
      )
    );
  });

  it("returns null on public homepage route (/)", () => {
    mockPathname = "/";
    const { container } = render(<GlobalCommandPalette isOpen={true} />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null on customer portal route (/portal/orders)", () => {
    mockPathname = "/portal/orders";
    const { container } = render(<GlobalCommandPalette isOpen={true} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders command palette container on admin route (/admin)", async () => {
    mockPathname = "/admin";
    let container: HTMLElement;
    await act(async () => {
      const res = render(<GlobalCommandPalette isOpen={true} />);
      container = res.container;
    });
    expect(container!.firstChild).not.toBeNull();
  });
});
