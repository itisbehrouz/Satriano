import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting Satriano Atelier 3-Level Catalog DB Seeding...");

  // 1. Seed Size Systems & Options
  const sizeSystemDefs = [
    { name: "Alpha", region: "EU", labels: ["XS", "S", "M", "L", "XL", "2XL", "3XL"] },
    { name: "Alpha", region: "US", labels: ["XS", "S", "M", "L", "XL", "2XL", "3XL"] },
    { name: "Waist", region: "EU", labels: ["44", "46", "48", "50", "52", "54", "56", "58", "60"] },
    { name: "Waist", region: "US", labels: ["28", "30", "32", "34", "36", "38", "40", "42"] },
    { name: "Chest", region: "EU", labels: ["44", "46", "48", "50", "52", "54", "56", "58", "60"] },
    { name: "Chest", region: "US", labels: ["34", "36", "38", "40", "42", "44", "46", "48", "50"] },
    { name: "Shoe", region: "EU", labels: ["39", "40", "41", "42", "43", "44", "45", "46"] },
    { name: "Shoe", region: "US", labels: ["7", "8", "9", "10", "11", "12", "13"] },
    { name: "OneSize", region: "EU", labels: ["One Size"] },
    { name: "OneSize", region: "US", labels: ["One Size"] },
  ];

  const createdSystems: Record<string, string> = {};

  for (const sys of sizeSystemDefs) {
    const existing = await prisma.sizeSystem.findFirst({
      where: { name: sys.name, region: sys.region },
    });

    const sizeSys =
      existing ??
      (await prisma.sizeSystem.create({
        data: {
          name: sys.name,
          region: sys.region,
          options: {
            create: sys.labels.map((label, idx) => ({
              label,
              sortOrder: idx,
            })),
          },
        },
      }));

    createdSystems[`${sys.name}_${sys.region}`] = sizeSys.id;
  }

  // 2. 3-Level Catalog Structure: Category -> Subcategory -> Product
  const catalog = [
    {
      name: "Tops",
      slug: "tops",
      description: "Shirts, Polo Shirts, Sweaters, T-Shirts & Hoodies",
      sortOrder: 1,
      imageUrl: "/images/catalog/tops.png",
      subcategories: [
        {
          name: "Shirts",
          slug: "shirts",
          description: "Formal Dress Shirts, Casual Shirts & Breathable Linen Shirts.",
          imageUrl: "/images/subcategories/tops-shirts.png",
          systems: ["Alpha_EU", "Alpha_US"],
          products: [
            {
              name: "Dress Shirt",
              slug: "dress-shirt",
              description: "Crisp Oxford & Fine Poplin Tailored Formal Dress Shirt.",
              imageUrl: "/images/subcategories/tops-shirts.png",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "Italian Poplin Cotton (120/2)", priceMinCents: 2200, priceMaxCents: 2800, setupFeeCents: 15000 },
                { name: "Royal Twill Oxford", priceMinCents: 2500, priceMaxCents: 3200, setupFeeCents: 15000 },
              ],
            },
            {
              name: "Casual Shirt",
              slug: "casual-shirt",
              description: "Relaxed Fit Cotton & Chambray Button-Down Casual Shirt.",
              imageUrl: "/images/subcategories/tops-shirts.png",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "Washed Cotton Chambray", priceMinCents: 1900, priceMaxCents: 2400, setupFeeCents: 15000 },
              ],
            },
            {
              name: "Linen Shirt",
              slug: "linen-shirt",
              description: "100% Normandy Linen Resort & Summer Shirt.",
              imageUrl: "/images/subcategories/tops-shirts.png",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "French Washed Linen", priceMinCents: 2600, priceMaxCents: 3400, setupFeeCents: 15000 },
              ],
            },
          ],
        },
        {
          name: "Polo Shirts",
          slug: "polos",
          description: "Classic Pique Cotton & Performance Blend Polo Shirts.",
          imageUrl: "/images/subcategories/tops-polos.png",
          systems: ["Alpha_EU", "Alpha_US"],
          products: [
            {
              name: "Classic Polo Shirt",
              slug: "classic-polo-shirt",
              description: "Bespoke Pique & Organic Cotton Short Sleeve Polo Shirt.",
              imageUrl: "/images/subcategories/tops-polos.png",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 },
                { name: "Organic Cotton", priceMinCents: 1900, priceMaxCents: 2400, setupFeeCents: 15000 },
                { name: "Performance Jersey", priceMinCents: 2200, priceMaxCents: 2700, setupFeeCents: 15000 },
              ],
            },
            {
              name: "Pique Polo Shirt",
              slug: "pique-polo-shirt",
              description: "Heavyweight Textured Pique Polo with Ribbed Collar.",
              imageUrl: "/images/subcategories/tops-polos.png",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "Heavyweight Pique Cotton", priceMinCents: 1600, priceMaxCents: 2100, setupFeeCents: 15000 },
              ],
            },
            {
              name: "Performance Polo",
              slug: "performance-polo-shirt",
              description: "Moisture-Wicking & Anti-Odor Athletic Polo Shirt.",
              imageUrl: "/images/subcategories/tops-polos.png",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "Technical Poly-Spandex Blend", priceMinCents: 2100, priceMaxCents: 2600, setupFeeCents: 15000 },
              ],
            },
          ],
        },
        {
          name: "Knitwear",
          slug: "knitwear",
          description: "Fine Merino Wool, Cashmere & Cotton Sweaters & Cardigans.",
          imageUrl: "/images/subcategories/tops-sweaters.png",
          systems: ["Alpha_EU", "Alpha_US"],
          products: [
            {
              name: "Crewneck Sweater",
              slug: "crewneck-sweater",
              description: "Fine Gauge Merino Wool Pullover Sweater.",
              imageUrl: "/images/subcategories/tops-sweaters.png",
              leadTimeDays: 18,
              moq: 50,
              fabrics: [
                { name: "Extra-Fine Merino Wool", priceMinCents: 3200, priceMaxCents: 4200, setupFeeCents: 20000 },
              ],
            },
            {
              name: "Turtleneck Sweater",
              slug: "turtleneck-sweater",
              description: "Cashmere Blend Roll-Neck Knitwear.",
              imageUrl: "/images/subcategories/tops-sweaters.png",
              leadTimeDays: 18,
              moq: 50,
              fabrics: [
                { name: "Cashmere Cotton Knit", priceMinCents: 4500, priceMaxCents: 5800, setupFeeCents: 20000 },
              ],
            },
            {
              name: "Knitted Cardigan",
              slug: "knitted-cardigan",
              description: "Button-Front Ribbed Knit Cardigan Jacket.",
              imageUrl: "/images/subcategories/tops-sweaters.png",
              leadTimeDays: 18,
              moq: 50,
              fabrics: [
                { name: "Heavy Lambswool Blend", priceMinCents: 3800, priceMaxCents: 4900, setupFeeCents: 20000 },
              ],
            },
          ],
        },
        {
          name: "T-Shirts",
          slug: "t-shirts",
          description: "Heavyweight Crewneck, V-Neck & Pocket T-Shirts.",
          imageUrl: "/images/subcategories/tops-polos.png",
          systems: ["Alpha_EU", "Alpha_US"],
          products: [
            {
              name: "Heavyweight Crewneck T-Shirt",
              slug: "heavyweight-t-shirt",
              description: "220gsm Organic Cotton Heavyweight Crewneck T-Shirt.",
              imageUrl: "/images/subcategories/tops-polos.png",
              leadTimeDays: 12,
              moq: 50,
              fabrics: [
                { name: "220gsm Heavy Organic Jersey", priceMinCents: 1200, priceMaxCents: 1700, setupFeeCents: 12000 },
              ],
            },
            {
              name: "V-Neck T-Shirt",
              slug: "v-neck-t-shirt",
              description: "Tailored Slim Fit Cotton V-Neck T-Shirt.",
              imageUrl: "/images/subcategories/tops-polos.png",
              leadTimeDays: 12,
              moq: 50,
              fabrics: [
                { name: "Mercerized Combed Cotton", priceMinCents: 1300, priceMaxCents: 1800, setupFeeCents: 12000 },
              ],
            },
          ],
        },
        {
          name: "Sweatshirts & Hoodies",
          slug: "hoodies",
          description: "French Terry Fleece Pullovers, Zip Hoodies & Sweatshirts.",
          imageUrl: "/images/catalog/loungewear.png",
          systems: ["Alpha_EU", "Alpha_US"],
          products: [
            {
              name: "Pullover Hoodie",
              slug: "pullover-hoodie",
              description: "Heavy French Terry Fleece Pullover Hoodie with Kangaroo Pocket.",
              imageUrl: "/images/catalog/loungewear.png",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "400gsm Heavy French Terry", priceMinCents: 2600, priceMaxCents: 3500, setupFeeCents: 15000 },
              ],
            },
            {
              name: "Zip-Up Hoodie",
              slug: "zip-hoodie",
              description: "Full-Zip Fleece Hoodie with YKK Hardware.",
              imageUrl: "/images/catalog/loungewear.png",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "Brushed Loopback Fleece", priceMinCents: 2800, priceMaxCents: 3700, setupFeeCents: 15000 },
              ],
            },
            {
              name: "Crewneck Sweatshirt",
              slug: "crewneck-sweatshirt",
              description: "Classic Athletic Raglan Crewneck Sweatshirt.",
              imageUrl: "/images/catalog/loungewear.png",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "Heavy Loopback Cotton Fleece", priceMinCents: 2400, priceMaxCents: 3200, setupFeeCents: 15000 },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Bottoms",
      slug: "bottoms",
      description: "Trousers, Chinos, Jeans, Shorts & Sweatpants",
      sortOrder: 2,
      imageUrl: "/images/catalog/bottoms.png",
      subcategories: [
        {
          name: "Trousers & Chinos",
          slug: "trousers",
          description: "Tailored Dress Pants, Chinos & Flat-Front Wool Trousers.",
          imageUrl: "/images/subcategories/bottoms-trousers.png",
          systems: ["Waist_EU", "Waist_US"],
          products: [
            {
              name: "Dress Pants",
              slug: "dress-pants",
              description: "Pleated & Flat-Front Tailored Wool Dress Pants.",
              imageUrl: "/images/subcategories/bottoms-trousers.png",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "Super 110s Wool Gabardine", priceMinCents: 3500, priceMaxCents: 4500, setupFeeCents: 18000 },
              ],
            },
            {
              name: "Chino Pants",
              slug: "chino-pants",
              description: "Stretch Cotton Twill Smart Casual Chino Trousers.",
              imageUrl: "/images/subcategories/bottoms-trousers.png",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "Stretch Cotton Twill", priceMinCents: 2200, priceMaxCents: 2800, setupFeeCents: 15000 },
              ],
            },
          ],
        },
        {
          name: "Jeans",
          slug: "jeans",
          description: "Selvedge & Stretch Denim Jeans.",
          imageUrl: "/images/catalog/bottoms.png",
          systems: ["Waist_EU", "Waist_US"],
          products: [
            {
              name: "Slim Fit Denim Jeans",
              slug: "slim-fit-jeans",
              description: "Japanese Selvedge & Stretch Cotton Denim Jeans.",
              imageUrl: "/images/catalog/bottoms.png",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "13.5oz Japanese Selvedge Denim", priceMinCents: 3800, priceMaxCents: 4900, setupFeeCents: 18000 },
              ],
            },
          ],
        },
        {
          name: "Shorts",
          slug: "shorts",
          description: "Chino Shorts, Linen Shorts & Cargo Shorts.",
          imageUrl: "/images/subcategories/bottoms-shorts.png",
          systems: ["Waist_EU", "Waist_US"],
          products: [
            {
              name: "Tailored Chino Shorts",
              slug: "chino-shorts",
              description: "Smart Casual Stretch Cotton Chino Shorts.",
              imageUrl: "/images/subcategories/bottoms-shorts.png",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "Washed Cotton Twill", priceMinCents: 1800, priceMaxCents: 2400, setupFeeCents: 15000 },
              ],
            },
            {
              name: "Linen Shorts",
              slug: "linen-shorts",
              description: "Relaxed Drawstring Linen Summer Shorts.",
              imageUrl: "/images/subcategories/bottoms-shorts.png",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "Pure Washed Linen", priceMinCents: 2000, priceMaxCents: 2600, setupFeeCents: 15000 },
              ],
            },
          ],
        },
        {
          name: "Sweatpants",
          slug: "sweatpants",
          description: "Jogger Pants & Heavyweight Fleece Sweatpants.",
          imageUrl: "/images/catalog/bottoms.png",
          systems: ["Alpha_EU", "Alpha_US"],
          products: [
            {
              name: "Tapered Jogger Pants",
              slug: "jogger-pants",
              description: "Slim Tapered Athletic Fleece Jogger Pants.",
              imageUrl: "/images/catalog/bottoms.png",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "Brushed Back Fleece", priceMinCents: 2200, priceMaxCents: 2900, setupFeeCents: 15000 },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Outerwear",
      slug: "outerwear",
      description: "Jackets, Trench Coats, Overcoats & Casual Blazers",
      sortOrder: 3,
      imageUrl: "/images/catalog/outerwear.png",
      subcategories: [
        {
          name: "Jackets",
          slug: "jackets",
          description: "Softshell Zip Jackets, Leather Bombers & Field Shells.",
          imageUrl: "/images/catalog/outerwear.png",
          systems: ["Alpha_EU", "Alpha_US"],
          products: [
            {
              name: "Softshell Zip Jacket",
              slug: "softshell-jacket",
              description: "Weatherproof Bonded Softshell Outerwear Jacket.",
              imageUrl: "/images/catalog/outerwear.png",
              leadTimeDays: 21,
              moq: 50,
              fabrics: [
                { name: "Bonded Weatherproof Shell", priceMinCents: 4500, priceMaxCents: 6000, setupFeeCents: 20000 },
              ],
            },
            {
              name: "Nappa Leather Bomber",
              slug: "leather-bomber-jacket",
              description: "Italian Full-Grain Nappa Leather Flight Bomber Jacket.",
              imageUrl: "/images/catalog/outerwear.png",
              leadTimeDays: 21,
              moq: 50,
              fabrics: [
                { name: "Italian Nappa Leather", priceMinCents: 9500, priceMaxCents: 14000, setupFeeCents: 25000 },
              ],
            },
          ],
        },
        {
          name: "Coats",
          slug: "coats",
          description: "Double-Breasted Trench Coats & Cotton Mac Coats.",
          imageUrl: "/images/subcategories/outerwear-coats.jpg",
          systems: ["Alpha_EU", "Alpha_US"],
          products: [
            {
              name: "Double-Breasted Trench Coat",
              slug: "trench-coat",
              description: "Classic Belted Cotton Gabardine Trench Coat.",
              imageUrl: "/images/subcategories/outerwear-coats.jpg",
              leadTimeDays: 21,
              moq: 50,
              fabrics: [
                { name: "Gabardine Cotton Canvas", priceMinCents: 6800, priceMaxCents: 8500, setupFeeCents: 25000 },
              ],
            },
          ],
        },
        {
          name: "Overcoats",
          slug: "overcoats",
          description: "Virgin Wool & Cashmere Heavy Winter Overcoats.",
          imageUrl: "/images/subcategories/outerwear-overcoats.jpg",
          systems: ["Alpha_EU", "Alpha_US"],
          products: [
            {
              name: "Virgin Wool Overcoat",
              slug: "wool-overcoat",
              description: "Heavyweight Melton Virgin Wool Tailored Overcoat.",
              imageUrl: "/images/subcategories/outerwear-overcoats.jpg",
              leadTimeDays: 21,
              moq: 50,
              fabrics: [
                { name: "Melton Wool & Cashmere", priceMinCents: 8500, priceMaxCents: 12000, setupFeeCents: 25000 },
              ],
            },
          ],
        },
        {
          name: "Casual Blazers",
          slug: "casual-blazers",
          description: "Unstructured Linen & Cotton Hopsack Blazers.",
          imageUrl: "/images/subcategories/formal-blazers.jpg",
          systems: ["Chest_EU", "Chest_US"],
          products: [
            {
              name: "Unstructured Linen Blazer",
              slug: "casual-linen-blazer",
              description: "Lightweight Patch-Pocket Casual Linen Blazer.",
              imageUrl: "/images/subcategories/formal-blazers.jpg",
              leadTimeDays: 18,
              moq: 50,
              fabrics: [
                { name: "Hopsack Wool Blend", priceMinCents: 4800, priceMaxCents: 6200, setupFeeCents: 20000 },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Formal Wear",
      slug: "formal-wear",
      description: "Suits, Tuxedos, Blazers & Waistcoats",
      sortOrder: 4,
      imageUrl: "/images/catalog/formal_wear.png",
      subcategories: [
        {
          name: "Suits",
          slug: "suits",
          description: "Two-Piece & Three-Piece Bespoke Suit Sets.",
          imageUrl: "/images/catalog/formal_wear.png",
          systems: ["Chest_EU", "Chest_US"],
          products: [
            {
              name: "Two-Piece Wool Suit",
              slug: "two-piece-suit",
              description: "Super 120s Virgin Wool Jacket & Trousers Suit Set.",
              imageUrl: "/images/catalog/formal_wear.png",
              leadTimeDays: 21,
              moq: 50,
              fabrics: [
                { name: "Super 130s Italian Wool", priceMinCents: 12000, priceMaxCents: 16500, setupFeeCents: 30000 },
              ],
            },
          ],
        },
        {
          name: "Tuxedos",
          slug: "tuxedos",
          description: "Eveningwear Satin Lapel Tuxedos.",
          imageUrl: "/images/subcategories/formal-tuxedos.jpg",
          systems: ["Chest_EU", "Chest_US"],
          products: [
            {
              name: "Black-Tie Satin Tuxedo",
              slug: "satin-tuxedo",
              description: "Black Barathea Wool Tuxedo with Silk Grosgrain Lapels.",
              imageUrl: "/images/subcategories/formal-tuxedos.jpg",
              leadTimeDays: 21,
              moq: 50,
              fabrics: [
                { name: "Barathea Wool & Silk Satin", priceMinCents: 14000, priceMaxCents: 19000, setupFeeCents: 30000 },
              ],
            },
          ],
        },
        {
          name: "Formal Blazers",
          slug: "formal-blazers",
          description: "Navy Hopsack & Wool Flannel Blazer Jackets.",
          imageUrl: "/images/subcategories/formal-blazers.jpg",
          systems: ["Chest_EU", "Chest_US"],
          products: [
            {
              name: "Navy Hopsack Blazer",
              slug: "formal-navy-blazer",
              description: "Structured Brass-Button Navy Hopsack Formal Blazer.",
              imageUrl: "/images/subcategories/formal-blazers.jpg",
              leadTimeDays: 18,
              moq: 50,
              fabrics: [
                { name: "Refined Wool Flannel", priceMinCents: 5200, priceMaxCents: 6800, setupFeeCents: 20000 },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Sportswear",
      slug: "sportswear",
      description: "Tracksuits, Performance Tops & Activewear",
      sortOrder: 5,
      imageUrl: "/images/catalog/sportswear.png",
      subcategories: [
        {
          name: "Tracksuits",
          slug: "tracksuits",
          description: "Technical Track Jackets & Matching Track Pants.",
          imageUrl: "/images/catalog/sportswear.png",
          systems: ["Alpha_EU", "Alpha_US"],
          products: [
            {
              name: "Full Technical Tracksuit Set",
              slug: "full-tracksuit-set",
              description: "Matching Zip Track Jacket & Tapered Pants Set.",
              imageUrl: "/images/catalog/sportswear.png",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "Bonded Technical Fleece", priceMinCents: 3200, priceMaxCents: 4200, setupFeeCents: 15000 },
              ],
            },
          ],
        },
        {
          name: "Performance Tops",
          slug: "performance-tops",
          description: "Moisture-Wicking Athletic Tops & Compression Shirts.",
          imageUrl: "/images/subcategories/sportswear-performance.jpg",
          systems: ["Alpha_EU", "Alpha_US"],
          products: [
            {
              name: "Moisture-Wicking Athletic Shirt",
              slug: "athletic-shirt",
              description: "Lightweight Breathable Performance Running Shirt.",
              imageUrl: "/images/subcategories/sportswear-performance.jpg",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "Recycled Elastane Knit", priceMinCents: 1800, priceMaxCents: 2400, setupFeeCents: 15000 },
              ],
            },
          ],
        },
        {
          name: "Activewear",
          slug: "activewear",
          description: "Athletic Shorts & Compression Leggings.",
          imageUrl: "/images/subcategories/sportswear-activewear.jpg",
          systems: ["Alpha_EU", "Alpha_US"],
          products: [
            {
              name: "Four-Way Stretch Athletic Shorts",
              slug: "active-shorts",
              description: "Lightweight Zip-Pocket Athletic Training Shorts.",
              imageUrl: "/images/subcategories/sportswear-activewear.jpg",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "Four-Way Stretch Microfiber", priceMinCents: 1600, priceMaxCents: 2200, setupFeeCents: 15000 },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Underwear & Loungewear",
      slug: "lingerie-loungewear",
      description: "Sleepwear, Underwear, Loungewear & Socks",
      sortOrder: 6,
      imageUrl: "/images/catalog/loungewear.png",
      subcategories: [
        {
          name: "Sleepwear",
          slug: "sleepwear",
          description: "Mulberry Silk Pajamas & Cotton Robes.",
          imageUrl: "/images/subcategories/loungewear-sleepwear.jpg",
          systems: ["Alpha_EU", "Alpha_US"],
          products: [
            {
              name: "Mulberry Silk Pajama Set",
              slug: "silk-pajamas",
              description: "19mm Pure Mulberry Silk Piping Pajama Set.",
              imageUrl: "/images/subcategories/loungewear-sleepwear.jpg",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "19mm Mulberry Silk", priceMinCents: 5800, priceMaxCents: 7500, setupFeeCents: 20000 },
              ],
            },
          ],
        },
        {
          name: "Underwear",
          slug: "underwear",
          description: "Organic Cotton Briefs & Seamless Trunks.",
          imageUrl: "/images/subcategories/loungewear-underwear.jpg",
          systems: ["Alpha_EU", "Alpha_US"],
          products: [
            {
              name: "Organic Cotton Boxer Briefs",
              slug: "boxer-briefs",
              description: "Micro-Modal & Organic Cotton Elastic Waistband Trunks.",
              imageUrl: "/images/subcategories/loungewear-underwear.jpg",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "Micro-Modal Cotton Blend", priceMinCents: 900, priceMaxCents: 1400, setupFeeCents: 10000 },
              ],
            },
          ],
        },
        {
          name: "Loungewear",
          slug: "loungewear",
          description: "Heavyweight Fleece Sweats & Lounge Pants.",
          imageUrl: "/images/catalog/loungewear.png",
          systems: ["Alpha_EU", "Alpha_US"],
          products: [
            {
              name: "Loopback Fleece Sweatshirt",
              slug: "lounge-sweatshirt",
              description: "Relaxed Fit Organic Loopback Fleece Lounge Shirt.",
              imageUrl: "/images/catalog/loungewear.png",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "Organic Heavy Loopback Fleece", priceMinCents: 2800, priceMaxCents: 3600, setupFeeCents: 15000 },
              ],
            },
          ],
        },
        {
          name: "Socks",
          slug: "socks",
          description: "Mercerized Cotton & Merino Wool Dress Socks.",
          imageUrl: "/images/catalog/loungewear.png",
          systems: ["OneSize_EU", "OneSize_US"],
          products: [
            {
              name: "Mercerized Cotton Socks",
              slug: "mercerized-socks",
              description: "Ribbed Mercerized Cotton Fine Gauge Socks.",
              imageUrl: "/images/catalog/loungewear.png",
              leadTimeDays: 10,
              moq: 100,
              fabrics: [
                { name: "Mercerized Ribbed Cotton", priceMinCents: 450, priceMaxCents: 750, setupFeeCents: 8000 },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Accessories",
      slug: "accessories",
      description: "Footwear, Belts, Ties, Scarves & Leather Goods",
      sortOrder: 7,
      imageUrl: "/images/catalog/accessories.png",
      subcategories: [
        {
          name: "Footwear",
          slug: "footwear",
          description: "Italian Calfskin Oxfords, Loafers & Sneakers.",
          imageUrl: "/images/catalog/accessories.png",
          systems: ["Shoe_EU", "Shoe_US"],
          products: [
            {
              name: "Leather Oxfords",
              slug: "leather-oxfords",
              description: "Full-Grain Italian Leather Goodyear Welted Oxfords.",
              imageUrl: "/images/catalog/accessories.png",
              leadTimeDays: 21,
              moq: 50,
              fabrics: [
                { name: "Full-Grain Italian Calfskin", priceMinCents: 8500, priceMaxCents: 12500, setupFeeCents: 25000 },
              ],
            },
          ],
        },
        {
          name: "Belts",
          slug: "belts",
          description: "Full-Grain Leather & Suede Belts.",
          imageUrl: "/images/catalog/accessories.png",
          systems: ["Waist_EU", "Waist_US"],
          products: [
            {
              name: "Calfskin Dress Belt",
              slug: "calfskin-belt",
              description: "Hand-Burnished Full-Grain Leather Dress Belt.",
              imageUrl: "/images/catalog/accessories.png",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "Vegetable Tanned Leather", priceMinCents: 2400, priceMaxCents: 3200, setupFeeCents: 12000 },
              ],
            },
          ],
        },
        {
          name: "Ties & Bowties",
          slug: "ties",
          description: "Seven-Fold Silk Jacquard Ties & Bowties.",
          imageUrl: "/images/subcategories/accessories-ties.jpg",
          systems: ["OneSize_EU", "OneSize_US"],
          products: [
            {
              name: "Seven-Fold Silk Tie",
              slug: "seven-fold-tie",
              description: "Handmade Seven-Fold Italian Silk Jacquard Tie.",
              imageUrl: "/images/subcategories/accessories-ties.jpg",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "7-Fold Woven Silk", priceMinCents: 1800, priceMaxCents: 2600, setupFeeCents: 10000 },
              ],
            },
          ],
        },
        {
          name: "Scarves & Squares",
          slug: "scarves",
          description: "Cashmere Wool Scarves & Silk Pocket Squares.",
          imageUrl: "/images/subcategories/accessories-scarves.jpg",
          systems: ["OneSize_EU", "OneSize_US"],
          products: [
            {
              name: "Cashmere Wool Scarf",
              slug: "cashmere-scarf",
              description: "Mongolian Cashmere Fringed Winter Scarf.",
              imageUrl: "/images/subcategories/accessories-scarves.jpg",
              leadTimeDays: 14,
              moq: 50,
              fabrics: [
                { name: "100% Mongolian Cashmere", priceMinCents: 3500, priceMaxCents: 4800, setupFeeCents: 15000 },
              ],
            },
          ],
        },
      ],
    },
  ];

  for (const catData of catalog) {
    let category = await prisma.category.findUnique({
      where: { slug: catData.slug },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: catData.name,
          slug: catData.slug,
          description: catData.description,
          sortOrder: catData.sortOrder,
          imageUrl: catData.imageUrl,
        },
      });
    }

    for (const subDef of catData.subcategories) {
      let subcategory = await prisma.subcategory.findUnique({
        where: { slug: subDef.slug },
      });

      if (!subcategory) {
        subcategory = await prisma.subcategory.create({
          data: {
            categoryId: category.id,
            name: subDef.name,
            slug: subDef.slug,
            description: subDef.description,
            imageUrl: subDef.imageUrl,
          },
        });
      }

      // Link size systems
      for (const sysKey of subDef.systems) {
        const sysId = createdSystems[sysKey];
        if (sysId) {
          await prisma.subcategorySizeSystem.upsert({
            where: {
              subcategoryId_sizeSystemId: {
                subcategoryId: subcategory.id,
                sizeSystemId: sysId,
              },
            },
            create: {
              subcategoryId: subcategory.id,
              sizeSystemId: sysId,
            },
            update: {},
          });
        }
      }

      // Products under subcategory
      for (const prodDef of subDef.products) {
        let product = await prisma.product.findUnique({
          where: { slug: prodDef.slug },
        });

        if (!product) {
          product = await prisma.product.create({
            data: {
              subcategoryId: subcategory.id,
              name: prodDef.name,
              slug: prodDef.slug,
              description: prodDef.description,
              imageUrl: prodDef.imageUrl,
              leadTimeDays: prodDef.leadTimeDays,
              moq: prodDef.moq,
            },
          });
        }

        // Seed Product-level Fabrics
        for (const fab of prodDef.fabrics) {
          await prisma.fabric.upsert({
            where: {
              name_productId: {
                name: fab.name,
                productId: product.id,
              },
            },
            create: {
              name: fab.name,
              productId: product.id,
              priceMinCents: fab.priceMinCents,
              priceMaxCents: fab.priceMaxCents,
              setupFeeCents: fab.setupFeeCents,
              description: `${fab.name} engineered for ${prodDef.name}.`,
            },
            update: {
              priceMinCents: fab.priceMinCents,
              priceMaxCents: fab.priceMaxCents,
              setupFeeCents: fab.setupFeeCents,
            },
          });
        }
      }
    }
  }

  console.log("🌱 3-Level Catalog DB Seeding completed successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
