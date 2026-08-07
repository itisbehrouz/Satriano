# SATRIANO — READ-ONLY ARCHITECTURE & PRODUCT INTELLIGENCE EXTRACTION

> Master Product, UX, Business Workflow, and Technical Architecture Intelligence Document
>
> **Purpose:** This document is the consolidated source of truth for the Satriano platform. It combines the Client Portal, Admin Portal, M2O, Wholesale, Material, Order, Security, and operational architecture into one coherent model.
>
> **Inspection principle:** Current implementation claims must be distinguished from target/product architecture. Do not treat `PLANNED`, `MISSING`, or `CONCEPTUAL ONLY` capabilities as already implemented.

---

# 01. PRODUCT DEFINITION

## 1.1 What Satriano Is

Satriano Atelier is a B2B apparel manufacturing and wholesale platform operating two first-class commercial models inside one unified ecosystem:

1. **Made-to-Order (M2O)**
   - Customers configure garments.
   - Product bases, fits, sizes, materials, colors, logos, quantities, and other specifications are selected.
   - Satriano evaluates manufacturing feasibility.
   - A target price may be proposed by the customer.
   - Satriano locks the final commercial price.
   - A proforma is issued.
   - Approved and paid orders move into production and fulfillment.

2. **Wholesale**
   - Customers purchase already-made / ready-made products.
   - Products are stocked and sold by SKU.
   - Orders are based on available inventory and size breakdowns.
   - Wholesale is not limited to menswear.
   - Wholesale must support all relevant gender groups and age groups, including Men, Women, Unisex, Kids, Teen, Baby, and other future segments.
   - Wholesale therefore requires a broader product discovery and catalog architecture than the M2O garment catalog.

These are not two unrelated applications. They are two commercial workflows operating on a shared B2B account, order, payment, document, and fulfillment foundation.

## 1.2 Core Mental Model

```text
                         SATRIANO B2B PLATFORM
                                  |
              +-------------------+-------------------+
              |                                       |
          MADE-TO-ORDER                           WHOLESALE
              |                                       |
       Configure & Quote                         Select & Buy
              |                                       |
       Feasibility Review                      Stock Availability
              |                                       |
        Final Price Lock                       Fixed/Bulk Pricing
              |                                       |
           Proforma                              Checkout
              |                                       |
          Production                          Warehouse Dispatch
              |                                       |
              +-------------------+-------------------+
                                  |
                         UNIFIED CLIENT ACCOUNT
                                  |
                   +--------------+--------------+
                   |                             |
             Order History                 Documents / Payments
                   |                             |
             Status Tracking                Support / AI Desk
```

## 1.3 Product Principles

- M2O and Wholesale are both first-class.
- Wholesale must never be modeled as a menswear-only subsystem.
- `Material` is the domain concept; `Fabric` is only one possible material type.
- Material data can be highly detailed internally while remaining intentionally simple in customer-facing UI.
- Customer UI should expose only the material choices relevant to the selected product/component.
- Component-level and mixed materials are legitimate product configurations.
- Supplier identity, supplier contact data, cost price, and markup are confidential.
- Customer experience and operational experience are separate views over the same underlying commercial truth.
- Database richness must not force UI complexity.
- Existing implementation state must always be distinguishable from target architecture.

---

# 02. SYSTEM DOMAINS

## 2.1 Primary Domains

