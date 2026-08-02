# Graph Report - Satriano Atelier  (2026-08-02)

## Corpus Check
- 207 files · ~569,204 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 860 nodes · 1282 edges · 68 communities (55 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ba561165`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- init.ts
- WholesaleCatalogClient.tsx
- admin/layout.tsx
- useAdminAuth
- applications/page.tsx
- SupplierClient.tsx
- compilerOptions
- portal/PortalHeader.tsx
- SiteFooter.tsx
- wholesale/[productId]/page.tsx
- GlobalCommandPalette.tsx
- categories/page.tsx
- app/page.tsx
- verifyAdminRequest
- AdminWholesaleClient.tsx
- dependencies
- orders/page.tsx
- devDependencies
- Satriano Atelier — MVP Architecture & Roadmap (Consolidated, as of August 2, 2026 — Theme System & Full Roadmap Consolidation)
- email.ts
- pricing.ts
- Satriano Atelier — MVP Architecture & Roadmap (Consolidated, as of August 2, 2026 — Theme System & Full Roadmap Consolidation)
- product-settings/page.tsx
- LegalPageShell.tsx
- app/layout.tsx
- account/page.tsx
- ConfiguratorClient.tsx
- Satriano Atelier Design System
- checkout/page.tsx
- admin/layout.tsx
- support/page.tsx
- 18. Catalog Image Upload, Email Infrastructure & Production Hardening (Jul 31 – Aug 2, 2026)
- 18. Catalog Image Upload, Email Infrastructure & Production Hardening (Jul 31 – Aug 2, 2026)
- Feature Inventory Audit
- AntiGravityViz.tsx
- Global Rules
- Codebase Health Audit
- 26. Site-Wide Dark/Light Theme System Specification & Technical Rules
- 21. Add Wholesale Product Flow — Build & Production E2E Verification (Aug 2, 2026, evening)
- 26. Site-Wide Dark/Light Theme System Specification & Technical Rules
- 21. Add Wholesale Product Flow — Build & Production E2E Verification (Aug 2, 2026, evening)
- $type
- seed.ts
- README.md
- 5. Admin Panel — Inventory
- 5a. Admin UI Redesign (Aug 1, evening session)
- 5. Admin Panel — Inventory
- 5a. Admin UI Redesign (Aug 1, evening session)
- AGENTS.md
- layout/PortalHeader.tsx
- WhatsAppLiveChat.tsx
- rules/graphify.md
- workflows/graphify.md
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- 1. Catalog Architecture
- 3. Production Infrastructure
- 1. Catalog Architecture
- 3. Production Infrastructure

## God Nodes (most connected - your core abstractions)
1. `Satriano Atelier — MVP Architecture & Roadmap (Consolidated, as of August 2, 2026 — Theme System & Full Roadmap Consolidation)` - 30 edges
2. `Satriano Atelier — MVP Architecture & Roadmap (Consolidated, as of August 2, 2026 — Theme System & Full Roadmap Consolidation)` - 29 edges
3. `verifyAdminRequest()` - 27 edges
4. `compilerOptions` - 16 edges
5. `SiteFooter()` - 15 edges
6. `SiteHeader()` - 13 edges
7. `verifyCustomerToken()` - 13 edges
8. `formatCents()` - 12 edges
9. `useAdminAuth()` - 11 edges
10. `verifyCustomerRequest()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `AdminChrome()` --calls--> `useAdminAuth()`  [EXTRACTED]
  app/admin/layout.tsx → components/admin/AdminAuthContext.tsx
- `ApplicationsContent()` --calls--> `useAdminAuth()`  [EXTRACTED]
  app/admin/applications/page.tsx → components/admin/AdminAuthContext.tsx
- `AdminOrdersContent()` --calls--> `useAdminAuth()`  [EXTRACTED]
  app/admin/orders/page.tsx → components/admin/AdminAuthContext.tsx
- `AdminDashboardContent()` --calls--> `useAdminAuth()`  [EXTRACTED]
  app/admin/page.tsx → components/admin/AdminAuthContext.tsx
- `ProductSettingsContent()` --calls--> `useAdminAuth()`  [EXTRACTED]
  app/admin/product-settings/page.tsx → components/admin/AdminAuthContext.tsx

## Import Cycles
- None detected.

## Communities (68 total, 13 thin omitted)

### Community 0 - "init.ts"
Cohesion: 0.24
Nodes (7): TABS, AdminOrder, AdminOrderTable(), AdminOrderTableProps, ALL_STATUSES, OrderStatusBadge(), STATUS_CONFIG

### Community 1 - "WholesaleCatalogClient.tsx"
Cohesion: 0.20
Nodes (8): Category, CATEGORY_IMAGES, Fabric, Fit, ProductWithRelations, ReadyStockProduct, Subcategory, WholesaleCatalogClient()

### Community 2 - "admin/layout.tsx"
Cohesion: 0.22
Nodes (7): AdminChrome(), NAV_ITEMS, NavItem, SubItem, AdminAuthContext, AdminAuthContextValue, AdminAuthProvider()

### Community 3 - "useAdminAuth"
Cohesion: 0.28
Nodes (6): ApplicationsContent(), AdminOrdersContent(), AdminDashboardContent(), useAdminAuth(), AdminKpiDashboard(), DashboardMetrics

### Community 4 - "applications/page.tsx"
Cohesion: 0.32
Nodes (4): APPLICATION_TABS, AdminApplicationsTable(), AdminApplicationsTableProps, B2bApplicationItem

### Community 5 - "SupplierClient.tsx"
Cohesion: 0.08
Nodes (31): metadata, metadata, ProductImageItem, ProductImageUploader(), ProductImageUploaderProps, AddWholesaleProductModal(), AddWholesaleProductModalProps, CategoryOption (+23 more)

### Community 6 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 7 - "portal/PortalHeader.tsx"
Cohesion: 0.36
Nodes (4): AccountDropdown(), AccountDropdownProps, PortalHeader(), PortalHeaderProps

### Community 8 - "SiteFooter.tsx"
Cohesion: 0.14
Nodes (11): CATEGORY_IMAGES, PageProps, ProductConfiguratorPageProps, PortalView, ConfiguratorClient(), LEGAL_COMPLIANCE_LINKS, NAVIGATION_LINKS, QUALITY_OPERATIONS_LINKS (+3 more)

### Community 9 - "wholesale/[productId]/page.tsx"
Cohesion: 0.29
Nodes (5): CATEGORY_IMAGES, PageProps, SizeStockItem, WholesaleProductDetailClient(), WholesaleProductDetailData

### Community 10 - "GlobalCommandPalette.tsx"
Cohesion: 0.29
Nodes (5): AdminSidebarProps, CatalogProductItem, GlobalCommandPalette(), GlobalCommandPaletteProps, OrderSummaryItem

### Community 11 - "categories/page.tsx"
Cohesion: 0.33
Nodes (4): CategoriesSearchFilter(), Category, CATEGORY_IMAGES, Subcategory

### Community 12 - "app/page.tsx"
Cohesion: 0.33
Nodes (4): CAPABILITIES, CATEGORY_IMAGES, FAQS, OPERATIONAL_STEPS

### Community 15 - "verifyAdminRequest"
Cohesion: 0.09
Nodes (31): DELETE(), GET(), PATCH(), POST(), ALLOWED_TYPES, POST(), POST(), PATCH() (+23 more)

### Community 27 - "AdminWholesaleClient.tsx"
Cohesion: 0.08
Nodes (24): metadata, AddColorVariantModal(), AddColorVariantModalProps, AdminWholesaleClient(), InventoryEditModal(), InventoryEditModalProps, ColorVariant, InventoryProduct (+16 more)

### Community 28 - "dependencies"
Cohesion: 0.06
Nodes (35): cmdk, jose, next, nodemailer, dependencies, cmdk, jose, next (+27 more)

### Community 31 - "orders/page.tsx"
Cohesion: 0.12
Nodes (19): CustomerOrder, CustomerOrderLine, CompanyCard(), CompanyCardProps, QuickActionButtons(), QuickLinksSection(), RecentOrdersSection(), RecentOrdersSectionProps (+11 more)

### Community 43 - "devDependencies"
Cohesion: 0.04
Nodes (48): dotenv, eslint, eslint-config-next, jsdom, devDependencies, dotenv, eslint, eslint-config-next (+40 more)

### Community 90 - "Satriano Atelier — MVP Architecture & Roadmap (Consolidated, as of August 2, 2026 — Theme System & Full Roadmap Consolidation)"
Cohesion: 0.08
Nodes (23): 10. Standing Tools (Skills), 11. General Lesson, 12. AI Agentic Skills & Autonomous Infrastructure (Added Aug 1), 13. System Health Check & Codebase Röntgen Snapshot (Aug 2, 2026), 14. Admin Navigation & Workspace Layout Refactoring (Aug 2, 2026), 15. Executive Admin KPI Dashboard & Client Portal Isolation (Aug 2, 2026), 16. B2B Customer Portal UI & Executive Dashboard Redesign (Aug 2, 2026), 17. B2B Customer Portal Account Settings & Support Hub (Aug 2, 2026) (+15 more)

### Community 101 - "email.ts"
Cohesion: 0.33
Nodes (6): POST(), createdCompanyIds, postProforma(), sendProformaEmail(), generateProformaPdf(), ProformaPdfData

### Community 102 - "pricing.ts"
Cohesion: 0.09
Nodes (23): POST(), createdCompanyIds, postOrders(), ProformaPage(), ProformaPageProps, PriceSidebar(), PriceSidebarProps, FABRIC_GRADES (+15 more)

### Community 103 - "Satriano Atelier — MVP Architecture & Roadmap (Consolidated, as of August 2, 2026 — Theme System & Full Roadmap Consolidation)"
Cohesion: 0.09
Nodes (22): 10. Standing Tools (Skills), 11. General Lesson, 12. AI Agentic Skills & Autonomous Infrastructure (Added Aug 1), 13. System Health Check & Codebase Röntgen Snapshot (Aug 2, 2026), 14. Admin Navigation & Workspace Layout Refactoring (Aug 2, 2026), 15. Executive Admin KPI Dashboard & Client Portal Isolation (Aug 2, 2026), 16. B2B Customer Portal UI & Executive Dashboard Redesign (Aug 2, 2026), 17. B2B Customer Portal Account Settings & Support Hub (Aug 2, 2026) (+14 more)

### Community 110 - "product-settings/page.tsx"
Cohesion: 0.06
Nodes (36): Category, Fabric, FitDef, Product, ProductSettingsContent(), SizeOption, SizeSystem, slugify() (+28 more)

### Community 135 - "LegalPageShell.tsx"
Cohesion: 0.15
Nodes (9): SECTIONS, SECTIONS, SECTIONS, SECTIONS, SECTIONS, LEGAL_DOCUMENTS, LegalPageShell(), LegalPageShellProps (+1 more)

### Community 167 - "app/layout.tsx"
Cohesion: 0.14
Nodes (13): baskervville, inter, metadata, AIFaqAssistantModal(), ChatMessage, FAQ_KNOWLEDGE_BASE, PRESET_QUESTIONS, B2BSupportDock() (+5 more)

### Community 207 - "account/page.tsx"
Cohesion: 0.17
Nodes (10): AccountPage(), mockPush, CompanyInfoTab(), CompanyInfoTabProps, SettingsTab(), AccountTab, TabNavigation(), TabNavigationProps (+2 more)

### Community 208 - "ConfiguratorClient.tsx"
Cohesion: 0.06
Nodes (30): ConfiguratorSuccessPage(), ConfiguratorClientProps, mockPush, ConfiguratorSuccess(), ConfiguratorSuccessProps, FabricOption, FabricPicker(), FabricPickerProps (+22 more)

### Community 285 - "Satriano Atelier Design System"
Cohesion: 0.15
Nodes (12): Color Palette & Roles, Component Stylings, Dark mode, Depth & Elevation, Do's & Don'ts, Layout Principles, Light mode, Responsive Behavior (+4 more)

### Community 333 - "checkout/page.tsx"
Cohesion: 0.50
Nodes (7): WholesaleCheckoutClient(), addToWholesaleCart(), clearWholesaleCart(), getSampleDefaultCart(), getWholesaleCart(), saveWholesaleCart(), WholesaleCartItem

### Community 369 - "admin/layout.tsx"
Cohesion: 0.26
Nodes (8): GET(), DashboardMetrics(), DashboardMetricsProps, mockMetricsData, ALL_STATUSES, DashboardMetricsData, getAdminDashboardMetrics(), StatusDistributionItem

### Community 392 - "support/page.tsx"
Cohesion: 0.33
Nodes (4): SupportPage(), ContactChannels(), FaqLinks(), SupportForm()

### Community 405 - "18. Catalog Image Upload, Email Infrastructure & Production Hardening (Jul 31 – Aug 2, 2026)"
Cohesion: 0.25
Nodes (8): 18. Catalog Image Upload, Email Infrastructure & Production Hardening (Jul 31 – Aug 2, 2026), Application Confirmation Page Copy, B2B Application UI Fixes, Catalog CRUD Live E2E Testing, Catalog Image Upload Feature, Email Infrastructure (Resend Integration), Production Data Cleanup, Verification

### Community 406 - "18. Catalog Image Upload, Email Infrastructure & Production Hardening (Jul 31 – Aug 2, 2026)"
Cohesion: 0.25
Nodes (8): 18. Catalog Image Upload, Email Infrastructure & Production Hardening (Jul 31 – Aug 2, 2026), Application Confirmation Page Copy, B2B Application UI Fixes, Catalog CRUD Live E2E Testing, Catalog Image Upload Feature, Email Infrastructure (Resend Integration), Production Data Cleanup, Verification

### Community 428 - "Feature Inventory Audit"
Cohesion: 0.29
Nodes (6): Feature Inventory Audit, How to run it, Output format, Rules, When to trigger, Why this matters

### Community 439 - "AntiGravityViz.tsx"
Cohesion: 0.40
Nodes (3): Anomaly, AntiGravityViz(), Packet

### Community 442 - "Global Rules"
Cohesion: 0.33
Nodes (5): Buttons & Components, Color Palette (Light Mode Default), Design System Master File (Satriano Atelier), Global Rules, Typography

### Community 443 - "Codebase Health Audit"
Cohesion: 0.33
Nodes (5): Codebase Health Audit, Output format, Rules, What to check (adapt sections to the actual stack), When to trigger

### Community 444 - "26. Site-Wide Dark/Light Theme System Specification & Technical Rules"
Cohesion: 0.33
Nodes (6): 1. Scope & Isolation Boundaries, 26. Site-Wide Dark/Light Theme System Specification & Technical Rules, 2. Default Theme Resolution Logic, 3. Comprehensive Theme Token Reference, 4. The Five Hard Development Rules, 5. Current Verification & Known Implementation Status

### Community 445 - "21. Add Wholesale Product Flow — Build & Production E2E Verification (Aug 2, 2026, evening)"
Cohesion: 0.33
Nodes (6): 21. Add Wholesale Product Flow — Build & Production E2E Verification (Aug 2, 2026, evening), Admin UI — `AddWholesaleProductModal.tsx`, API — `/api/admin/wholesale/products` (admin-JWT protected), Data model, Production E2E verification (9/9 assertions passed, zero residue), Unit tests

### Community 446 - "26. Site-Wide Dark/Light Theme System Specification & Technical Rules"
Cohesion: 0.33
Nodes (6): 1. Scope & Isolation Boundaries, 26. Site-Wide Dark/Light Theme System Specification & Technical Rules, 2. Default Theme Resolution Logic, 3. Comprehensive Theme Token Reference, 4. The Five Hard Development Rules, 5. Current Verification & Known Implementation Status

### Community 447 - "21. Add Wholesale Product Flow — Build & Production E2E Verification (Aug 2, 2026, evening)"
Cohesion: 0.33
Nodes (6): 21. Add Wholesale Product Flow — Build & Production E2E Verification (Aug 2, 2026, evening), Admin UI — `AddWholesaleProductModal.tsx`, API — `/api/admin/wholesale/products` (admin-JWT protected), Data model, Production E2E verification (9/9 assertions passed, zero residue), Unit tests

### Community 451 - "$type"
Cohesion: 0.07
Nodes (32): checkAdminAuth(), DELETE(), checkAdminAuth(), POST(), checkAdminAuth(), GET(), PATCH(), checkAdminAuth() (+24 more)

### Community 479 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 480 - "5. Admin Panel — Inventory"
Cohesion: 0.50
Nodes (4): 5. Admin Panel — Inventory, ❌ Missing, 🟡 Partial / pending, ✅ Working

### Community 481 - "5a. Admin UI Redesign (Aug 1, evening session)"
Cohesion: 0.50
Nodes (4): 5a. Admin UI Redesign (Aug 1, evening session), Completed:, Design tokens (admin-only, do not apply to `/`, `/configure`, `/portal`), Verification performed:

### Community 482 - "5. Admin Panel — Inventory"
Cohesion: 0.50
Nodes (4): 5. Admin Panel — Inventory, ❌ Missing, 🟡 Partial / pending, ✅ Working

### Community 483 - "5a. Admin UI Redesign (Aug 1, evening session)"
Cohesion: 0.50
Nodes (4): 5a. Admin UI Redesign (Aug 1, evening session), Completed:, Design tokens (admin-only, do not apply to `/`, `/configure`, `/portal`), Verification performed:

## Knowledge Gaps
- **347 isolated node(s):** `APPLICATION_TABS`, `SubItem`, `NavItem`, `NAV_ITEMS`, `TABS` (+342 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`, `account/page.tsx`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **Why does `react` connect `account/page.tsx` to `dependencies`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **What connects `APPLICATION_TABS`, `SubItem`, `NavItem` to the rest of the system?**
  _347 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `SupplierClient.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0786308973172988 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `SiteFooter.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14153846153846153 - nodes in this community are weakly interconnected._
- **Should `verifyAdminRequest` be split into smaller, more focused modules?**
  _Cohesion score 0.09254901960784313 - nodes in this community are weakly interconnected._