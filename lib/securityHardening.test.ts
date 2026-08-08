import { describe, it, expect } from "vitest";
import { encryptField, decryptField, applySecurityHeaders } from "./securityHardening";
import { NextResponse } from "next/server";

describe("Security Hardening Utilities", () => {
  describe("Encryption", () => {
    it("should correctly encrypt and decrypt a string", () => {
      const originalText = "Sensitive User Data 123!@#";
      
      const encrypted = encryptField(originalText);
      expect(encrypted).not.toBe(originalText);
      expect(encrypted).toContain(":");
      
      const decrypted = decryptField(encrypted);
      expect(decrypted).toBe(originalText);
    });

    it("should handle empty strings", () => {
      const originalText = "";
      const encrypted = encryptField(originalText);
      expect(encrypted).toBe("");
    });
    
    it("should return original string if decryption fails or format is invalid", () => {
      const invalidData = "not-encrypted-format";
      const decrypted = decryptField(invalidData);
      expect(decrypted).toBe(invalidData);
    });
  });

  describe("Security Headers", () => {
    it("should apply expected security headers to the response", () => {
      const mockResponse = new NextResponse();
      const securedResponse = applySecurityHeaders(mockResponse);
      
      expect(securedResponse.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(securedResponse.headers.get("X-Frame-Options")).toBe("DENY");
      expect(securedResponse.headers.get("X-XSS-Protection")).toBe("1; mode=block");
      expect(securedResponse.headers.get("Strict-Transport-Security")).toContain("max-age=31536000");
    });
  });
});