```text
SATRIANO
|
+-- Client Experience
|   +-- Discovery
|   +-- M2O Configurator
|   +-- Wholesale Catalog
|   +-- Checkout
|   +-- Portal
|   +-- Orders
|   +-- Account
|   +-- Support / AI Desk
|
+-- Admin Operations
|   +-- Dashboard
|   +-- Applications
|   +-- Orders
|   +-- Feasibility
|   +-- Catalog
|   +-- Materials
|   +-- Wholesale
|   +-- Suppliers
|   +-- Inventory
|   +-- Payments
|   +-- Production
|
+-- M2O Manufacturing
|   +-- Product Bases
|   +-- Fits
|   +-- Sizes
|   +-- Materials
|   +-- Components
|   +-- Colors
|   +-- Logos
|   +-- MOQ
|   +-- Pricing
|   +-- Feasibility
|
+-- Wholesale Commerce
|   +-- Product Catalog
|   +-- Gender
|   +-- Age Group
|   +-- Categories
|   +-- SKU
|   +-- Supplier
|   +-- Stock
|   +-- Size Matrix
|   +-- Pricing
|
+-- Shared Commercial Layer
    +-- Company
    +-- B2B Application
    +-- Order
    +-- OrderLine
    +-- Payment
    +-- Proforma
    +-- Notifications
```

---

# 03. CLIENT PORTAL

## 3.1 Client Portal Purpose

The Client Portal is the authenticated B2B workspace where an approved company can:

- manage company information;
- configure new M2O products;
- browse and purchase Wholesale products;
- review order history;
- inspect order specifications;
- review proformas;
- track order status;
- access support and AI assistance;
- manage account preferences.

The portal must not force M2O and Wholesale into the same UI pattern.

## 3.2 Client Navigation Model

Recommended target navigation:

```text
Portal
|
+-- Overview
|
+-- Made-to-Order
|   +-- Product Catalog
|   +-- Configurator
|   +-- Saved / Draft Configurations
|
+-- Wholesale
|   +-- All Products
|   +-- Categories
|   +-- Gender
|   +-- Age Group
|   +-- Stock
|   +-- Cart
|
+-- Orders
|   +-- All Orders
|   +-- Made-to-Order
|   +-- Wholesale
|
+-- Documents
|   +-- Proformas
|   +-- Invoices
|
+-- Account
|
+-- Support / AI Desk
```

The exact navigation can be simplified visually, but the underlying information architecture must preserve these distinctions.

## 3.3 Client Personas

| Persona | Commercial Capability | Status |
|---|---|---|
| Fashion Brand | M2O + Wholesale | IMPLEMENTED |
| Retailer | Wholesale + potential M2O | IMPLEMENTED |
| Corporate Buyer | M2O uniforms / corporate apparel | IMPLEMENTED |
| Distributor | Bulk Wholesale + possible M2O | PARTIALLY IMPLEMENTED |
| Wholesale Buyer | Ready-Made Wholesale | IMPLEMENTED |
| M2O Buyer | Configured production | IMPLEMENTED |
| Repeat B2B Customer | Reorder + history | IMPLEMENTED |
| New B2B Applicant | Application / onboarding | IMPLEMENTED |

These personas are commercial behaviors, not necessarily separate authentication roles.

---

# 04. CLIENT M2O EXPERIENCE

## 4.1 M2O Journey

```text
Discovery
   |
Product Base
   |
Product Configuration
   |
Material / Component Selection
   |
Color
   |
Fit
   |
Logo / Branding
   |
Size Breakdown
   |
MOQ Validation
   |
Target Price
   |
Submit
   |
Admin Feasibility Review
   |
Final Price
   |
Proforma
   |
Customer Approval
   |
Payment
   |
Production
   |
Shipment
```

## 4.2 Customer-Facing Material Principle

The customer must not see the internal material database structure.

Bad:

```text
Material Type
Supplier
Internal Grade
Supplier Code
Cost
Margin
MOQ
```

Preferred:

```text
Main Material
[ Wool ]

Blend
[ Wool 80% / Cashmere 20% ]

Lining
[ Viscose ]
```

For footwear:

```text
Upper Material
[ Genuine Leather ]

Alternative
[ Synthetic Leather ]

Lining
[ Leather ]

Sole
[ Rubber ]
```

The UI is product-contextual.

## 4.3 Material Selection Rules

- Only materials valid for the selected product/component should appear.
- Material selection should not expose irrelevant database records.
- Detailed internal material metadata remains admin/procurement data.
- Mixed materials are supported conceptually and should be represented explicitly.
- A single order line must not be assumed to have only one material.
- Material components should be modeled independently where the product requires it.

