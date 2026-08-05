import { describe, it, expect, vi } from "vitest";
import React from "react";
import ProductConfiguratorPage from "./page";

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => undefined,
  }),
}));

describe("ProductConfiguratorPage Integration", () => {
  it("fetches Classic Polo Shirt product with pilot and core colors", async () => {
    const params = Promise.resolve({ productId: "classic-polo-shirt" });
    const jsx = await ProductConfiguratorPage({ params });
    expect(jsx).toBeDefined();

    const children = jsx.props.children;
    const clientNode = children.find(
      (child: any) => child && child.props && Array.isArray(child.props.fabrics)
    );
    expect(clientNode).toBeDefined();

    const poloFabrics = clientNode.props.fabrics;
    expect(poloFabrics.length).toBeGreaterThan(0);

    for (const fab of poloFabrics) {
      expect(fab.colors).toBeDefined();
      expect(fab.colors.length).toBeGreaterThanOrEqual(4);
      expect(fab.colors.some((c: any) => c.name === "Navy Blue")).toBe(true);
    }
  });

  it("handles non-accessories products with seeded core colors", async () => {
    const params = Promise.resolve({ productId: "linen-shirt" });
    const jsx = await ProductConfiguratorPage({ params });
    expect(jsx).toBeDefined();

    const children = jsx.props.children;
    const clientNode = children.find(
      (child: any) => child && child.props && Array.isArray(child.props.fabrics)
    );
    expect(clientNode).toBeDefined();

    const fabrics = clientNode.props.fabrics;
    expect(fabrics.length).toBeGreaterThan(0);
    expect(fabrics[0].colors.length).toBeGreaterThanOrEqual(5);
  });

  it("handles accessories products with no colors gracefully (fallback to empty colors array)", async () => {
    const params = Promise.resolve({ productId: "seven-fold-tie" });
    const jsx = await ProductConfiguratorPage({ params });
    expect(jsx).toBeDefined();

    const children = jsx.props.children;
    const clientNode = children.find(
      (child: any) => child && child.props && Array.isArray(child.props.fabrics)
    );
    expect(clientNode).toBeDefined();

    const fabrics = clientNode.props.fabrics;
    expect(fabrics.length).toBeGreaterThan(0);
    expect(fabrics[0].colors).toEqual([]);
  });
});
