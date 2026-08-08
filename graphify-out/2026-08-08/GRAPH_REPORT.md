# Graph Report - Satriano Atelier  (2026-08-08)

## Corpus Check
- 306 files · ~1,604,597 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1441 nodes · 2104 edges · 168 communities (146 shown, 22 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `186cd931`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Route Post() Get()
- Page Default Size
- @types @testing Library
- Page Metadata Categoryoption
- Route Post() Get()
- Sizeoption Sizesystem Category
- Page Admin Tabs
- Wholesale Admin Page
- @prisma Three Cmdk
- Portal Orders Portaldashboard.test
- Page React Account
- .next Types Dom
- Orders Api Route
- Page Sections Terms
- Proforma Route Post()
- CategoryInventoryClient.tsx
- Page Ethics Ethicspage()
- App Layout Baskervville
- App Wholesale Page
- Audit Codebase Health
- Support Page Supportpage()
- Wholesale [productid] Page
- Wholesalecheckoutclient Wholesalecheckoutclient() Wholesalecart
- Categories Page Categoriespage()
- Links Cookieconsentmodal Cookiecategorystate
- App Page Capabilities
- Roadmap Architecture Satriano
- Architecture Viz Page
- Design System Master
- Mode Satriano Atelier
- app/page.tsx
- Görevler Project Roadmap
- Next Getting Started
- Seed Adapter Main()
- Layout Portalheader Portalheader()
- Whatsapplivechat Channels Whatsapplivechat()
- Language Rule (strict)
- Next.config Nextconfig Securityheaders
- Graphify
- Workflow: Graphify
- Eslint.config.mjs Eslintconfig
- Postcss.config.mjs Config
- Satrinao.png
- @agents.md
- sw.js
- admin/orders/page.tsx
- products/[id]/route.ts
- ConfiguratorSuccess.tsx
- InventoryTab.tsx
- seed-core-colors.ts
- AIFaqAssistantModal.tsx
- seed-pilot-colors.ts
- architecture-viz/page.tsx
- B2BSupportDock.tsx
- [orderId]/page.tsx
- AdminLanguageContext.tsx
- payment.test.ts
- products/[id]/route.ts
- products/route.ts
- [imageId]/route.ts
- images/route.ts
- admin/orders/page.tsx
- CookieConsentModal.tsx
- api/upload/route.ts
- TurnstileWidget.tsx
- SATRIANO_READ-ONLY_ARCHITECTURE_PRODUCT_INTELLIGENCE_EXTRACTION.md
- ConfiguratorPortal.test.tsx
- InventoryTab.tsx
- applications/route.ts
- 05. WHOLESALE ARCHITECTURE
- 29. Homepage Redesign, Setup Fee Removal & Multi-Colourway Foundation (Aug 5, 2026)
- 08. MATERIAL ARCHITECTURE
- 21. CRITICAL ARCHITECTURE GAPS
- 18. Catalog Image Upload, Email Infrastructure & Production Hardening (Jul 31 – Aug 2, 2026)
- 31. Session Log: August 7, 2026
- 28. Portal Login Gate Cleanup, ⌘K Security Scoping, PWA & Codebase Health Pass (Aug 4, 2026)
- 26. Site-Wide Dark/Light Theme System Specification & Technical Rules
- 21. Add Wholesale Product Flow — Build & Production E2E Verification (Aug 2, 2026, evening)
- 20. CURRENT IMPLEMENTATION INTELLIGENCE
- 30. Multi-Colourway Ordering — Phases 3a & 3b Complete (Aug 5, 2026)
- 01. PRODUCT DEFINITION
- 03. CLIENT PORTAL
- 04. CLIENT M2O EXPERIENCE
- 06. ADMIN PORTAL
- 07. ADMIN ORDER OPERATIONS
- 10. AUTHENTICATION & AUTHORIZATION
- 12. ORDER STATE MACHINES
- 13. PRICING ARCHITECTURE
- 15. CLIENT UX STATE MODEL
- 23. DESIGN / UI GOVERNANCE
- 27. Portal Header Redesign & Admin Nav Rename (Aug 4, 2026)
- 5. Admin Panel — Inventory
- 5a. Admin UI Redesign (Aug 1, evening session)
- 09. CATALOG ARCHITECTURE
- 11. DATA VISIBILITY & SECURITY
- 14. PROFORMA & PAYMENT
- 18. TECHNICAL ROUTE MODEL
- 3. Production Infrastructure
- prisma.ts
- ProductFitTree.tsx
- verifyCustomerToken
- FabricPricingPanel.tsx
- RegionalSizePanel.tsx
- RegionalSizeTree.tsx
- CatalogImageUploader.tsx
- DeleteWholesaleProductModal.tsx
- EditWholesaleProductModal.tsx
- AGENT 6 — RBAC & REAL-TIME NOTIFICATIONS
- AGENT 10 — API & INTEGRATIONS
- AGENT 4 — PROFORMA PDF & INVENTORY DEDUCTION
- AGENT 5 — PRODUCTION & SUPPLIER AUTOMATION
- api/orders/route.ts
- AGENT 7 — EMAIL & COMMUNICATION AUTOMATION
- AGENT 8 — ANALYTICS & REPORTING DASHBOARD
- pricing.ts
- AGENT 9 — ADVANCED INVENTORY MANAGEMENT
- categories/page.tsx
- types.ts
- MaterialComponentSelector.tsx
- portal/PortalHeader.tsx
- notifications.ts
- rbac.ts
- [imageId]/route.ts
- analytics.ts
- inventoryForecasting.ts
- inventoryReservation.ts
- ediAdapter.ts
- quickbooksSync.ts

## God Nodes (most connected - your core abstractions)
1. `useAdminLanguage()` - 71 edges
2. `verifyAdminRequest()` - 35 edges
3. `Satriano Atelier — MVP Architecture & Roadmap (Consolidated, as of August 5, 2026 — Multi-Colourway Ordering, Homepage Redesign & Setup Fee Removal)` - 34 edges
4. `SiteFooter()` - 16 edges
5. `compilerOptions` - 16 edges
6. `formatCents()` - 15 edges
7. `SiteHeader()` - 13 edges
8. `verifyCustomerToken()` - 13 edges
9. `useAdminAuth()` - 11 edges
10. `verifyCustomerRequest()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `ApplicationsContent()` --calls--> `useAdminAuth()`  [EXTRACTED]
  app/admin/applications/page.tsx → components/admin/AdminAuthContext.tsx
- `AdminChrome()` --calls--> `useAdminLanguage()`  [EXTRACTED]
  app/admin/layout.tsx → components/admin/AdminLanguageContext.tsx
- `AdminOrdersContent()` --calls--> `useAdminAuth()`  [EXTRACTED]
  app/admin/orders/page.tsx → components/admin/AdminAuthContext.tsx
- `AdminOrdersContent()` --calls--> `useAdminLanguage()`  [EXTRACTED]
  app/admin/orders/page.tsx → components/admin/AdminLanguageContext.tsx
- `AdminDashboardContent()` --calls--> `useAdminLanguage()`  [EXTRACTED]
  app/admin/page.tsx → components/admin/AdminLanguageContext.tsx

## Import Cycles
- None detected.

## Communities (168 total, 22 thin omitted)

### Community 0 - "Route Post() Get()"
Cohesion: 0.20
Nodes (11): GET(), POST(), GET(), POST(), GET(), GET(), GET(), createCustomerToken() (+3 more)

### Community 1 - "Page Default Size"
Cohesion: 0.21
Nodes (11): convertM2oCartToOrderPayload(), M2oCart, convertLegacyToMultiMaterial(), submitM2oOrder(), CreateOrderInput, CreateOrderInputMultiMaterial, CreateOrderValidationResult, isValidSizeQuantity() (+3 more)

### Community 2 - "@types @testing Library"
Cohesion: 0.04
Nodes (48): dotenv, eslint, eslint-config-next, jsdom, devDependencies, dotenv, eslint, eslint-config-next (+40 more)

### Community 3 - "Page Metadata Categoryoption"
Cohesion: 0.14
Nodes (16): metadata, AddWholesaleProductModal(), AddWholesaleProductModalProps, CategoryOption, SupplierOption, AddSupplierModal(), AddSupplierModalProps, SupplierData (+8 more)

### Community 4 - "Route Post() Get()"
Cohesion: 0.06
Nodes (44): POST(), DELETE(), PATCH(), GET(), POST(), DELETE(), GET(), PATCH() (+36 more)

### Community 5 - "Sizeoption Sizesystem Category"
Cohesion: 0.17
Nodes (12): FabricColorPanel(), FabricColorPanelProps, CategoryWithColors, FabricColorItem, FabricColorTree(), FabricColorTreeProps, FabricWithColors, ProductWithColors (+4 more)

### Community 6 - "Page Admin Tabs"
Cohesion: 0.16
Nodes (12): AdminChrome(), getNavItems(), GlobalCommandPalette, NavItem, SubItem, AdminDashboardContent(), AdminAuthContext, AdminAuthContextValue (+4 more)

### Community 7 - "Wholesale Admin Page"
Cohesion: 0.13
Nodes (16): metadata, AdminWholesaleClient(), OrderDetailModal(), OrderDetailModalProps, WholesaleOrderFull, WholesaleOrderLineItem, OrderStatusTab(), OrderStatusTabProps (+8 more)

### Community 8 - "@prisma Three Cmdk"
Cohesion: 0.05
Nodes (43): AccountPage(), cmdk, mockPush, CompanyInfoTab(), CompanyInfoTabProps, SettingsTab(), AccountTab, TabNavigation() (+35 more)

### Community 9 - "Portal Orders Portaldashboard.test"
Cohesion: 0.12
Nodes (19): CustomerOrder, CustomerOrderLine, CompanyCard(), CompanyCardProps, QuickActionButtons(), QuickLinksSection(), RecentOrdersSection(), RecentOrdersSectionProps (+11 more)

### Community 10 - "Page React Account"
Cohesion: 0.24
Nodes (9): ProformaPage(), ProformaPageProps, TransactionalHeader(), BillingTab(), InvoiceItem, InvoicePreviewModal(), InvoicePreviewModalProps, formatCents() (+1 more)

### Community 11 - ".next Types Dom"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 12 - "Orders Api Route"
Cohesion: 0.25
Nodes (4): CatalogProductItem, GlobalCommandPalette(), GlobalCommandPaletteProps, OrderSummaryItem

### Community 13 - "Page Sections Terms"
Cohesion: 0.15
Nodes (7): SECTIONS, SECTIONS, SECTIONS, SECTIONS, SECTIONS, LegalPageShell(), LegalSection

### Community 14 - "Proforma Route Post()"
Cohesion: 0.23
Nodes (10): ApplicationsContent(), getApplicationTabs(), AdminApplicationsTable(), AdminApplicationsTableProps, ApplicationStatusBadge(), B2bApplicationItem, useAdminLanguage(), AdminSidebar() (+2 more)

### Community 15 - "CategoryInventoryClient.tsx"
Cohesion: 0.16
Nodes (15): metadata, ProductImageItem, ProductImageUploader(), ProductImageUploaderProps, CategoryFilter(), CategoryFilterProps, CategoryOption, CategoryInventoryClient() (+7 more)

### Community 16 - "Page Ethics Ethicspage()"
Cohesion: 0.08
Nodes (24): 10. Standing Tools (Skills), 11. General Lesson, 12. AI Agentic Skills & Autonomous Infrastructure (Added Aug 1), 13. System Health Check & Codebase Röntgen Snapshot (Aug 2, 2026), 14. Admin Navigation & Workspace Layout Refactoring (Aug 2, 2026), 15. Executive Admin KPI Dashboard & Client Portal Isolation (Aug 2, 2026), 16. B2B Customer Portal UI & Executive Dashboard Redesign (Aug 2, 2026), 17. B2B Customer Portal Account Settings & Support Hub (Aug 2, 2026) (+16 more)

### Community 17 - "App Layout Baskervville"
Cohesion: 0.18
Nodes (9): baskervville, inter, metadata, viewport, AIFaqAssistantModal, B2BSupportDock, ClientLayoutModals(), CookieConsentModal (+1 more)

### Community 18 - "App Wholesale Page"
Cohesion: 0.22
Nodes (8): Category, CATEGORY_IMAGES, Fabric, Fit, ProductWithRelations, ReadyStockProduct, Subcategory, WholesaleCatalogClient()

### Community 19 - "Audit Codebase Health"
Cohesion: 0.22
Nodes (10): Codebase Health Audit, Feature Inventory Audit, How to run it, Output format, Rules, What to check (adapt sections to the actual stack), When to trigger, Why this matters (+2 more)

### Community 20 - "Support Page Supportpage()"
Cohesion: 0.33
Nodes (4): SupportPage(), ContactChannels(), FaqLinks(), SupportForm()

### Community 21 - "Wholesale [productid] Page"
Cohesion: 0.29
Nodes (5): CATEGORY_IMAGES, PageProps, SizeStockItem, WholesaleProductDetailClient(), WholesaleProductDetailData

### Community 22 - "Wholesalecheckoutclient Wholesalecheckoutclient() Wholesalecart"
Cohesion: 0.50
Nodes (7): WholesaleCheckoutClient(), addToWholesaleCart(), clearWholesaleCart(), getSampleDefaultCart(), getWholesaleCart(), saveWholesaleCart(), WholesaleCartItem

### Community 23 - "Categories Page Categoriespage()"
Cohesion: 0.26
Nodes (8): GET(), DashboardMetrics(), DashboardMetricsProps, mockMetricsData, ALL_STATUSES, DashboardMetricsData, getAdminDashboardMetrics(), StatusDistributionItem

### Community 24 - "Links Cookieconsentmodal Cookiecategorystate"
Cohesion: 0.13
Nodes (14): 1. Authentication & JWT Architecture (`lib/adminAuth.ts` & `middleware.ts`), 1. Missing Rate Limiting on Sensitive API Endpoints, 2. HTTP Security Headers (`next.config.ts`), 2. Stored XSS Risk via SVG Upload Allowed Types, 3. Broad Content Security Policy Directives, 3. Database & Injection Defenses (`prisma/schema.prisma`), 4. Direct Master Key Exposure in API Headers, 4. File Upload Security (`app/api/upload/route.ts`) (+6 more)

### Community 25 - "App Page Capabilities"
Cohesion: 0.24
Nodes (11): CheckoutClient(), metadata, MaterialSelection, CustomerSession, useCustomerSession(), addToM2OCart(), clearM2OCart(), getM2OCart() (+3 more)

### Community 26 - "Roadmap Architecture Satriano"
Cohesion: 0.10
Nodes (20): 1.1 Extend Prisma Schema (`prisma/schema.prisma`), 1.2 Update Existing Models, 1.3 Generate & Apply Migration, 2.1 Update `lib/moqValidation.ts`, 2.2 Update `lib/orderValidation.ts`, 3.1 Update `app/api/orders/route.ts`, 4.1 Update `prisma/seed.ts`, 4.2 Update FabricColor Seeding (+12 more)

### Community 27 - "Architecture Viz Page"
Cohesion: 0.21
Nodes (10): Anomaly, AntiGravityViz(), Packet, formatCurrencyForLocale(), formatDateForLocale(), getAvailableLocales(), t(), dictionaries (+2 more)

### Community 28 - "Design System Master"
Cohesion: 0.33
Nodes (6): Buttons & Components, Color Palette (Light Mode Default), Design System Master File (Satriano Atelier), Global Rules, Typography, Design System Master File (Satriano Atelier)

### Community 29 - "Mode Satriano Atelier"
Cohesion: 0.33
Nodes (6): Color Palette & Roles, Dark mode, Light mode, Satriano Atelier Design System, Visual Theme & Atmosphere, Satriano Atelier Design System

### Community 30 - "app/page.tsx"
Cohesion: 0.24
Nodes (6): FAQS, Category, CATEGORY_SLIDER_IMAGES, CategoryArcCarousel(), Subcategory, ProcessTimeline()

### Community 31 - "Görevler Project Roadmap"
Cohesion: 0.40
Nodes (5): ✅ Tamamlanan Görevler (Done), 📅 Planlanan Görevler (Planned), 📋 Project Roadmap & Status - Satriano Atelier, 🔄 Devam Eden Görevler (In Progress), 📋 Project Roadmap & Status - Satriano Atelier

### Community 32 - "Next Getting Started"
Cohesion: 0.50
Nodes (4): Getting Started, Learn More, or, This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Community 37 - "Language Rule (strict)"
Cohesion: 0.67
Nodes (3): Language Rule (Strict), This is NOT the Next.js you know, <!-- BEGIN:nextjs-agent-rules -->

### Community 46 - "Satrinao.png"
Cohesion: 0.38
Nodes (6): createIconSvg(), fs, generate(), iconsDir, path, sharp

### Community 82 - "admin/orders/page.tsx"
Cohesion: 0.13
Nodes (19): ColorPicker(), ColorPickerProps, ColorSizeMatrix(), ColorSizeMatrixProps, ConfiguratorClientProps, FabricColorOption, FabricOption, FabricPicker() (+11 more)

### Community 83 - "products/[id]/route.ts"
Cohesion: 0.11
Nodes (17): 1.1 Create `components/admin/FabricPriceRangeEditor.tsx`, 1.2 Create `app/api/admin/catalog/fabric/[id]/route.ts`, 1.3 Integrate into `components/admin/FabricColorPanel.tsx`, 2.1 Create `components/admin/wholesale/EditWholesaleProductModal.tsx`, 2.2 Create `components/admin/wholesale/DeleteWholesaleProductModal.tsx`, 2.3 Create API endpoints, 3.1 Update `components/WholesaleCatalogClient.tsx`, 3.2 Update Prisma schema for WholesaleProduct (+9 more)

### Community 87 - "InventoryTab.tsx"
Cohesion: 0.18
Nodes (4): Forbidden(), metadata, metadata, NotFound()

### Community 88 - "seed-core-colors.ts"
Cohesion: 0.33
Nodes (4): adapter, CORE_PALETTE, pool, prisma

### Community 89 - "AIFaqAssistantModal.tsx"
Cohesion: 0.50
Nodes (4): AIFaqAssistantModal(), ChatMessage, FAQ_KNOWLEDGE_BASE, PRESET_QUESTIONS

### Community 90 - "seed-pilot-colors.ts"
Cohesion: 0.40
Nodes (3): adapter, pool, prisma

### Community 93 - "[orderId]/page.tsx"
Cohesion: 0.09
Nodes (17): CATEGORY_IMAGES, PageProps, PortalView, AtelierLogo(), AtelierLogoProps, CookieCategoryState, OpenCookiePreferencesButton(), TabType (+9 more)

### Community 94 - "AdminLanguageContext.tsx"
Cohesion: 0.43
Nodes (5): AdminLanguageContext, AdminLanguageContextType, AdminLanguageProvider(), AdminDictionary, AdminLanguage

### Community 95 - "payment.test.ts"
Cohesion: 0.43
Nodes (3): POST(), createdCompanyIds, POST()

### Community 96 - "products/[id]/route.ts"
Cohesion: 0.70
Nodes (4): checkAdminAuth(), DELETE(), GET(), PATCH()

### Community 97 - "products/route.ts"
Cohesion: 0.83
Nodes (3): checkAdminAuth(), GET(), POST()

### Community 98 - "[imageId]/route.ts"
Cohesion: 0.12
Nodes (16): 1.1 Create `components/configurator/MaterialComponentSelector.tsx`, 1.2 Update `components/configurator/ConfiguratorClient.tsx`, 2.1 Update `lib/m2oCart.ts`, 2.2 Update Order Submission Handler, 3.1 Update API handler to auto-detect payload type, 4.1 Update `app/konfigurator/[productId]/page.tsx`, 5.1 Update or create `lib/types.ts`, AGENT 3 — CONFIGURATOR UI & ORDER SUBMISSION UPDATES (+8 more)

### Community 99 - "images/route.ts"
Cohesion: 0.19
Nodes (11): DEFAULT_ALPHA_SIZES, SizeOptionDef, SizeQtyTable(), SizeQtyTableProps, DEFAULT_SIZE_QUANTITIES, parseQuantityInput(), SIZE_CODES, SizeCode (+3 more)

### Community 101 - "CookieConsentModal.tsx"
Cohesion: 0.07
Nodes (27): 1. Create `lib/cache.ts`, 1. Data Export (GDPR), 1. OAuth 2.0 + JWT Refresh, 1. PWA Manifest, 1. Update Prisma, 2. API Security Headers, 2. Create branding loader, 2. Data Deletion (Right to be Forgotten) (+19 more)

### Community 102 - "api/upload/route.ts"
Cohesion: 0.23
Nodes (8): AdminOrdersContent(), getTabs(), AdminOrder, AdminOrderTable(), AdminOrderTableProps, ALL_STATUSES, OrderStatusBadge(), STATUS_CONFIG

### Community 106 - "SATRIANO_READ-ONLY_ARCHITECTURE_PRODUCT_INTELLIGENCE_EXTRACTION.md"
Cohesion: 0.14
Nodes (13): 02. SYSTEM DOMAINS, 16. ADMIN UX STATE MODEL, 17. AI ASSISTANT, 19. CORE DATA MODEL DIRECTION, 22. PRODUCT DECISIONS / NON-NEGOTIABLE RULES, 24. RECOMMENDED CLIENT PORTAL TARGET MODEL, 25. RECOMMENDED ADMIN TARGET MODEL, 26. FINAL SYSTEM ARCHITECTURE (+5 more)

### Community 107 - "ConfiguratorPortal.test.tsx"
Cohesion: 0.22
Nodes (4): ConfiguratorSuccessPage(), mockPush, GuestLoginModal(), GuestLoginModalProps

### Community 108 - "InventoryTab.tsx"
Cohesion: 0.22
Nodes (8): AddColorVariantModal(), AddColorVariantModalProps, InventoryEditModal(), InventoryEditModalProps, ColorVariant, InventoryProduct, InventoryTab(), InventoryTabProps

### Community 109 - "applications/route.ts"
Cohesion: 0.20
Nodes (9): Category, Fabric, FitDef, Product, ProductSettingsContent(), SizeOption, SizeSystem, slugify() (+1 more)

### Community 110 - "05. WHOLESALE ARCHITECTURE"
Cohesion: 0.20
Nodes (10): 05. WHOLESALE ARCHITECTURE, 5.1 Wholesale Is a First-Class Business Model, 5.2 Wholesale Audience Dimensions, 5.3 Wholesale Product Taxonomy, 5.4 Wholesale Discovery, 5.5 Wholesale Product Detail, 5.6 Wholesale Cart, 5.7 Wholesale Fulfillment (+2 more)

### Community 111 - "29. Homepage Redesign, Setup Fee Removal & Multi-Colourway Foundation (Aug 5, 2026)"
Cohesion: 0.22
Nodes (9): 29.1 — Setup fee removed from the business model, 29.2 — Multi-colourway ordering: architecture settled after two false starts, 29.3 — Homepage: category arc carousel replaces the catalog grid, 29.4 — Homepage: process timeline replaces the feature grid, 29.5 — Homepage price estimator removed (scope drift caught), 29.6 — Configurator: entry points, size matrix, stepper, theme, 29.7 — Brand: gold relocated, 29.8 — Open items and known issues (+1 more)

### Community 112 - "08. MATERIAL ARCHITECTURE"
Cohesion: 0.25
Nodes (8): 08. MATERIAL ARCHITECTURE, 8.1 Domain Decision, 8.2 Material Type, 8.3 Database vs UI, 8.4 Material Components, 8.5 Mixed Material Rule, Customer UI, Database

### Community 113 - "21. CRITICAL ARCHITECTURE GAPS"
Cohesion: 0.25
Nodes (8): 21. CRITICAL ARCHITECTURE GAPS, P0 — Material Model, P0 — Security Boundary, P0 — Wholesale Audience Model, P1 — Inventory Integrity, P1 — Product/Material Compatibility, P1 — RBAC, P2 — Production Work Orders

### Community 114 - "18. Catalog Image Upload, Email Infrastructure & Production Hardening (Jul 31 – Aug 2, 2026)"
Cohesion: 0.25
Nodes (8): 18. Catalog Image Upload, Email Infrastructure & Production Hardening (Jul 31 – Aug 2, 2026), Application Confirmation Page Copy, B2B Application UI Fixes, Catalog CRUD Live E2E Testing, Catalog Image Upload Feature, Email Infrastructure (Resend Integration), Production Data Cleanup, Verification

### Community 115 - "31. Session Log: August 7, 2026"
Cohesion: 0.25
Nodes (8): 31.1 Admin Console UI Turkish Localization Sweep (`/admin/*`), 31.2 Temporary "Under Development" Password Gate for Vercel & Public Site, 31.3 Homepage Hero Image Asset Update, 31.4 Web Security Audit & Codebase Hardening (`docs/SECURITY_AUDIT.md`), 31.5 Cloudflare Turnstile Free Human Verification System, 31.6 Enterprise Error Pages & Error Boundaries Suite, 31.7 Build & Verification Status, 31. Session Log: August 7, 2026

### Community 116 - "28. Portal Login Gate Cleanup, ⌘K Security Scoping, PWA & Codebase Health Pass (Aug 4, 2026)"
Cohesion: 0.29
Nodes (7): 28.1 — ⌘K admin command palette leak (SECURITY), 28.2 — Unauthenticated `/portal` login gate is now fully chrome-free, 28.3 — PWA support added, 28.4 — Codebase health audit pass, 28.5 — Incident: dead-code removal broke the build, 28.6 — Agent handoff note, 28. Portal Login Gate Cleanup, ⌘K Security Scoping, PWA & Codebase Health Pass (Aug 4, 2026)

### Community 117 - "26. Site-Wide Dark/Light Theme System Specification & Technical Rules"
Cohesion: 0.33
Nodes (6): 1. Scope & Isolation Boundaries, 26. Site-Wide Dark/Light Theme System Specification & Technical Rules, 2. Default Theme Resolution Logic, 3. Comprehensive Theme Token Reference, 4. The Five Hard Development Rules, 5. Current Verification & Known Implementation Status

### Community 118 - "21. Add Wholesale Product Flow — Build & Production E2E Verification (Aug 2, 2026, evening)"
Cohesion: 0.33
Nodes (6): 21. Add Wholesale Product Flow — Build & Production E2E Verification (Aug 2, 2026, evening), Admin UI — `AddWholesaleProductModal.tsx`, API — `/api/admin/wholesale/products` (admin-JWT protected), Data model, Production E2E verification (9/9 assertions passed, zero residue), Unit tests

### Community 119 - "20. CURRENT IMPLEMENTATION INTELLIGENCE"
Cohesion: 0.40
Nodes (5): 20. CURRENT IMPLEMENTATION INTELLIGENCE, Database / API Only or Incomplete UI, Implemented / Existing, Missing / Target Architecture, Partially Implemented

### Community 120 - "30. Multi-Colourway Ordering — Phases 3a & 3b Complete (Aug 5, 2026)"
Cohesion: 0.40
Nodes (5): 30.1 — Pilot colour data seeded, 30.2 — Configurator: colour step and bulk order matrix, 30.3 — Remaining work on this feature, 30.4 — Core Color Palette Seed & Sticky Header Fixes (Aug 5, 2026, evening), 30. Multi-Colourway Ordering — Phases 3a & 3b Complete (Aug 5, 2026)

### Community 121 - "01. PRODUCT DEFINITION"
Cohesion: 0.50
Nodes (4): 01. PRODUCT DEFINITION, 1.1 What Satriano Is, 1.2 Core Mental Model, 1.3 Product Principles

### Community 122 - "03. CLIENT PORTAL"
Cohesion: 0.50
Nodes (4): 03. CLIENT PORTAL, 3.1 Client Portal Purpose, 3.2 Client Navigation Model, 3.3 Client Personas

### Community 123 - "04. CLIENT M2O EXPERIENCE"
Cohesion: 0.50
Nodes (4): 04. CLIENT M2O EXPERIENCE, 4.1 M2O Journey, 4.2 Customer-Facing Material Principle, 4.3 Material Selection Rules

### Community 124 - "06. ADMIN PORTAL"
Cohesion: 0.50
Nodes (4): 06. ADMIN PORTAL, 6.1 Admin Portal Purpose, 6.2 Admin Personas, 6.3 Admin Navigation

### Community 125 - "07. ADMIN ORDER OPERATIONS"
Cohesion: 0.50
Nodes (4): 07. ADMIN ORDER OPERATIONS, 7.1 Unified Order Model, 7.2 M2O Feasibility Desk, 7.3 Wholesale Order Desk

### Community 126 - "10. AUTHENTICATION & AUTHORIZATION"
Cohesion: 0.50
Nodes (4): 10.1 Client Authentication, 10.2 Admin Authentication, 10.3 RBAC Gap, 10. AUTHENTICATION & AUTHORIZATION

### Community 127 - "12. ORDER STATE MACHINES"
Cohesion: 0.50
Nodes (4): 12.1 M2O, 12.2 Wholesale, 12.3 B2B Application, 12. ORDER STATE MACHINES

### Community 128 - "13. PRICING ARCHITECTURE"
Cohesion: 0.50
Nodes (4): 13.1 M2O Pricing, 13.2 Wholesale Pricing, 13.3 Price Boundary, 13. PRICING ARCHITECTURE

### Community 129 - "15. CLIENT UX STATE MODEL"
Cohesion: 0.50
Nodes (4): 15.1 Portal, 15.2 Orders, 15.3 Wholesale, 15. CLIENT UX STATE MODEL

### Community 130 - "23. DESIGN / UI GOVERNANCE"
Cohesion: 0.50
Nodes (4): 23.1 Architecture Comes First, 23.2 Existing UI Is Still Valuable, 23.3 UI Review Rule, 23. DESIGN / UI GOVERNANCE

### Community 131 - "27. Portal Header Redesign & Admin Nav Rename (Aug 4, 2026)"
Cohesion: 0.50
Nodes (4): 27. Portal Header Redesign & Admin Nav Rename (Aug 4, 2026), Admin nav — renamed, Portal header — rebuilt, Public homepage — unchanged, re-verified

### Community 132 - "5. Admin Panel — Inventory"
Cohesion: 0.50
Nodes (4): 5. Admin Panel — Inventory, ❌ Missing, 🟡 Partial / pending, ✅ Working

### Community 133 - "5a. Admin UI Redesign (Aug 1, evening session)"
Cohesion: 0.50
Nodes (4): 5a. Admin UI Redesign (Aug 1, evening session), Completed:, Design tokens (admin-only, do not apply to `/`, `/configure`, `/portal`), Verification performed:

### Community 134 - "09. CATALOG ARCHITECTURE"
Cohesion: 0.67
Nodes (3): 09. CATALOG ARCHITECTURE, 9.1 M2O Catalog, 9.2 Wholesale Catalog

### Community 135 - "11. DATA VISIBILITY & SECURITY"
Cohesion: 0.67
Nodes (3): 11.1 Customer Visibility, 11.2 Supplier Privacy Boundary, 11. DATA VISIBILITY & SECURITY

### Community 136 - "14. PROFORMA & PAYMENT"
Cohesion: 0.67
Nodes (3): 14.1 Proforma, 14.2 Payment, 14. PROFORMA & PAYMENT

### Community 137 - "18. TECHNICAL ROUTE MODEL"
Cohesion: 0.67
Nodes (3): 18.1 Client, 18.2 Admin, 18. TECHNICAL ROUTE MODEL

### Community 139 - "prisma.ts"
Cohesion: 0.06
Nodes (9): JWT_SECRET, GET(), POST(), checkAdminAuth(), POST(), JWT_SECRET, globalForPrisma, dispatchZapierEvent() (+1 more)

### Community 140 - "ProductFitTree.tsx"
Cohesion: 0.25
Nodes (9): GarmentFitsPanel(), GarmentFitsPanelProps, Category, Fabric, FitDef, Product, ProductFitTree(), ProductFitTreeProps (+1 more)

### Community 141 - "verifyCustomerToken"
Cohesion: 0.15
Nodes (13): POST(), ConfigureDefaultPage(), ProductConfiguratorPage(), ProductConfiguratorPageProps, PortalLayout(), ConfiguratorClient(), AccountDropdown(), AccountDropdownProps (+5 more)

### Community 142 - "FabricPricingPanel.tsx"
Cohesion: 0.38
Nodes (5): FabricPricingPanel(), FabricPricingPanelProps, FabricItem, FabricPricingTree(), FabricPricingTreeProps

### Community 143 - "RegionalSizePanel.tsx"
Cohesion: 0.33
Nodes (5): CategoryWithSubcategories, RegionalSizePanel(), RegionalSizePanelProps, SizeOption, SizeSystem

### Community 144 - "RegionalSizeTree.tsx"
Cohesion: 0.33
Nodes (5): RegionalSizeTree(), RegionalSizeTreeProps, SizeOption, SizeSystem, SubcategoryWithSizeSystems

### Community 145 - "CatalogImageUploader.tsx"
Cohesion: 0.50
Nodes (3): ALLOWED_TYPES, CatalogImageUploader(), CatalogImageUploaderProps

### Community 149 - "AGENT 6 — RBAC & REAL-TIME NOTIFICATIONS"
Cohesion: 0.11
Nodes (17): 1.1 Update `prisma/schema.prisma`, 1.2 Run Migration, 2.1 Create `lib/rbac.ts`, 2.2 Create `middleware/rbac.ts`, 3.1 Create `lib/notifications.ts`, 3.2 Create `app/api/notifications/subscribe/route.ts`, 3.3 Create `lib/notificationHooks.ts`, 4.1 Create `components/admin/NotificationCenter.tsx` (+9 more)

### Community 150 - "AGENT 10 — API & INTEGRATIONS"
Cohesion: 0.12
Nodes (15): 1.1 Update `app/api/payment/webhook/route.ts`, 1.2 Add Webhook Log Model to Prisma, 2.1 Create `app/api/integrations/webhooks/route.ts`, 2.2 Create `lib/externalWebhooks.ts`, 3.1 Create `lib/suppliers/ediAdapter.ts`, 4.1 Create `lib/accounting/quickbooksSync.ts`, 5.1 Add to `prisma/schema.prisma`, AGENT 10 — API & INTEGRATIONS (+7 more)

### Community 151 - "AGENT 4 — PROFORMA PDF & INVENTORY DEDUCTION"
Cohesion: 0.13
Nodes (14): 1.1 Update `lib/pdfGenerator.ts`, 1.2 Update `app/api/proforma/pdf/[orderId]/route.ts`, 2.1 Create `lib/inventoryDeduction.ts`, 2.2 Update `app/api/payment/webhook/route.ts`, 3.1 Update `app/api/admin/orders/[orderId]/route.ts`, 4.1 Extend Prisma Schema, AGENT 4 — PROFORMA PDF & INVENTORY DEDUCTION, 🎯 EXECUTION RULES (NON-NEGOTIABLE) (+6 more)

### Community 152 - "AGENT 5 — PRODUCTION & SUPPLIER AUTOMATION"
Cohesion: 0.13
Nodes (14): 1.1 Update `prisma/schema.prisma`, 2.1 Create `lib/workOrderGenerator.ts`, 3.1 Create `lib/supplierPOGenerator.ts`, 3.2 Create `lib/supplierPOWorkflow.ts`, 4.1 Create `lib/workOrderWorkflow.ts`, 5.1 Create `app/api/admin/work-orders/route.ts`, AGENT 5 — PRODUCTION & SUPPLIER AUTOMATION, 🎯 EXECUTION RULES (NON-NEGOTIABLE) (+6 more)

### Community 153 - "api/orders/route.ts"
Cohesion: 0.28
Nodes (9): POST(), createdCompanyIds, postOrders(), MoqValidationItem, MoqValidationResult, MultiMaterialMoqItem, validateHybridMoq(), validateMultiMaterialMoq() (+1 more)

### Community 154 - "AGENT 7 — EMAIL & COMMUNICATION AUTOMATION"
Cohesion: 0.15
Nodes (12): 1.1 Create `lib/emailTemplates.ts`, 2.1 Create `lib/emailService.ts`, 3.1 Update `prisma/schema.prisma`, 3.2 Create `app/api/support/tickets/route.ts`, 4.1 Create `lib/emailHooks.ts`, AGENT 7 — EMAIL & COMMUNICATION AUTOMATION, 🎯 EXECUTION RULES (NON-NEGOTIABLE), PHASE 1: EMAIL TEMPLATE SYSTEM (+4 more)

### Community 155 - "AGENT 8 — ANALYTICS & REPORTING DASHBOARD"
Cohesion: 0.15
Nodes (12): 1.1 Create `lib/analytics.ts`, 2.1 Create `app/api/admin/analytics/dashboard/route.ts`, 2.2 Create `app/api/admin/analytics/export/route.ts`, 3.1 Create `components/admin/AnalyticsDashboard.tsx`, 4.1 Create `lib/reportScheduler.ts`, AGENT 8 — ANALYTICS & REPORTING DASHBOARD, 🎯 EXECUTION RULES (NON-NEGOTIABLE), PHASE 1: ANALYTICS DATA LAYER (+4 more)

### Community 156 - "pricing.ts"
Cohesion: 0.26
Nodes (8): PriceSidebar(), PriceSidebarProps, CreateOrderInputItem, computeOrderPricing(), PricingInput, PricingLineItem, PricingResult, SizeQuantity

### Community 157 - "AGENT 9 — ADVANCED INVENTORY MANAGEMENT"
Cohesion: 0.17
Nodes (11): 1.1 Update `prisma/schema.prisma`, 2.1 Create `lib/inventoryForecasting.ts`, 3.1 Create `lib/inventoryAudit.ts`, 4.1 Create `lib/slaMonitoring.ts`, AGENT 9 — ADVANCED INVENTORY MANAGEMENT, 🎯 EXECUTION RULES (NON-NEGOTIABLE), PHASE 1: INVENTORY MODELS & AUDIT, PHASE 2: INVENTORY FORECASTING (+3 more)

### Community 158 - "categories/page.tsx"
Cohesion: 0.33
Nodes (4): CategoriesSearchFilter(), Category, CATEGORY_IMAGES, Subcategory

### Community 159 - "types.ts"
Cohesion: 0.29
Nodes (6): CreateM2oOrderPayload, CreateMultiMaterialOrderPayload, CreateWholesaleOrderPayload, LineItemMaterialSpec, MaterialComponentType, OrderLineMultiMaterial

### Community 160 - "MaterialComponentSelector.tsx"
Cohesion: 0.33
Nodes (5): AvailableFabric, AvailableFabricColor, COMPONENT_LABELS, MaterialComponentSelector(), MaterialComponentSelectorProps

### Community 161 - "portal/PortalHeader.tsx"
Cohesion: 0.20
Nodes (18): onOrderStatusChanged(), onPaymentSuccess(), onProformaGenerated(), onSupplierPOCreated(), EmailPayload, resend, sendEmail(), sendOrderStatusEmail() (+10 more)

### Community 166 - "[imageId]/route.ts"
Cohesion: 0.67
Nodes (4): applySecurityHeaders(), decryptField(), encryptField(), getEncryptionKey()

### Community 167 - "analytics.ts"
Cohesion: 0.42
Nodes (7): GET(), GET(), getDashboardOverview(), getMaterialUsageMetrics(), getOrderMetrics(), getRevenueMetrics(), getSupplierPerformanceMetrics()

### Community 169 - "inventoryForecasting.ts"
Cohesion: 0.57
Nodes (4): POST(), calculateInventoryForecast(), checkReorderPoints(), getHistoricalDemand()

### Community 171 - "inventoryReservation.ts"
Cohesion: 0.70
Nodes (3): releaseExpiredReservations(), reserveStockForOrder(), StockReservationStatus

## Knowledge Gaps
- **575 isolated node(s):** `AntiGravityViz`, `GlobalCommandPalette`, `SubItem`, `NavItem`, `SizeOption` (+570 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAdminLanguage()` connect `Proforma Route Post()` to `Page Metadata Categoryoption`, `Sizeoption Sizesystem Category`, `api/upload/route.ts`, `Page Admin Tabs`, `Wholesale Admin Page`, `ProductFitTree.tsx`, `applications/route.ts`, `FabricPricingPanel.tsx`, `Orders Api Route`, `InventoryTab.tsx`, `CategoryInventoryClient.tsx`, `Categories Page Categoriespage()`, `AdminLanguageContext.tsx`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `formatCents()` connect `Page React Account` to `App Page Capabilities`, `admin/orders/page.tsx`, `pricing.ts`, `Categories Page Categoriespage()`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `dependencies` connect `@prisma Three Cmdk` to `@types @testing Library`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **What connects `AntiGravityViz`, `GlobalCommandPalette`, `SubItem` to the rest of the system?**
  _575 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `@types @testing Library` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._
- **Should `Page Metadata Categoryoption` be split into smaller, more focused modules?**
  _Cohesion score 0.14130434782608695 - nodes in this community are weakly interconnected._
- **Should `Route Post() Get()` be split into smaller, more focused modules?**
  _Cohesion score 0.06368011847463902 - nodes in this community are weakly interconnected._