---

# 05. WHOLESALE ARCHITECTURE

## 5.1 Wholesale Is a First-Class Business Model

Wholesale is not an extension of the M2O catalog.

It has different:

- discovery behavior;
- product data;
- pricing;
- inventory logic;
- customer intent;
- checkout behavior;
- fulfillment model;
- merchandising requirements.

## 5.2 Wholesale Audience Dimensions

Wholesale must support:

### Gender

- Men
- Women
- Unisex
- Other future classifications

### Age Group

- Baby
- Kids
- Teen
- Adult
- Other future classifications

These dimensions must be first-class catalog attributes, not hard-coded UI labels.

## 5.3 Wholesale Product Taxonomy

```text
Wholesale
|
+-- Audience
|   +-- Gender
|   +-- Age Group
|
+-- Category
|   +-- Tops
|   +-- Bottoms
|   +-- Dresses
|   +-- Suits
|   +-- Outerwear
|   +-- Sportswear
|   +-- Loungewear
|   +-- Accessories
|   +-- Shoes
|   +-- Future Categories
|
+-- Product
|   +-- SKU
|   +-- Images
|   +-- Description
|   +-- Material
|   +-- Sizes
|   +-- Stock
|   +-- Price
|   +-- Supplier
|
+-- Commerce
    +-- Cart
    +-- Size Matrix
    +-- Bulk Pricing
    +-- Checkout
    +-- Order
```

## 5.4 Wholesale Discovery

Target filters:

- Gender
- Age Group
- Category
- Subcategory
- Size
- Material
- Price
- Stock availability
- SKU
- Search
- Collection / season where applicable

The interface should support multiple discovery paths instead of forcing one linear hierarchy.

## 5.5 Wholesale Product Detail

Customer-visible:

- Product name
- SKU
- Product images
- Product category
- Gender
- Age group
- Available sizes
- Available stock or stock status
- Wholesale price
- Bulk pricing where applicable
- Customer-relevant material information
- Shipping estimate
- Ordering constraints

Admin-only:

- Cost price
- Markup
- Supplier
- Supplier contact
- Supplier internal identifiers
- Procurement notes

## 5.6 Wholesale Cart

Wholesale requires a size-matrix ordering pattern.

Example:

```text
SKU: CY-1306-11

Size     Qty
XS        0
S         5
M        10
L        15
XL        8
XXL       2
----------------
Total    40
```

The cart should optimize for bulk ordering rather than consumer-style one-unit shopping.

## 5.7 Wholesale Fulfillment

Current implementation indicates ready-stock fulfillment and short warehouse dispatch.

Target architecture should support:

```text
Stock Available
   |
Reserve
   |
Payment / Commercial Confirmation
   |
Inventory Deduction
   |
Warehouse Pick
   |
Pack
   |
Ship
```

Automatic inventory deduction must be treated as a critical operational invariant.

---

# 06. ADMIN PORTAL

## 6.1 Admin Portal Purpose

The Admin Portal is Satriano's operational control center.

It manages:

- B2B applications;
- customer accounts;
- M2O feasibility;
- pricing;
- proformas;
- wholesale products;
- suppliers;
- inventory;
- catalog;
- materials;
- payments;
- production;
- shipment.

## 6.2 Admin Personas

Current implementation has a single administrative credential.

Target operational personas:

| Persona | Responsibility | Current State |
|---|---|---|
| Super Administrator | Full system control | IMPLEMENTED |
| Operations Manager | Orders / production | CONCEPTUAL |
| Sales / Feasibility | Pricing / feasibility | CONCEPTUAL |
| Catalog / Product Manager | Products / materials | CONCEPTUAL |
| Wholesale Manager | Products / suppliers / inventory | CONCEPTUAL |
| Finance Operator | Payments / commercial documents | CONCEPTUAL |

