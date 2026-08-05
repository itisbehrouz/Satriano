import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is missing.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedPilotColors() {
  console.log("Starting pilot color seed for Classic Polo Shirt...");

  // 1. Locate Classic Polo Shirt product
  const product = await prisma.product.findFirst({
    where: { slug: "classic-polo-shirt" },
    select: { id: true, name: true },
  });

  if (!product) {
    throw new Error("Classic Polo Shirt product (slug: 'classic-polo-shirt') not found.");
  }

  // 2. Fetch fabric lines for Classic Polo Shirt
  const fabrics = await prisma.fabric.findMany({
    where: { productId: product.id, active: true },
    select: { id: true, name: true },
    orderBy: { priceMinCents: "asc" },
  });

  if (fabrics.length === 0) {
    throw new Error(`No active fabric lines found for product '${product.name}'.`);
  }

  // 3. Define 4 pilot colours per fabric line with explicit sortOrder and hex field
  const pilotColorways = [
    { name: "Navy Blue", hex: "#0B1E3D", sortOrder: 0 },
    { name: "Crisp White", hex: "#FFFFFF", sortOrder: 1 },
    { name: "Oatmeal Beige", hex: "#D6C7B2", sortOrder: 2 },
    { name: "Blackberry", hex: "#25122B", sortOrder: 3 },
  ];

  let totalUpserted = 0;

  for (const fabric of fabrics) {
    for (const col of pilotColorways) {
      await prisma.fabricColor.upsert({
        where: {
          fabricId_name: {
            fabricId: fabric.id,
            name: col.name,
          },
        },
        update: {
          hex: col.hex,
          sortOrder: col.sortOrder,
          active: true,
        },
        create: {
          fabricId: fabric.id,
          name: col.name,
          hex: col.hex,
          sortOrder: col.sortOrder,
          active: true,
        },
      });
      totalUpserted++;
    }
    console.log(`Upserted ${pilotColorways.length} colors for fabric line: '${fabric.name}'`);
  }

  console.log(`Successfully completed pilot color seeding: ${totalUpserted} rows across ${fabrics.length} fabric lines.`);
}

seedPilotColors()
  .catch((err) => {
    console.error("Failed to seed pilot colors:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
