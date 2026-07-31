import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting Satriano Atelier DB seeding...");

  // 1. Seed Size Systems & Options
  const sizeSystemDefs = [
    {
      name: "Alpha",
      region: "EU",
      labels: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    },
    {
      name: "Alpha",
      region: "US",
      labels: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
    },
    {
      name: "Waist",
      region: "EU",
      labels: ["44", "46", "48", "50", "52", "54", "56", "58", "60"],
    },
    {
      name: "Waist",
      region: "US",
      labels: ["28", "30", "32", "34", "36", "38", "40", "42"],
    },
    {
      name: "Chest",
      region: "EU",
      labels: ["44", "46", "48", "50", "52", "54", "56", "58", "60"],
    },
    {
      name: "Chest",
      region: "US",
      labels: ["34", "36", "38", "40", "42", "44", "46", "48", "50"],
    },
    {
      name: "Shoe",
      region: "EU",
      labels: ["39", "40", "41", "42", "43", "44", "45", "46"],
    },
    {
      name: "Shoe",
      region: "US",
      labels: ["7", "8", "9", "10", "11", "12", "13"],
    },
    {
      name: "OneSize",
      region: "EU",
      labels: ["One Size"],
    },
    {
      name: "OneSize",
      region: "US",
      labels: ["One Size"],
    },
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

  // 2. Categories & Subcategories Seed Matrix
  const categoriesData = [
    {
      name: "Tops",
      slug: "tops",
      description: "Shirts, Polo Shirts, Sweaters, T-Shirts & Knitwear",
      sortOrder: 1,
      imageUrl: "/images/catalog/tops.png",
      subcategories: [
        {
          name: "Dress & Casual Shirts",
          slug: "shirts",
          description: "Crisp Oxford, Fine Poplin & Breathable Linen Dress Shirts.",
          imageUrl: "/images/subcategories/tops-shirts.png",
          leadTimeDays: 14,
          moq: 50,
          systems: ["Alpha_EU", "Alpha_US"],
          fabrics: [
            { name: "Oxford Cotton Poplin", priceMinCents: 1800, priceMaxCents: 2300, setupFeeCents: 15000 },
            { name: "French Linen Blend", priceMinCents: 2200, priceMaxCents: 2800, setupFeeCents: 15000 },
          ],
        },
        {
          name: "Polo Shirts",
          slug: "polos",
          description: "Classic Pique Cotton, Mercerized Jersey & Performance Blend Polo Shirts.",
          imageUrl: "/images/subcategories/tops-polos.png",
          leadTimeDays: 14,
          moq: 50,
          systems: ["Alpha_EU", "Alpha_US"],
          fabrics: [
            { name: "Pique Cotton", priceMinCents: 1500, priceMaxCents: 2000, setupFeeCents: 15000 },
            { name: "Organic Cotton", priceMinCents: 1900, priceMaxCents: 2400, setupFeeCents: 15000 },
            { name: "Performance Jersey", priceMinCents: 2200, priceMaxCents: 2700, setupFeeCents: 15000 },
          ],
        },
        {
          name: "Knitwear & Sweaters",
          slug: "sweaters",
          description: "Fine Merino Wool, Cashmere Blend & Organic Cotton Crewneck Sweaters.",
          imageUrl: "/images/subcategories/tops-sweaters.png",
          leadTimeDays: 18,
          moq: 50,
          systems: ["Alpha_EU", "Alpha_US"],
          fabrics: [
            { name: "Extra-Fine Merino Wool", priceMinCents: 3200, priceMaxCents: 4200, setupFeeCents: 20000 },
            { name: "Cashmere Cotton Knit", priceMinCents: 4500, priceMaxCents: 5800, setupFeeCents: 20000 },
          ],
        },
        {
          name: "T-Shirts",
          slug: "t-shirts",
          description: "Heavyweight Organic Cotton & Mercerized Crewneck T-Shirts.",
          imageUrl: "/images/subcategories/tops-polos.png",
          leadTimeDays: 12,
          moq: 50,
          systems: ["Alpha_EU", "Alpha_US"],
          fabrics: [
            { name: "Heavyweight Jersey (220gsm)", priceMinCents: 1200, priceMaxCents: 1700, setupFeeCents: 12000 },
          ],
        },
        {
          name: "Sweatshirts & Hoodies",
          slug: "hoodies",
          description: "French Terry & Bonded Fleece Pullover Hoodies & Crewnecks.",
          imageUrl: "/images/catalog/loungewear.png",
          leadTimeDays: 14,
          moq: 50,
          systems: ["Alpha_EU", "Alpha_US"],
          fabrics: [
            { name: "Heavy French Terry Fleece", priceMinCents: 2400, priceMaxCents: 3200, setupFeeCents: 15000 },
          ],
        },
      ],
    },
    {
      name: "Bottoms",
      slug: "bottoms",
      description: "Trousers, Skirts, Shorts & Sweatpants",
      sortOrder: 2,
      imageUrl: "/images/catalog/bottoms.png",
      subcategories: [
        {
          name: "Tailored Trousers & Pants",
          slug: "trousers",
          description: "Bespoke Pleated Dress Pants, Chinos & Flat-Front Wool Trousers.",
          imageUrl: "/images/subcategories/bottoms-trousers.png",
          leadTimeDays: 14,
          moq: 50,
          systems: ["Waist_EU", "Waist_US"],
          fabrics: [
            { name: "Super 110s Wool Gabardine", priceMinCents: 3500, priceMaxCents: 4500, setupFeeCents: 18000 },
            { name: "Stretch Cotton Twill", priceMinCents: 2200, priceMaxCents: 2800, setupFeeCents: 15000 },
          ],
        },
        {
          name: "Chino & Linen Shorts",
          slug: "shorts",
          description: "Custom Tailored Chino Shorts & Relaxed Linen Drawstring Shorts.",
          imageUrl: "/images/subcategories/bottoms-shorts.png",
          leadTimeDays: 14,
          moq: 50,
          systems: ["Waist_EU", "Waist_US"],
          fabrics: [
            { name: "Washed Linen Twill", priceMinCents: 1800, priceMaxCents: 2400, setupFeeCents: 15000 },
          ],
        },
        {
          name: "Tailored Skirts",
          slug: "skirts",
          description: "Structured Wool Pencil Skirts & A-Line Linen Skirts.",
          imageUrl: "/images/subcategories/bottoms-skirts.png",
          leadTimeDays: 14,
          moq: 50,
          systems: ["Waist_EU", "Waist_US"],
          fabrics: [
            { name: "Crepe Wool Blend", priceMinCents: 2600, priceMaxCents: 3400, setupFeeCents: 15000 },
          ],
        },
        {
          name: "Sweatpants & Joggers",
          slug: "sweatpants",
          description: "Heavyweight Fleece Sweatpants & Tapered Joggers.",
          imageUrl: "/images/catalog/bottoms.png",
          leadTimeDays: 14,
          moq: 50,
          systems: ["Alpha_EU", "Alpha_US"],
          fabrics: [
            { name: "Brushed Back Fleece", priceMinCents: 2200, priceMaxCents: 2900, setupFeeCents: 15000 },
          ],
        },
      ],
    },
    {
      name: "Outerwear",
      slug: "outerwear",
      description: "Jackets, Trench Coats, Overcoats & Vests",
      sortOrder: 3,
      imageUrl: "/images/catalog/outerwear.png",
      subcategories: [
        {
          name: "Casual & Leather Jackets",
          slug: "jackets",
          description: "Bespoke Softshell Zip Jackets, Grain Leather Bomber Jackets & Field Shells.",
          imageUrl: "/images/catalog/outerwear.png",
          leadTimeDays: 21,
          moq: 50,
          systems: ["Alpha_EU", "Alpha_US"],
          fabrics: [
            { name: "Italian Nappa Leather", priceMinCents: 9500, priceMaxCents: 14000, setupFeeCents: 25000 },
            { name: "Bonded Weatherproof Shell", priceMinCents: 4500, priceMaxCents: 6000, setupFeeCents: 20000 },
          ],
        },
        {
          name: "Trench Coats",
          slug: "coats",
          description: "Double-Breasted Wool & Weatherproof Cotton Trench Coats.",
          imageUrl: "/images/subcategories/outerwear-coats.jpg",
          leadTimeDays: 21,
          moq: 50,
          systems: ["Alpha_EU", "Alpha_US"],
          fabrics: [
            { name: "Gabardine Cotton Canvas", priceMinCents: 6800, priceMaxCents: 8500, setupFeeCents: 25000 },
          ],
        },
        {
          name: "Heavy Overcoats",
          slug: "overcoats",
          description: "Virgin Wool & Cashmere Overcoats engineered for winter lines.",
          imageUrl: "/images/subcategories/outerwear-overcoats.jpg",
          leadTimeDays: 21,
          moq: 50,
          systems: ["Alpha_EU", "Alpha_US"],
          fabrics: [
            { name: "Melton Wool & Cashmere", priceMinCents: 8500, priceMaxCents: 12000, setupFeeCents: 25000 },
          ],
        },
        {
          name: "Casual Blazers",
          slug: "casual-blazers",
          description: "Unstructured Linen & Cotton Hopsack Casual Blazers.",
          imageUrl: "/images/subcategories/formal-blazers.jpg",
          leadTimeDays: 18,
          moq: 50,
          systems: ["Chest_EU", "Chest_US"],
          fabrics: [
            { name: "Hopsack Wool Blend", priceMinCents: 4800, priceMaxCents: 6200, setupFeeCents: 20000 },
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
          name: "Two-Piece & Three-Piece Suits",
          slug: "suits",
          description: "Super 120s Virgin Wool Tailored Suit Sets.",
          imageUrl: "/images/catalog/formal_wear.png",
          leadTimeDays: 21,
          moq: 50,
          systems: ["Chest_EU", "Chest_US"],
          fabrics: [
            { name: "Super 130s Italian Wool", priceMinCents: 12000, priceMaxCents: 16500, setupFeeCents: 30000 },
          ],
        },
        {
          name: "Eveningwear Tuxedos",
          slug: "tuxedos",
          description: "Black-Tie Satin Lapel Tuxedos with silk grosgrain piping.",
          imageUrl: "/images/subcategories/formal-tuxedos.jpg",
          leadTimeDays: 21,
          moq: 50,
          systems: ["Chest_EU", "Chest_US"],
          fabrics: [
            { name: "Barathea Wool & Silk Satin", priceMinCents: 14000, priceMaxCents: 19000, setupFeeCents: 30000 },
          ],
        },
        {
          name: "Standalone Blazers",
          slug: "blazers",
          description: "Structured Navy & Hopsack Wool Blazer Jackets.",
          imageUrl: "/images/subcategories/formal-blazers.jpg",
          leadTimeDays: 18,
          moq: 50,
          systems: ["Chest_EU", "Chest_US"],
          fabrics: [
            { name: "Refined Wool Flannel", priceMinCents: 5200, priceMaxCents: 6800, setupFeeCents: 20000 },
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
          name: "Technical Tracksuits",
          slug: "tracksuits",
          description: "Performance Zip Jackets & Matching Track Pants.",
          imageUrl: "/images/catalog/sportswear.png",
          leadTimeDays: 14,
          moq: 50,
          systems: ["Alpha_EU", "Alpha_US"],
          fabrics: [
            { name: "Bonded Technical Fleece", priceMinCents: 3200, priceMaxCents: 4200, setupFeeCents: 15000 },
          ],
        },
        {
          name: "Performance Tops & Compression",
          slug: "performance",
          description: "Moisture-Wicking Athletic Shirts & Seamless Compression Tops.",
          imageUrl: "/images/subcategories/sportswear-performance.jpg",
          leadTimeDays: 14,
          moq: 50,
          systems: ["Alpha_EU", "Alpha_US"],
          fabrics: [
            { name: "Recycled Elastane Knit", priceMinCents: 1800, priceMaxCents: 2400, setupFeeCents: 15000 },
          ],
        },
        {
          name: "Athletic Shorts & Leggings",
          slug: "activewear",
          description: "Four-way Stretch Athletic Shorts & Ergonomic Leggings.",
          imageUrl: "/images/subcategories/sportswear-activewear.jpg",
          leadTimeDays: 14,
          moq: 50,
          systems: ["Alpha_EU", "Alpha_US"],
          fabrics: [
            { name: "Four-Way Stretch Microfiber", priceMinCents: 1600, priceMaxCents: 2200, setupFeeCents: 15000 },
          ],
        },
      ],
    },
    {
      name: "Underwear & Loungewear",
      slug: "lingerie-loungewear",
      description: "Sleepwear, Underwear & Fleece Loungewear",
      sortOrder: 6,
      imageUrl: "/images/catalog/loungewear.png",
      subcategories: [
        {
          name: "Luxury Pajamas & Robes",
          slug: "sleepwear",
          description: "Pure Mulberry Silk Pajama Sets & Cotton Robes.",
          imageUrl: "/images/subcategories/loungewear-sleepwear.jpg",
          leadTimeDays: 14,
          moq: 50,
          systems: ["Alpha_EU", "Alpha_US"],
          fabrics: [
            { name: "19mm Mulberry Silk", priceMinCents: 5800, priceMaxCents: 7500, setupFeeCents: 20000 },
          ],
        },
        {
          name: "Fine Base Layers & Underwear",
          slug: "underwear",
          description: "Seamless Organic Cotton Briefs & Trunks.",
          imageUrl: "/images/subcategories/loungewear-underwear.jpg",
          leadTimeDays: 14,
          moq: 50,
          systems: ["Alpha_EU", "Alpha_US"],
          fabrics: [
            { name: "Micro-Modal Cotton Blend", priceMinCents: 900, priceMaxCents: 1400, setupFeeCents: 10000 },
          ],
        },
        {
          name: "Fleece Sweats & Loungewear",
          slug: "loungewear",
          description: "Heavyweight Sweatpants & Casual Hoodies.",
          imageUrl: "/images/catalog/loungewear.png",
          leadTimeDays: 14,
          moq: 50,
          systems: ["Alpha_EU", "Alpha_US"],
          fabrics: [
            { name: "Organic Heavy Loopback Fleece", priceMinCents: 2800, priceMaxCents: 3600, setupFeeCents: 15000 },
          ],
        },
        {
          name: "Fine Knit Socks",
          slug: "socks",
          description: "Merino Wool & Mercerized Cotton Dress Socks.",
          imageUrl: "/images/catalog/loungewear.png",
          leadTimeDays: 10,
          moq: 100,
          systems: ["OneSize_EU", "OneSize_US"],
          fabrics: [
            { name: "Mercerized Ribbed Cotton", priceMinCents: 450, priceMaxCents: 750, setupFeeCents: 8000 },
          ],
        },
      ],
    },
    {
      name: "Accessories",
      slug: "accessories",
      description: "Belts, Ties, Scarves, Footwear & Accessories",
      sortOrder: 7,
      imageUrl: "/images/catalog/accessories.png",
      subcategories: [
        {
          name: "Footwear & Shoes",
          slug: "footwear",
          description: "Italian Calfskin Loafers, Oxfords & Luxury Sneakers.",
          imageUrl: "/images/catalog/accessories.png",
          leadTimeDays: 21,
          moq: 50,
          systems: ["Shoe_EU", "Shoe_US"],
          fabrics: [
            { name: "Full-Grain Italian Calfskin", priceMinCents: 8500, priceMaxCents: 12500, setupFeeCents: 25000 },
          ],
        },
        {
          name: "Bespoke Leather & Suede Belts",
          slug: "belts",
          description: "Full-Grain Italian Calfskin & Suede Belts.",
          imageUrl: "/images/catalog/accessories.png",
          leadTimeDays: 14,
          moq: 50,
          systems: ["Waist_EU", "Waist_US"],
          fabrics: [
            { name: "Vegetable Tanned Leather", priceMinCents: 2400, priceMaxCents: 3200, setupFeeCents: 12000 },
          ],
        },
        {
          name: "Handmade Silk & Wool Ties",
          slug: "ties",
          description: "Seven-Fold Silk Jacquard Ties & Knit Wool Ties.",
          imageUrl: "/images/subcategories/accessories-ties.jpg",
          leadTimeDays: 14,
          moq: 50,
          systems: ["OneSize_EU", "OneSize_US"],
          fabrics: [
            { name: "7-Fold Woven Silk", priceMinCents: 1800, priceMaxCents: 2600, setupFeeCents: 10000 },
          ],
        },
        {
          name: "Cashmere & Silk Scarves",
          slug: "scarves",
          description: "Fine Wool-Cashmere Fringed Scarves & Silk Pocket Squares.",
          imageUrl: "/images/subcategories/accessories-scarves.jpg",
          leadTimeDays: 14,
          moq: 50,
          systems: ["OneSize_EU", "OneSize_US"],
          fabrics: [
            { name: "100% Mongolian Cashmere", priceMinCents: 3500, priceMaxCents: 4800, setupFeeCents: 15000 },
          ],
        },
      ],
    },
  ];

  for (const catData of categoriesData) {
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
            leadTimeDays: subDef.leadTimeDays,
            moq: subDef.moq,
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

      // Seed fabrics
      for (const fab of subDef.fabrics) {
        await prisma.fabric.upsert({
          where: {
            name_subcategoryId: {
              name: fab.name,
              subcategoryId: subcategory.id,
            },
          },
          create: {
            name: fab.name,
            subcategoryId: subcategory.id,
            priceMinCents: fab.priceMinCents,
            priceMaxCents: fab.priceMaxCents,
            setupFeeCents: fab.setupFeeCents,
            description: `${fab.name} engineered for ${subDef.name}.`,
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

  console.log("🌱 Database seeding completed successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