Granular RBAC is currently not implemented.

## 6.3 Admin Navigation

```text
Admin
|
+-- Dashboard
|
+-- Applications
|
+-- Customers / Companies
|
+-- Orders
|   +-- All
|   +-- M2O
|   +-- Wholesale
|   +-- Pending Review
|   +-- Production
|   +-- Shipped
|
+-- M2O
|   +-- Product Catalog
|   +-- Fits
|   +-- Materials
|   +-- Components
|   +-- MOQ
|   +-- Feasibility
|
+-- Wholesale
|   +-- Products
|   +-- Suppliers
|   +-- Inventory
|   +-- Pricing
|
+-- Finance
|   +-- Payments
|   +-- Proformas
|
+-- Production
|
+-- Settings
```

---

# 07. ADMIN ORDER OPERATIONS

## 7.1 Unified Order Model

Both commercial models use a shared order foundation:

```text
Order
|
+-- orderType = M2O
|   +-- Configured Product
|   +-- Materials
|   +-- Components
|   +-- MOQ
|   +-- Target Price
|   +-- Feasibility
|
+-- orderType = WHOLESALE
    +-- Ready-Made SKU
    +-- Stock
    +-- Size Breakdown
    +-- Fixed / Bulk Price
```

## 7.2 M2O Feasibility Desk

Admin must be able to evaluate:

- selected product;
- materials;
- component specifications;
- quantity;
- size breakdown;
- MOQ;
- target price;
- estimated price range;
- manufacturing constraints;
- logo / branding specifications.

The admin then determines:

```text
Feasible
   |
Final Price
   |
Proforma
```

or:

```text
Not Feasible
   |
Revision / Rejection
```

## 7.3 Wholesale Order Desk

Admin focuses on:

- SKU;
- available stock;
- size breakdown;
- commercial price;
- payment state;
- warehouse readiness;
- shipping.

Wholesale should not unnecessarily pass through the M2O feasibility workflow.

---

# 08. MATERIAL ARCHITECTURE

## 8.1 Domain Decision

The domain term is:

**Material**

not:

**Fabric**

Fabric remains a possible material subtype.

## 8.2 Material Type

Example conceptual taxonomy:

```text
Material
|
+-- Textile
|   +-- Wool
|   +-- Cotton
|   +-- Linen
|   +-- Silk
|   +-- Cashmere
|   +-- Blends
|
+-- Leather
|   +-- Genuine Leather
|   +-- Full Grain
|   +-- Suede
|   +-- Nubuck
|
+-- Synthetic
|   +-- Synthetic Leather
|   +-- Polyester
|   +-- Nylon
|   +-- Technical Synthetic
|
+-- Fur / Shearling
|
+-- Rubber
|
+-- Hardware
|
+-- Other
```

This is illustrative and should not become an unnecessary customer-facing taxonomy.

## 8.3 Database vs UI

### Database

Can contain:

- material type;
- material name;
- internal grade;
- supplier;
- supplier SKU;
- cost;
- price range;
- MOQ;
- technical properties;
- composition;
- certifications;
- availability;
- internal notes.

### Customer UI

Should contain only relevant selections:

- material name;
- composition where useful;
- grade only when commercially meaningful;
- component association.

## 8.4 Material Components

Products may contain multiple material components.

Example:

```text
Suit
|
+-- Main Body -> Wool
+-- Blend -> Cashmere
+-- Lining -> Viscose
+-- Buttons -> Horn / Resin
```

Footwear:

```text
Shoe
|
+-- Upper -> Genuine Leather
+-- Alternative Upper -> Synthetic Leather
+-- Lining -> Leather
+-- Sole -> Rubber
```

This requires a component-aware material architecture.

## 8.5 Mixed Material Rule

A product/order line can contain multiple materials.

Therefore:

```text
OrderLine
   |
   +-- MaterialAssignment
       +-- Component
       +-- Material
       +-- Composition / Ratio
       +-- Optional Customer Label
```

