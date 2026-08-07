# Web Security Audit & Codebase Hardening Report

**Project:** Satriano Atelier  
**Date:** August 7, 2026  
**Auditor:** Web Security Agent  
**Scope:** Full Application Codebase & Configuration Audit  

---

## Executive Summary

A comprehensive web application security audit was performed for **Satriano Atelier** focusing on overall security posture, OWASP Top 10 defenses, authentication mechanics, header security, data access boundaries, and file handling. The codebase demonstrates high defensive maturity with pinned cryptographic algorithms, constant-time verification, strict HTTP security headers, and ORM parameterization. Key hardening recommendations have been prioritized for future implementation.

---

## 🛡️ Security Pros (Implemented Safeguards)

### 1. Authentication & JWT Architecture (`lib/adminAuth.ts` & `middleware.ts`)
* **Algorithm Pinning:** Explicitly pins JWT verification algorithm to `HS256` (`algorithms: ["HS256"]`) using `jose`, mitigating JWT algorithm confusion vulnerabilities.
* **Constant-Time Comparison:** Implements an edge-compatible bitwise XOR constant-time string comparison (`verifyAdminKey`) to prevent timing side-channel attacks on access keys.
* **HttpOnly Cookie Tokens:** Utilizes `HttpOnly`, `SameSite: lax`, and `Secure` (production) cookies (`sat_admin_token`) for session management to protect against client-side XSS token theft.
* **Strict Runtime Environment Guardrails:** Fails fast with descriptive internal exceptions if critical environment variables (`ADMIN_JWT_SECRET`, `ADMIN_ACCESS_KEY`) are missing or empty.

---

### 2. HTTP Security Headers (`next.config.ts`)
* **Clickjacking Defense:** Enforces `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'`.
* **Transport Security:** Configures HSTS (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`).
* **MIME Sniffing Prevention:** Specifies `X-Content-Type-Options: nosniff`.
* **Content Security Policy (CSP):** Establishes explicit boundaries (`default-src 'self'`, domain-whitelisted `connect-src` for Supabase and Stripe).

---

### 3. Database & Injection Defenses (`prisma/schema.prisma`)
* **Parameterized Queries:** Relies on Prisma ORM for database operations, ensuring native defense against SQL Injection vulnerabilities.
* **CUID & UUID Keys:** Uses `cuid()` and `uuid()` identifiers for primary keys across all models, preventing sequential ID enumeration and Insecure Direct Object Reference (IDOR) attacks.

---

### 4. File Upload Security (`app/api/upload/route.ts`)
* **Size & Type Bounds:** Enforces strict size limits (5 MB) and MIME-type validation (`ALLOWED_MIME_TYPES`).
* **Path Traversal Protection:** Sanitizes filenames (`/[^a-zA-Z0-9.-]/g`) before storage.
* **Storage Isolation:** Offloads uploads to isolated Supabase Storage buckets when configured.

---

### 5. Repository Environment Protection (`.gitignore`)
* **Secrets Exclusion:** Restricts `.env*` tracking in Git (except `.env.example`), avoiding secret leakage in source control.

---

## ⚠️ Security Cons & Vulnerability Hardening Areas

### 1. Missing Rate Limiting on Sensitive API Endpoints
* **Location:** `app/api/admin/login/route.ts`, `app/api/applications/route.ts`
* **Risk:** Lacks sliding-window rate limiting on authentication and form submission routes.
* **Impact:** Increased exposure to automated brute-force attacks and spam submissions.
* **Mitigation:** Implement sliding-window IP rate limiting via `@upstash/ratelimit` or `rate-limiter-flexible`.

---

### 2. Stored XSS Risk via SVG Upload Allowed Types
* **Location:** `app/api/upload/route.ts`
* **Risk:** Accepts `image/svg+xml` uploads without server-side SVG payload sanitization.
* **Impact:** Untrusted SVG files containing embedded `<script>` or `onload` handlers can trigger Stored XSS if rendered inline on the same origin.
* **Mitigation:** Sanitize SVGs using `DOMPurify` before storage or serve uploads from a distinct CDN domain with `Content-Disposition: attachment`.

---

### 3. Broad Content Security Policy Directives
* **Location:** `next.config.ts`
* **Risk:** `script-src` includes `'unsafe-eval'` and `'unsafe-inline'`.
* **Impact:** Increases potential XSS exploitation vectors.
* **Mitigation:** Remove `'unsafe-eval'` where unused and transition to nonce-based CSP headers for inline scripts.

---

### 4. Direct Master Key Exposure in API Headers
* **Location:** `lib/adminAuth.ts`
* **Risk:** `verifyAdminRequest` permits static matching against `ADMIN_ACCESS_KEY` via `Authorization: Bearer <KEY>`.
* **Impact:** Static key transmission in API requests increases exposure in HTTP proxy and server logs.
* **Mitigation:** Restrict API route authorization exclusively to short-lived signed JWT cookies/tokens.

---

## 📋 Actionable Hardening Roadmap

| Priority | Action Item | Target File | Target Vulnerability |
| :--- | :--- | :--- | :--- |
| 🔴 **High** | Implement sliding-window rate limiting | `app/api/admin/login/route.ts` | Brute Force / Credential Stuffing |
| 🟡 **Medium** | Sanitize or restrict SVG file uploads | `app/api/upload/route.ts` | Stored XSS |
| 🟡 **Medium** | Remove `'unsafe-eval'` from CSP header | `next.config.ts` | Code Execution Vulnerability |
| 🟢 **Low** | Restrict Bearer static key authorization | `lib/adminAuth.ts` | Secret Exposure in Server Logs |
