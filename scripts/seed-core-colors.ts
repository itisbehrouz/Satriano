// PLACEHOLDER DATA — sektör-standardı çekirdek renkler, tedarikçi tarafından 
// doğrulanmamıştır. Faz 4 admin CRUD ile gerçek tedarikçi renk kartları 
// girildiğinde bu veri düzenlenecek/değiştirilecektir.

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

const CORE_PALETTE = [
  { name: "Black", hex: "#0A0A0A" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#0B1E3D" },
  { name: "Heather Grey", hex: "#8B8B8B" },
  { name: "Charcoal", hex: "#36454F" },
];

async function seedCoreColors() {
  console.log("Starting core color palette seed...");

  // Fetch all active fabrics excluding Accessories category
  const fabrics = await prisma.fabric.findMany({
    where: {
      active: true,
      product: {
        subcategory: {
          category: {
            slug: {
              not: "accessories",
            },
          },
        },
      },
    },
    include: {
      colors: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${fabrics.length} active fabric lines across non-Accessories categories.`);

  let totalProcessedFabrics = fabrics.length;
  let totalExistingColorsSkipped = 0;
  const newColorRowsToInsert: Array<{
    fabricId: string;
    name: string;
    hex: string;
    sortOrder: number;
    active: boolean;
  }> = [];

  for (const fabric of fabrics) {
    const existingNamesSet = new Set(fabric.colors.map((c) => c.name.toLowerCase()));
    let maxSortOrder =
      fabric.colors.length > 0
        ? Math.max(...fabric.colors.map((c) => c.sortOrder))
        : -1;

    for (const coreColor of CORE_PALETTE) {
      if (existingNamesSet.has(coreColor.name.toLowerCase())) {
        totalExistingColorsSkipped++;
      } else {
        maxSortOrder++;
        newColorRowsToInsert.push({
          fabricId: fabric.id,
          name: coreColor.name,
          hex: coreColor.hex,
          sortOrder: maxSortOrder,
          active: true,
        });
        existingNamesSet.add(coreColor.name.toLowerCase());
      }
    }
  }

  let totalNewColorsCreated = 0;
  if (newColorRowsToInsert.length > 0) {
    const result = await prisma.fabricColor.createMany({
      data: newColorRowsToInsert,
      skipDuplicates: true,
    });
    totalNewColorsCreated = result.count;
  }

  console.log("\n=== CORE COLOR SEED SUMMARY ===");
  console.log(`Total Fabric Lines Processed: ${totalProcessedFabrics}`);
  console.log(`New FabricColor Rows Created: ${totalNewColorsCreated}`);
  console.log(`Existing Colors Skipped: ${totalExistingColorsSkipped}`);
}

seedCoreColors()
  .catch((err) => {
    console.error("Failed to seed core colors:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