A single `fabricId` field is insufficient as the long-term architecture.

---

# 09. CATALOG ARCHITECTURE

## 9.1 M2O Catalog

M2O catalog is manufacturing-oriented.

Typical hierarchy:

```text
Category
   |
Subcategory
   |
Product Base
   |
Fits
   |
Size Systems
   |
Material Compatibility
```

## 9.2 Wholesale Catalog

Wholesale catalog is merchandising-oriented.

```text
Audience
   |
Gender / Age Group
   |
Category
   |
Product
   |
SKU
   |
Stock
```

M2O and Wholesale catalogs may share reusable taxonomy concepts but must not be forced into identical browsing behavior.

---

# 10. AUTHENTICATION & AUTHORIZATION

## 10.1 Client Authentication

Current architecture:

```text
B2B Application
   |
Email Verification
   |
Admin Approval
   |
Magic Link
   |
HttpOnly Customer JWT
   |
Portal
```

Current customer session uses `sat_customer_token`.

## 10.2 Admin Authentication

Current architecture:

```text
Admin Login
   |
ADMIN_ACCESS_KEY
   |
JWT
   |
HttpOnly sat_admin_token
   |
Middleware
   |
Admin Routes
```

## 10.3 RBAC Gap

Current admin system is effectively single-role.

Target architecture should introduce explicit permissions when the operational team grows.

Example:

```text
SUPER_ADMIN
OPERATIONS
SALES
CATALOG_MANAGER
WHOLESALE_MANAGER
FINANCE
PRODUCTION
```

Permissions should be domain-based rather than only page-based.

---

# 11. DATA VISIBILITY & SECURITY

## 11.1 Customer Visibility

Customer may see:

- own company data;
- own orders;
- own order specifications;
- customer-facing material information;
- final commercial price;
- proforma;
- payment status;
- fulfillment status;
- wholesale stock information intended for ordering.

Customer must not see:

- supplier identity;
- supplier contact;
- supplier cost;
- internal markup;
- procurement notes;
- internal feasibility notes;
- internal margin calculations.

## 11.2 Supplier Privacy Boundary

```text
                    SUPPLIER DATA
                         |
              +----------+----------+
              |                     |
          ADMIN UI              CUSTOMER API
              |                     |
             YES                    NO
```

This is a hard security boundary, not merely a UI convention.

---

# 12. ORDER STATE MACHINES

## 12.1 M2O

```text
DRAFT
  |
PENDING_REVIEW
  |
PROFORMA_SENT
  |
APPROVED
  |
PAID
  |
IN_PRODUCTION
  |
SHIPPED
```

Cancellation rules must be explicit and production-aware.

## 12.2 Wholesale

Wholesale should use a shorter commercial path where feasibility is unnecessary:

```text
CART
  |
ORDER_SUBMITTED
  |
COMMERCIAL_CONFIRMED / PAID
  |
RESERVED
  |
FULFILLMENT
  |
SHIPPED
```

The exact database state model may remain unified, but the UI must not imply M2O review for a ready-stock order.

## 12.3 B2B Application

```text
SUBMITTED
  |
UNDER_REVIEW
  |
APPROVED
```

or:

```text
UNDER_REVIEW
  |
REJECTED
```

---

# 13. PRICING ARCHITECTURE

## 13.1 M2O Pricing

M2O may contain:

- estimated price range;
- customer target price;
- final admin-approved price.

Target price is not automatically the final price.

## 13.2 Wholesale Pricing

Wholesale may contain:

- internal cost;
- markup;
- list wholesale price;
- negotiated/bulk price;
- discount.

Only customer-authorized commercial values are exposed to the client.

## 13.3 Price Boundary

```text
INTERNAL
Cost -> Margin -> Pricing Rules
          |
          v
CUSTOMER
Final / Offered Wholesale Price
```

---

# 14. PROFORMA & PAYMENT

## 14.1 Proforma

