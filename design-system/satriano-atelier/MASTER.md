# Design System Master File (Satriano Atelier)

> **Source of truth:** `/DESIGN.md` (project root) — *"Industrial Supplier B2B Portal"*, updated 2026-07-30.

---

**Project:** Satriano Atelier  
**Category:** B2B Custom Manufacturing & Wholesale Portal  
**Theme:** Reliable, Industrial Operations Panel (Cool neutral canvas `#F5F7FA`, Navy Header `#0B1E3D`, Accent Blue `#2E5AAC`, Logo Gold `#DBB671`)  

---

## Global Rules

### Color Palette (Light Mode Default)

| Role | Hex / Tailwind | Notes |
|------|----------------|-------|
| `bg-page` | `#F5F7FA` | Page canvas (cool neutral, never warm cream) |
| `surface` | `#FFFFFF` | Cards, panels — 1px border, no shadow |
| `header` / `footer` | `#0B1E3D` | Brand navy block |
| `accent` | `#2E5AAC` | Primary buttons, links, selected states, focus rings |
| `brand-mark` | `#DBB671` | Muted logo gold — **LOGO ONLY**, max 1 small signature accent per screen |
| `text-primary` | `#1A2233` | Main body & headline text |
| `text-secondary` | `#5B6B85` | Secondary text, labels |
| `text-on-header` | `#E8ECF3` | Text on navy header/footer |
| `success` | `#0F6E56` on `#E1F5EE` | Status: "paid", "approved" |
| `warning` | `#854F0B` on `#FAEEDA` | Status: "proforma_sent" / pending |
| `info` | `#185FA5` on `#E6F1FB` | Status: "in_production" |
| `error` | `#A32D2D` on `#FCEBEB` | Status: "cancelled" / error |

**Gold Restraint Rule:** Never use gold `#DBB671` as a button fill, large background, or repeated decoration. Accent blue `#2E5AAC` is the primary action color.

### Typography

- **Font Family:** `Inter` (sans-serif only across all UI)
- **Serif (Baskerville):** Confined strictly to the logo lockup text, never used in product UI headings or copy.
- **Tabular Numerals:** `tabular-nums` mandatory for all prices, quantities, and financial numbers.

### Buttons & Components

- **Primary Button:** Filled `accent` blue (`#2E5AAC`) with white text (`#FFFFFF`).
- **Secondary Button:** Outline with border `#D1D5DB` or ghost link.
- **Status Badges:** Pill-shaped (`rounded-full`), color-coded by role.
- **Cards:** White surface (`#FFFFFF`), `rounded-lg` (8–12px), 1px border (`#E5E7EB`). Flat — no shadows or blur.
