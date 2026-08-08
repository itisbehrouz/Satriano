# Satriano Atelier B2B Platform

Satriano Atelier is a B2B Made-to-Order e-commerce and workflow automation platform. This portal serves as a multi-category product catalog and ordering system tailored for B2B buyers. It allows for product configuration, generates proforma invoices, and processes payments seamlessly.

## Features

- **Multi-Category Catalog:** Browse through 7 main product groups (Tops, Bottoms, Outerwear, Formalwear, Activewear, Underwear & Loungewear, Accessories) and their subcategories.
- **Product Configuration:** Configure products by selecting from admin-defined sizes and materials.
- **File Upload:** Upload logo or vector files for custom orders via Supabase Storage.
- **Automated Proforma Invoices:** Automatically calculates prices and generates PDF proforma invoices sent directly to the customer.
- **Seamless Payments:** Integrated with Stripe for domestic and international card payments.
- **Admin Panel:** Built-in administration route for managing categories, products, sizes, pricing, and order statuses.
- **Design System:** Clean, industrial-feeling UI optimized for high information density and reliable B2B operations.

## Technology Stack

- **Framework:** Next.js (React) App Router
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (Logo/Vector files)
- **PDF Generation:** pdf-lib
- **Email:** Nodemailer
- **Payments:** Stripe
- **Styling:** Tailwind CSS

## Getting Started

First, make sure you have your environment variables set up correctly, primarily for Supabase and Stripe.

Install the dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture & Data Model

The application uses a streamlined workflow without a traditional multi-item cart. Each order corresponds to a single product configuration.

Key entities include:
- `categories`: Main groups and subcategories.
- `products`: Featured pieces with base prices, material options, and available sizes.
- `orders`: Tracks the full lifecycle from configuration and proforma generation to payment and production.

For more details on the architecture and roadmap, refer to `satriano-atelier-roadmap.md`. For UI/UX principles, see `DESIGN.md`.

## License

This project is private and intended for authorized B2B operations only.