Current architecture includes:

- PDF generation;
- private storage;
- signed access;
- customer/admin authorization;
- fixed validity period.

## 14.2 Payment

Current architecture includes Stripe payment processing and webhook reconciliation.

Payment events must be idempotent.

For Wholesale, payment success must eventually drive stock reservation/deduction reliably.

---

# 15. CLIENT UX STATE MODEL

Every major client page should define:

- loading;
- empty;
- success;
- error;
- unauthorized;
- unavailable;
- pending;
- completed.

## 15.1 Portal

Examples:

```text
Unauthenticated
Email Sent
Pending Approval
Approved
Rejected
Session Expired
```

## 15.2 Orders

```text
Draft
Pending Review
Proforma Sent
Approved
Paid
In Production
Shipped
Cancelled
```

## 15.3 Wholesale

```text
In Stock
Low Stock
Out of Stock
Quantity Exceeds Stock
Cart Empty
Order Submitted
Payment Pending
Payment Complete
```

---

# 16. ADMIN UX STATE MODEL

Admin interfaces must optimize for operational throughput.

Important states:

- pending applications;
- pending feasibility;
- pricing required;
- proforma ready;
- payment received;
- production required;
- low stock;
- stock conflict;
- supplier unavailable;
- shipment pending;
- failed payment;
- failed webhook;
- unauthorized.

The dashboard should prioritize actions, not merely statistics.

---

# 17. AI ASSISTANT

Current AI Desk is a lightweight FAQ/discovery assistant.

Target direction:

```text
AI Procurement / Operations Assistant
|
+-- Product Questions
+-- Material Questions
+-- MOQ Questions
+-- Wholesale Questions
+-- Order Status
+-- Proforma Questions
+-- Shipping Questions
+-- Internal Admin Assistance
```

Customer and Admin AI must have separate knowledge boundaries.

Customer AI must never retrieve confidential supplier/cost data.

Admin AI may be authorized to retrieve operational data according to future RBAC.

---

# 18. TECHNICAL ROUTE MODEL

## 18.1 Client

```text
/
├── /categories
├── /categories/[categoryId]
├── /konfigurator/[productId]
├── /wholesale
├── /wholesale/[productId]
├── /wholesale/checkout
├── /proforma/[orderId]
└── /portal
    ├── /orders
    ├── /account
    ├── /support
    └── /verify-email
```

## 18.2 Admin

```text
/admin
├── /orders
├── /applications
├── /product-settings
├── /wholesale
│   ├── /suppliers
│   └── /inventory
└── /architecture-viz
```

These routes represent current implementation extracted from the supplied architecture reports; future redesign may reorganize URLs without changing domain boundaries.

---

# 19. CORE DATA MODEL DIRECTION

Conceptual long-term model:

```text
Company
  |
  +-- B2bApplication
  |
  +-- Orders
       |
       +-- OrderLines
            |
            +-- Product
            |
            +-- MaterialAssignments
            |     |
            |     +-- Material
            |     +-- Component
            |
            +-- SizeBreakdown
            +-- LogoSpecification
            +-- Pricing

WholesaleProduct
  |
  +-- Category
  +-- Gender
  +-- AgeGroup
  +-- Material
  +-- Supplier
  +-- WholesaleStock
```

---

# 20. CURRENT IMPLEMENTATION INTELLIGENCE

The following states are based on the supplied read-only extraction reports.

## Implemented / Existing

- B2B application flow
- Email verification
- Admin approval
- Customer magic-link authentication
- Admin authentication
- Client portal
- M2O configurator
- Wholesale catalog
- Wholesale size-matrix cart
- Unified Order model
- Proforma generation
- Payment integration
- Admin order management
- Admin application management
- Wholesale supplier management
- Wholesale inventory model
- Customer order history
- AI FAQ assistant
- Supplier privacy filtering

## Partially Implemented

