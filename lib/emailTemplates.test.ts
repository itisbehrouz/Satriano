import { describe, it, expect } from "vitest";
import {
  proformaEmailTemplate,
  paymentConfirmationTemplate,
  orderStatusUpdateTemplate,
  supplierPOTemplate,
  supportTicketConfirmationTemplate,
} from "./emailTemplates";

describe("Email Templates", () => {
  it("should generate proforma email template correctly", () => {
    const template = proformaEmailTemplate(
      "Test Company",
      "REF-123",
      "https://example.com/pdf",
      new Date("2026-12-31"),
      "$1,000.00"
    );
    expect(template.subject).toContain("REF-123");
    expect(template.html).toContain("Test Company");
    expect(template.html).toContain("$1,000.00");
  });

  it("should generate payment confirmation template correctly", () => {
    const template = paymentConfirmationTemplate(
      "Test Company",
      "ORD-456",
      "$1,000.00",
      "14 days"
    );
    expect(template.subject).toContain("ORD-456");
    expect(template.html).toContain("Test Company");
    expect(template.html).toContain("$1,000.00");
  });

  it("should generate order status update template correctly", () => {
    const template = orderStatusUpdateTemplate(
      "Test Company",
      "ORD-456",
      "Shipped",
      "Your order has been shipped."
    );
    expect(template.subject).toContain("Shipped");
    expect(template.html).toContain("Test Company");
    expect(template.html).toContain("Your order has been shipped.");
  });

  it("should generate supplier PO template correctly", () => {
    const template = supplierPOTemplate(
      "Supplier A",
      "PO-789",
      new Date("2026-12-31"),
      "$500.00",
      "https://example.com/po"
    );
    expect(template.subject).toContain("PO-789");
    expect(template.html).toContain("Supplier A");
    expect(template.html).toContain("$500.00");
  });

  it("should generate support ticket confirmation template correctly", () => {
    const template = supportTicketConfirmationTemplate(
      "Test Company",
      "TKT-123",
      "Need help with order"
    );
    expect(template.subject).toContain("TKT-123");
    expect(template.html).toContain("Test Company");
    expect(template.html).toContain("Need help with order");
  });
});
