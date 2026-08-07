# Graph Report - Satriano Atelier  (2026-08-07)

## Corpus Check
- 239 files · ~1,462,839 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 884 nodes · 1380 edges · 89 communities (74 shown, 15 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `32c2baa6`
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
- products/[id]/route.ts
- api/upload/route.ts
- ConfiguratorSuccess.tsx
- seed-core-colors.ts
- AIFaqAssistantModal.tsx
- seed-pilot-colors.ts
- architecture-viz/page.tsx
- B2BSupportDock.tsx

## God Nodes (most connected - your core abstractions)
1. `verifyAdminRequest()` - 35 edges
2. `SiteFooter()` - 16 edges
3. `compilerOptions` - 16 edges
4. `formatCents()` - 15 edges
5. `SiteHeader()` - 13 edges
6. `verifyCustomerToken()` - 13 edges
7. `useAdminAuth()` - 11 edges
8. `useAdminLanguage()` - 10 edges
9. `verifyCustomerRequest()` - 10 edges
10. `useCustomerSession()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `ApplicationsContent()` --calls--> `useAdminAuth()`  [EXTRACTED]
  app/admin/applications/page.tsx → components/admin/AdminAuthContext.tsx
- `AdminOrdersContent()` --calls--> `useAdminAuth()`  [EXTRACTED]
  app/admin/orders/page.tsx → components/admin/AdminAuthContext.tsx
- `ProductSettingsContent()` --calls--> `useAdminAuth()`  [EXTRACTED]
  app/admin/product-settings/page.tsx → components/admin/AdminAuthContext.tsx
- `PATCH()` --calls--> `verifyAdminRequest()`  [EXTRACTED]
  app/api/admin/catalog/route.ts → lib/adminAuth.ts
- `POST()` --calls--> `verifyAdminRequest()`  [EXTRACTED]
  app/api/admin/catalog/upload/route.ts → lib/adminAuth.ts

## Import Cycles
- None detected.

## Communities (89 total, 15 thin omitted)

### Community 0 - "Route Post() Get()"
Cohesion: 0.07
Nodes (32): checkAdminAuth(), DELETE(), checkAdminAuth(), POST(), checkAdminAuth(), GET(), PATCH(), checkAdminAuth() (+24 more)

### Community 1 - "Page Default Size"
Cohesion: 0.05
Nodes (49): POST(), createdCompanyIds, postOrders(), ColorPicker(), ColorPickerProps, ColorSizeMatrix(), ColorSizeMatrixProps, ConfiguratorClient() (+41 more)

### Community 2 - "@types @testing Library"
Cohesion: 0.06
Nodes (35): dotenv, eslint, eslint-config-next, jsdom, devDependencies, dotenv, eslint, eslint-config-next (+27 more)

### Community 3 - "Page Metadata Categoryoption"
Cohesion: 0.08
Nodes (31): metadata, metadata, ProductImageItem, ProductImageUploader(), ProductImageUploaderProps, AddWholesaleProductModal(), AddWholesaleProductModalProps, CategoryOption (+23 more)

### Community 4 - "Route Post() Get()"
Cohesion: 0.09
Nodes (34): POST(), DELETE(), PATCH(), GET(), POST(), DELETE(), GET(), PATCH() (+26 more)

### Community 5 - "Sizeoption Sizesystem Category"
Cohesion: 0.05
Nodes (45): Category, Fabric, FitDef, Product, ProductSettingsContent(), SizeOption, SizeSystem, slugify() (+37 more)

### Community 6 - "Page Admin Tabs"
Cohesion: 0.05
Nodes (42): APPLICATION_TABS, ApplicationsContent(), AdminChrome(), getNavItems(), GlobalCommandPalette, NavItem, SubItem, AdminOrdersContent() (+34 more)

### Community 7 - "Wholesale Admin Page"
Cohesion: 0.08
Nodes (24): metadata, AddColorVariantModal(), AddColorVariantModalProps, AdminWholesaleClient(), InventoryEditModal(), InventoryEditModalProps, ColorVariant, InventoryProduct (+16 more)

### Community 8 - "@prisma Three Cmdk"
Cohesion: 0.04
Nodes (46): cmdk, jose, next, nodemailer, dependencies, cmdk, jose, next (+38 more)

### Community 9 - "Portal Orders Portaldashboard.test"
Cohesion: 0.12
Nodes (19): CustomerOrder, CustomerOrderLine, CompanyCard(), CompanyCardProps, QuickActionButtons(), QuickLinksSection(), RecentOrdersSection(), RecentOrdersSectionProps (+11 more)

### Community 10 - "Page React Account"
Cohesion: 0.10
Nodes (19): AccountPage(), ProformaPage(), ProformaPageProps, TransactionalHeader(), mockPush, BillingTab(), CompanyInfoTab(), CompanyInfoTabProps (+11 more)

### Community 11 - ".next Types Dom"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 12 - "Orders Api Route"
Cohesion: 0.25
Nodes (4): CatalogProductItem, GlobalCommandPalette(), GlobalCommandPaletteProps, OrderSummaryItem

### Community 13 - "Page Sections Terms"
Cohesion: 0.15
Nodes (9): SECTIONS, SECTIONS, SECTIONS, SECTIONS, SECTIONS, LEGAL_DOCUMENTS, LegalPageShell(), LegalPageShellProps (+1 more)

### Community 14 - "Proforma Route Post()"
Cohesion: 0.33
Nodes (6): POST(), createdCompanyIds, postProforma(), sendProformaEmail(), generateProformaPdf(), ProformaPdfData

### Community 16 - "Page Ethics Ethicspage()"
Cohesion: 0.15
Nodes (7): CATEGORY_IMAGES, PageProps, ANONYMOUS_NAV_ITEMS, AUTHENTICATED_NAV_ITEMS, SiteHeader(), AccountDropdown(), AccountDropdownProps

### Community 17 - "App Layout Baskervville"
Cohesion: 0.18
Nodes (9): baskervville, inter, metadata, viewport, AIFaqAssistantModal, B2BSupportDock, ClientLayoutModals(), CookieConsentModal (+1 more)

### Community 18 - "App Wholesale Page"
Cohesion: 0.20
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
Cohesion: 0.33
Nodes (4): CategoriesSearchFilter(), Category, CATEGORY_IMAGES, Subcategory

### Community 24 - "Links Cookieconsentmodal Cookiecategorystate"
Cohesion: 0.27
Nodes (6): ProductConfiguratorPageProps, SiteFooter(), PortalHeader(), PortalHeaderProps, CustomerSession, useCustomerSession()

### Community 25 - "App Page Capabilities"
Cohesion: 0.14
Nodes (12): CheckoutClient(), metadata, ConfiguratorSuccessPage(), mockPush, GuestLoginModal(), GuestLoginModalProps, addToM2OCart(), clearM2OCart() (+4 more)

### Community 26 - "Roadmap Architecture Satriano"
Cohesion: 0.48
Nodes (7): 1. Catalog Architecture, 2. Pricing Model, 3. Production Infrastructure, Product dimensions:, Satriano Atelier — MVP Architecture & Roadmap (Consolidated, as of August 2, 2026 — Theme System & Full Roadmap Consolidation), Satriano Atelier — MVP Architecture & Roadmap (Consolidated, as of August 2, 2026 — Theme System & Full Roadmap Consolidation), Satriano Atelier — MVP Architecture & Roadmap (Consolidated, as of August 2, 2026 — Theme System & Full Roadmap Consolidation)

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

### Community 83 - "products/[id]/route.ts"
Cohesion: 0.16
Nodes (9): PortalView, AtelierLogo(), AtelierLogoProps, CookieCategoryState, OpenCookiePreferencesButton(), TabType, LEGAL_COMPLIANCE_LINKS, NAVIGATION_LINKS (+1 more)

### Community 88 - "seed-core-colors.ts"
Cohesion: 0.33
Nodes (4): adapter, CORE_PALETTE, pool, prisma

### Community 89 - "AIFaqAssistantModal.tsx"
Cohesion: 0.50
Nodes (4): AIFaqAssistantModal(), ChatMessage, FAQ_KNOWLEDGE_BASE, PRESET_QUESTIONS

### Community 90 - "seed-pilot-colors.ts"
Cohesion: 0.40
Nodes (3): adapter, pool, prisma

## Knowledge Gaps
- **281 isolated node(s):** `APPLICATION_TABS`, `AntiGravityViz`, `GlobalCommandPalette`, `SubItem`, `NavItem` (+276 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatCents()` connect `Page React Account` to `App Page Capabilities`, `Page Admin Tabs`, `Page Default Size`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **Why does `dependencies` connect `@prisma Three Cmdk` to `Page React Account`?**
  _High betweenness centrality (0.113) - this node is a cross-community bridge._
- **What connects `APPLICATION_TABS`, `AntiGravityViz`, `GlobalCommandPalette` to the rest of the system?**
  _281 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Route Post() Get()` be split into smaller, more focused modules?**
  _Cohesion score 0.06966618287373004 - nodes in this community are weakly interconnected._
- **Should `Page Default Size` be split into smaller, more focused modules?**
  _Cohesion score 0.052943354313217325 - nodes in this community are weakly interconnected._
- **Should `@types @testing Library` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `Page Metadata Categoryoption` be split into smaller, more focused modules?**
  _Cohesion score 0.0786308973172988 - nodes in this community are weakly interconnected._