- Distributor workflow
- Multi-material order-line support
- Wholesale bulk edit/delete
- Automatic inventory deduction
- Combined multi-material MOQ
- Admin command palette search
- Granular operational roles

## Database / API Only or Incomplete UI

- Material/fabric price-range management
- Combined material MOQ support
- Some catalog management capabilities

## Missing / Target Architecture

- Robust component-level MaterialAssignment model
- Full material domain replacing Fabric terminology
- Product-contextual material compatibility
- Wholesale gender and age-group architecture where not already modeled
- Full operational RBAC
- Mature production work-order system
- Supplier PO automation
- Robust wholesale reservation/deduction workflow

---

# 21. CRITICAL ARCHITECTURE GAPS

## P0 — Material Model

The current single-material assumption is not sufficient.

Required direction:

```text
Material
+
MaterialComponent
+
MaterialAssignment
```

## P0 — Wholesale Audience Model

Wholesale must not be structurally tied to menswear.

Required first-class dimensions:

```text
Gender
AgeGroup
```

## P0 — Security Boundary

Supplier/cost/markup data must remain strictly admin-only.

## P1 — RBAC

Introduce domain-based administrative permissions.

## P1 — Inventory Integrity

Wholesale payment/reservation/deduction must be idempotent and transactional.

## P1 — Product/Material Compatibility

Products should declare which materials are valid for which components.

## P2 — Production Work Orders

Generate structured factory-ready production specifications.

---

# 22. PRODUCT DECISIONS / NON-NEGOTIABLE RULES

1. Satriano is both M2O and Wholesale.
2. Wholesale is first-class.
3. Wholesale supports all gender and age groups.
4. Wholesale UX must not look like a menswear-only store.
5. `Material` replaces `Fabric` as the domain term.
6. Fabric is a material subtype.
7. Material data may be detailed internally.
8. Customer-facing material selection must remain simple.
9. Material selection must be contextual to the product/component.
10. Mixed materials are valid.
11. A single OrderLine must not be architecturally restricted to one material.
12. Supplier identity is confidential.
13. Supplier cost is confidential.
14. Supplier markup is confidential.
15. M2O requires feasibility; Wholesale normally does not.
16. M2O and Wholesale share commercial/account infrastructure but retain different UX workflows.
17. Database richness must not dictate customer UI complexity.
18. Current implementation status must never be confused with target architecture.

---

# 23. DESIGN / UI GOVERNANCE

## 23.1 Architecture Comes First

The system rules in this document are sufficient to define the target information architecture, data boundaries, workflows, and major UI responsibilities.

A UI screenshot is therefore not required to decide:

- what Wholesale is;
- which personas exist;
- what Material means;
- what data is confidential;
- how M2O differs from Wholesale;
- which workflow belongs to Client vs Admin.

## 23.2 Existing UI Is Still Valuable

Existing UI/screenshots should be reviewed before redesigning the actual interface because they can reveal:

- useful existing patterns;
- accidental complexity;
- inconsistent terminology;
- spacing and hierarchy problems;
- duplicated workflows;
- missing states;
- navigation problems;
- visual debt;
- components worth preserving.

Therefore:

**Architecture rules define what the system must do. Existing UI evidence helps determine how the redesigned system should do it well.**

## 23.3 UI Review Rule

Do not preserve an existing UI simply because it already exists.

Evaluate it against this document.

```text
Existing UI
    |
    v
Does it match Product Architecture?
    |
 +--+--+
 |     |
 YES   NO
 |     |
Keep   Redesign
```

---

# 24. RECOMMENDED CLIENT PORTAL TARGET MODEL

```text
CLIENT PORTAL
|
+-- Overview
|
+-- M2O
|   +-- Discover
|   +-- Configure
|   +-- Drafts
|
+-- Wholesale
|   +-- Discover
|   +-- Filter
|   +-- Product
|   +-- Size Matrix
|   +-- Cart
|
+-- Orders
|   +-- M2O
|   +-- Wholesale
|   +-- Status
|
+-- Documents
|
+-- Account
|
+-- Support
```

