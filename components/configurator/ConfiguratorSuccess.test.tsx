import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { ConfiguratorSuccess } from "./ConfiguratorSuccess";

describe("ConfiguratorSuccess Component", () => {
  it("renders logged-in customer success screen with View in Client Portal link", () => {
    render(
      <ConfiguratorSuccess
        orderId="ord-12345678"
        isLoggedIn={true}
        companyEmail="procurement@acme.com"
      />
    );

    expect(screen.getByText("Custom Spec Submitted Successfully!")).toBeInTheDocument();
    expect(screen.getByText("View in Client Portal")).toBeInTheDocument();
    expect(screen.getByText("ORD-12345678")).toBeInTheDocument();
  });

  it("renders unauthenticated visitor success screen with Portal login link", () => {
    render(
      <ConfiguratorSuccess
        orderId="ord-87654321"
        isLoggedIn={false}
        companyEmail="guest@company.com"
      />
    );

    expect(screen.getByText("Order Spec Received!")).toBeInTheDocument();
    expect(screen.getByText("Access Client Portal")).toBeInTheDocument();
    expect(screen.getByText("Back to Homepage")).toBeInTheDocument();
  });
});
