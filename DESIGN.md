# Satriano Atelier Design System

## Visual Theme & Atmosphere

Satriano Atelier is a B2B made-to-order manufacturing portal, not a luxury boutique storefront. The target audience spans a wide price range of B2B buyers, so the interface must read as a **reliable, no-nonsense industrial supplier** — competent and trustworthy, never precious or exclusive. Pricing is never hidden or gated behind "request a quote" — it is visible at every step. The information density should feel like a well-run operations panel: dense but organized, not a spacious editorial gallery.

The brand's real identity mark uses a muted gold (`#DBB671`, confirmed from the logo file) set in a serif display face (Baskerville) — but this is a logotype treatment only. It is not licence to bring serif type, heavy gold, or a boutique feel into the product UI. In the interface, gold appears only as a small, deliberate accent tied to the logo/brand — never as a large fill, a button color used everywhere, or a background. The bulk of the UI stays neutral and functional; gold is a signature, not wallpaper.

## Color Palette & Roles

Two modes are supported. Both share the same role logic: neutral page/surface, navy as the brand block (header/footer), blue as the everyday interactive accent, and gold reserved strictly for the logo mark and rare "signature" moments (e.g. a featured badge, the logo lockup, an active tab underline) — never for full buttons, large fills, or backgrounds.

### Light mode
| Role | Hex | Usage |
|---|---|---|
| `bg-page` | `#F5F7FA` | Page canvas (cool neutral, never warm cream) |
| `surface` | `#FFFFFF` | Cards, panels — 1px border, no shadow |
| `header` | `#0B1E3D` | Header/nav bar, footer — brand navy block |
| `accent` | `#2E5AAC` | Buttons, links, selected states, focus rings |
| `brand-mark` | `#DBB671` | Logo only, plus rare signature accents (badge, active underline) — max one small use per screen |
| `text-primary` | `#1A2233` | Main text |
| `text-secondary` | `#5B6B85` | Secondary text, labels |
| `text-on-header` | `#E8ECF3` | Text on the navy header/footer |
| `success` | `#0F6E56` on bg `#E1F5EE` | "paid", "approved" |
| `warning` | `#854F0B` on bg `#FAEEDA` | "quote pending" |
| `info` | `#185FA5` on bg `#E6F1FB` | "in production" |
| `error` | `#A32D2D` on bg `#FCEBEB` | cancelled/failed |

### Dark mode
| Role | Hex | Usage |
|---|---|---|
| `bg-page` | `#0B1E3D` | Page canvas — the brand navy, used as the dark background |
| `surface` | `#132A52` | Cards, panels — one step lighter than bg-page |
| `header` | `#081733` | Header/nav bar, footer — one step darker than bg-page |
| `accent` | `#5B8AD6` | Buttons, links, selected states (lightened blue for dark-bg contrast) |
| `brand-mark` | `#DBB671` | Logo only, plus rare signature accents — same restrained rule as light mode |
| `text-primary` | `#E8ECF3` | Main text (off-white) |
| `text-secondary` | `#8DA0C4` | Secondary text, labels |
| `success` | `#5DCAA5` on bg `#14301F` | "paid", "approved" |
| `warning` | `#F0B94A` on bg `#3A2E14` | "quote pending" |
| `info` | `#85B7EB` on bg `#132A52` | "in production" |
| `error` | `#E0605C` on bg `#3A1616` | cancelled/failed |

Do not introduce any gold beyond `brand-mark`'s single restrained role. Never use gold as a button fill, a large background, or a repeated decorative element — that reintroduces the luxury/boutique read this system is built to avoid.

## Typography Rules

Product UI uses two type roles only — the logo's serif (Baskerville) stays confined to the logo lockup and is never used for UI text:

- **Headline** — a geometric, industrial-feeling sans-serif (Inter or Manrope). Weight 500–600.
- **Body** — a neutral, highly readable sans-serif (Inter). Weight 400 for body copy, 500 for emphasis.
- **Numeric / price** — tabular (aligned) figures mandatory for all prices and quantities.

Levels:
| Level | Size | Weight | Use |
|---|---|---|---|
| headline-lg | 28px | 500 | Page titles |
| headline-md | 20px | 500 | Section headers, card titles |
| headline-sm | 16px | 500 | Sub-section labels |
| body-md | 15px | 400 | Default body text |
| body-sm | 13px | 400 | Secondary/supporting text |
| label | 12px | 500 | Field labels, eyebrow text |
| price-lg | 24px | 500, tabular-nums | Live price total |

## Component Stylings

- **Logo lockup**: the only place Baskerville + gold (`brand-mark`) appear together, exactly as in the source logo file. Treat it as a fixed asset, not a style to extend.
- **Buttons**: one filled `accent` button per view for the primary action; everything else outline/ghost. No gradients, no drop shadows. Gold is never a button fill.
- **Status badges**: pill-shaped, color-coded per the roles above.
- **Size selector**: fixed chip/dropdown of admin-defined producible sizes. No free-text measurement input.
- **Live price panel**: a persistent `surface` card with a 1px `accent`-tinted border, always visible, updates immediately.
- **Cards**: `surface` background, 8–12px radius, flat with a 1px border — no shadow.
- **Header/footer**: solid `header` color block — this, plus the small logo mark, is where the brand identity shows.
- **Admin tables**: dense row-based tables, optimized for scanning.

## Layout Principles

- Dense, aligned grids over generous whitespace — an operational tool, not a gallery.
- Pricing and status are always visible, never gated behind a click.
- The configurator keeps the live price summary anchored (side panel desktop / sticky bottom bar mobile).
- Admin views prioritize scannability: filters, sortable columns, compact rows.

## Depth & Elevation

Flat surfaces only, in both modes. Depth comes from the `bg-page` → `surface` step plus a 1px border, never shadows, blur, or glassmorphism — those read as premium polish and conflict with the brand's positioning.

## Do's & Don'ts

**Do:**
- Keep pricing visible and prominent at all times.
- Use color only where it carries status meaning, or for the single restrained `brand-mark` use.
- Use tabular numerals for all prices and quantities.
- Keep size selection to a fixed, admin-managed list.
- Treat the logo file as fixed — don't restyle its serif/gold treatment into the rest of the UI.

**Don't:**
- Don't expand gold beyond the logo and one small signature accent per screen.
- Don't use serif type anywhere outside the logo lockup.
- Don't use a warm cream/ivory background — keep it cool neutral.
- Don't add large empty "editorial" whitespace sections.
- Don't allow free-text measurement/size entry.
- Don't use shadows, gradients, or glassmorphism for a premium feel.

## Responsive Behavior

- **Mobile**: configurator stacks vertically; live price panel collapses into a sticky bottom bar with running total + primary CTA.
- **Tablet**: two-column configurator (form + price panel) once viewport allows.
- **Admin tables**: condensed column set on narrow viewports (order id, customer, status, total), rest via row expand — no horizontal scroll.