The portal should make the distinction between:

**"I want you to manufacture this for me"**

and

**"I want to buy products you already have."**

immediately obvious.

---

# 25. RECOMMENDED ADMIN TARGET MODEL

```text
ADMIN OPERATIONS
|
+-- Command Center
|
+-- Customer Operations
|   +-- Applications
|   +-- Companies
|
+-- Order Operations
|   +-- M2O
|   +-- Wholesale
|
+-- Product & Material
|   +-- M2O Products
|   +-- Materials
|   +-- Fits
|   +-- Sizes
|
+-- Wholesale
|   +-- Products
|   +-- Suppliers
|   +-- Inventory
|   +-- Pricing
|
+-- Finance
|
+-- Production
|
+-- System
```

The Admin dashboard should be action-oriented:

```text
WHAT NEEDS ATTENTION?
WHAT IS BLOCKED?
WHAT IS LATE?
WHAT REQUIRES A DECISION?
WHAT IS AT RISK?
```

not merely:

```text
HOW MANY RECORDS EXIST?
```

---

# 26. FINAL SYSTEM ARCHITECTURE

```text
                                SATRIANO
                                   |
              +--------------------+--------------------+
              |                                         |
          CLIENT SIDE                              ADMIN SIDE
              |                                         |
     +--------+--------+                     +----------+----------+
     |                 |                     |          |          |
    M2O            WHOLESALE              Orders   Catalog    Operations
     |                 |                     |          |          |
 Configurator       Catalog               M2O/WH     Material   Suppliers
     |              Size Matrix               |        Product    Inventory
 Material           Cart                     |          |          |
 Component          Checkout                 |          |          |
     |                 |                     +----------+----------+
     +--------+--------+                                |
              |                                          |
              +------------------+-----------------------+
                                 |
                         UNIFIED COMMERCIAL CORE
                                 |
             +-------------------+-------------------+
             |                   |                   |
          Company              Order              Payment
             |                   |                   |
        B2B Application      OrderLine          Proforma
                                 |
                      Material Assignments
                                 |
                         Production / Shipping
```

---

# 27. SOURCE-OF-TRUTH RULE

This document should be treated as the master product/architecture reference for future redesign work.

When another prompt, design, component, or implementation conflicts with this document:

1. Identify whether the conflict is with current implementation or target architecture.
2. Do not silently change a business rule.
3. Update this document when a product decision changes.
4. Generate Client Portal, Admin Portal, M2O, and Wholesale design prompts from this master model.
5. Never let a UI implementation redefine the business model accidentally.

---

# 28. IMPLEMENTATION CLASSIFICATION LEGEND

| State | Meaning |
|---|---|
| IMPLEMENTED | Verified as existing in the supplied code/intelligence extraction |
| PARTIALLY IMPLEMENTED | Some supporting implementation exists but the capability is incomplete |
| API ONLY | Backend/API support exists without complete UI |
| DATABASE ONLY | Schema/data support exists without complete application behavior |
| PLANNED | Explicitly identified as future work |
| MISSING | Required capability is not currently implemented |
| CONCEPTUAL ONLY | Business concept exists but technical implementation is absent |
| UNKNOWN | Insufficient evidence to verify implementation |

---

# 29. MASTER REDESIGN PRINCIPLE

The next redesign should not be approached as:

> "Make the existing pages look better."

It should be approached as:

> "Design the correct B2B operating system for Satriano, using the existing implementation as evidence rather than as a constraint."

The final experience should make the business model understandable within seconds:

```text
SATRIANO
|
+-- MADE-TO-ORDER
|   Configure -> Review -> Price -> Produce -> Ship
|
+-- WHOLESALE
    Browse -> Select -> Order -> Dispatch
```

Everything else — Client Portal, Admin Portal, Material architecture, catalog, pricing, inventory, payments, production, and AI assistance — should reinforce this distinction while remaining part of one unified platform.
