import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminRequest } from "@/lib/adminAuth";

export async function GET(request: Request) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          include: {
            sizeSystems: {
              include: {
                sizeSystem: {
                  include: {
                    options: { orderBy: { sortOrder: "asc" } },
                  },
                },
              },
            },
            products: {
              include: {
                fabrics: true,
                fits: {
                  include: { fit: true },
                },
              },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const sizeSystems = await prisma.sizeSystem.findMany({
      include: {
        options: { orderBy: { sortOrder: "asc" } },
      },
    });

    const allFits = await prisma.fit.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ categories, sizeSystems, fits: allFits });
  } catch (error) {
    console.error("Failed to fetch admin catalog", error);
    return NextResponse.json({ error: "Failed to fetch catalog" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const { target, data } = body;
    if (!target || !data || typeof data !== "object") {
      return NextResponse.json({ error: "Target and data parameters are required." }, { status: 400 });
    }

    // 1. CREATE CATEGORY
    if (target === "category") {
      const { name, slug, description, sortOrder, imageUrl } = data;
      if (!name || typeof name !== "string" || !name.trim()) {
        return NextResponse.json({ error: "Category name is required." }, { status: 400 });
      }
      if (!slug || typeof slug !== "string" || !slug.trim()) {
        return NextResponse.json({ error: "Category slug is required." }, { status: 400 });
      }

      const cleanSlug = slug.trim().toLowerCase();
      const existing = await prisma.category.findUnique({ where: { slug: cleanSlug } });
      if (existing) {
        return NextResponse.json({ error: `Category slug '${cleanSlug}' already exists.` }, { status: 400 });
      }

      let order = typeof sortOrder === "number" ? sortOrder : undefined;
      if (order === undefined) {
        const count = await prisma.category.count();
        order = count;
      }

      const category = await prisma.category.create({
        data: {
          name: name.trim(),
          slug: cleanSlug,
          description: description?.trim() || null,
          sortOrder: order,
          imageUrl: typeof imageUrl === "string" ? imageUrl.trim() || null : null,
        },
      });

      return NextResponse.json({ success: true, category }, { status: 201 });
    }

    // 2. CREATE SUBCATEGORY
    if (target === "subcategory") {
      const { categoryId, name, slug, description, sortOrder, sizeSystemIds, imageUrl } = data;
      if (!categoryId || typeof categoryId !== "string") {
        return NextResponse.json({ error: "Parent category ID is required." }, { status: 400 });
      }
      if (!name || typeof name !== "string" || !name.trim()) {
        return NextResponse.json({ error: "Subcategory name is required." }, { status: 400 });
      }
      if (!slug || typeof slug !== "string" || !slug.trim()) {
        return NextResponse.json({ error: "Subcategory slug is required." }, { status: 400 });
      }

      const cleanSlug = slug.trim().toLowerCase();

      const existingCat = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!existingCat) {
        return NextResponse.json({ error: "Parent category not found." }, { status: 404 });
      }

      const existingSub = await prisma.subcategory.findUnique({ where: { slug: cleanSlug } });
      if (existingSub) {
        return NextResponse.json({ error: `Subcategory slug '${cleanSlug}' already exists.` }, { status: 400 });
      }

      let order = typeof sortOrder === "number" ? sortOrder : undefined;
      if (order === undefined) {
        const count = await prisma.subcategory.count({ where: { categoryId } });
        order = count;
      }

      const subcategory = await prisma.subcategory.create({
        data: {
          categoryId,
          name: name.trim(),
          slug: cleanSlug,
          description: description?.trim() || null,
          sortOrder: order,
          imageUrl: typeof imageUrl === "string" ? imageUrl.trim() || null : null,
        },
      });

      if (Array.isArray(sizeSystemIds) && sizeSystemIds.length > 0) {
        await prisma.subcategorySizeSystem.createMany({
          data: sizeSystemIds.map((ssId: string) => ({
            subcategoryId: subcategory.id,
            sizeSystemId: ssId,
          })),
          skipDuplicates: true,
        });
      }

      return NextResponse.json({ success: true, subcategory }, { status: 201 });
    }

    // 3. CREATE PRODUCT
    if (target === "product") {
      const {
        subcategoryId,
        name,
        slug,
        description,
        leadTimeDays,
        moqPerFabric,
        moqCombinedMultiFabric,
        fitIds,
        initialFabric,
        imageUrl,
      } = data;

      if (!subcategoryId || typeof subcategoryId !== "string") {
        return NextResponse.json({ error: "Parent subcategory ID is required." }, { status: 400 });
      }
      if (!name || typeof name !== "string" || !name.trim()) {
        return NextResponse.json({ error: "Product name is required." }, { status: 400 });
      }
      if (!slug || typeof slug !== "string" || !slug.trim()) {
        return NextResponse.json({ error: "Product slug is required." }, { status: 400 });
      }

      if (
        !initialFabric ||
        !initialFabric.name ||
        typeof initialFabric.name !== "string" ||
        !initialFabric.name.trim() ||
        typeof initialFabric.priceMinCents !== "number" ||
        typeof initialFabric.priceMaxCents !== "number"
      ) {
        return NextResponse.json(
          { error: "Initial fabric specification (name, min price, max price) is required." },
          { status: 400 }
        );
      }

      if (initialFabric.priceMinCents > initialFabric.priceMaxCents) {
        return NextResponse.json(
          { error: "Fabric min price cannot exceed max price." },
          { status: 400 }
        );
      }

      const cleanSlug = slug.trim().toLowerCase();

      const existingSub = await prisma.subcategory.findUnique({ where: { id: subcategoryId } });
      if (!existingSub) {
        return NextResponse.json({ error: "Parent subcategory not found." }, { status: 404 });
      }

      const existingProd = await prisma.product.findUnique({ where: { slug: cleanSlug } });
      if (existingProd) {
        return NextResponse.json({ error: `Product slug '${cleanSlug}' already exists.` }, { status: 400 });
      }

      const product = await prisma.product.create({
        data: {
          subcategoryId,
          name: name.trim(),
          slug: cleanSlug,
          description: description?.trim() || null,
          imageUrl: typeof imageUrl === "string" ? imageUrl.trim() || null : null,
          leadTimeDays: typeof leadTimeDays === "number" ? leadTimeDays : 14,
          moqPerFabric: typeof moqPerFabric === "number" ? moqPerFabric : 50,
          moqCombinedMultiFabric: typeof moqCombinedMultiFabric === "number" ? moqCombinedMultiFabric : null,
          fabrics: {
            create: {
              name: initialFabric.name.trim(),
              description: initialFabric.description?.trim() || null,
              colorway: initialFabric.colorway?.trim() || null,
              priceMinCents: initialFabric.priceMinCents,
              priceMaxCents: initialFabric.priceMaxCents,
              setupFeeCents: typeof initialFabric.setupFeeCents === "number" ? initialFabric.setupFeeCents : 0,
            },
          },
          ...(Array.isArray(fitIds) && fitIds.length > 0
            ? {
                fits: {
                  create: fitIds.map((fitId: string) => ({ fitId })),
                },
              }
            : {}),
        },
        include: {
          fabrics: true,
          fits: { include: { fit: true } },
        },
      });

      return NextResponse.json({ success: true, product }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid target for creation." }, { status: 400 });
  } catch (error) {
    console.error("Failed to create catalog item", error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const { target, id, data } = body;

    if (target === "category" && typeof id === "string") {
      const updated = await prisma.category.update({
        where: { id },
        data: {
          ...(typeof data.active === "boolean" ? { active: data.active } : {}),
          ...(typeof data.name === "string" ? { name: data.name.trim() } : {}),
          ...(typeof data.description === "string" ? { description: data.description.trim() || null } : {}),
          ...(typeof data.imageUrl === "string" || data.imageUrl === null ? { imageUrl: data.imageUrl?.trim() || null } : {}),
        },
      });
      return NextResponse.json({ success: true, category: updated });
    }

    if (target === "subcategory" && typeof id === "string") {
      const updated = await prisma.subcategory.update({
        where: { id },
        data: {
          ...(typeof data.active === "boolean" ? { active: data.active } : {}),
          ...(typeof data.name === "string" ? { name: data.name.trim() } : {}),
          ...(typeof data.description === "string" ? { description: data.description.trim() || null } : {}),
          ...(typeof data.imageUrl === "string" || data.imageUrl === null ? { imageUrl: data.imageUrl?.trim() || null } : {}),
        },
      });
      return NextResponse.json({ success: true, subcategory: updated });
    }

    if (target === "product" && typeof id === "string") {
      const updated = await prisma.product.update({
        where: { id },
        data: {
          ...(typeof data.active === "boolean" ? { active: data.active } : {}),
          ...(typeof data.leadTimeDays === "number" ? { leadTimeDays: data.leadTimeDays } : {}),
          ...(typeof data.moq === "number" ? { moq: data.moq } : {}),
          ...(typeof data.moqPerFabric === "number" ? { moqPerFabric: data.moqPerFabric } : {}),
          ...(data.moqCombinedMultiFabric === null || typeof data.moqCombinedMultiFabric === "number"
            ? { moqCombinedMultiFabric: data.moqCombinedMultiFabric }
            : {}),
          ...(typeof data.imageUrl === "string" || data.imageUrl === null ? { imageUrl: data.imageUrl?.trim() || null } : {}),
        },
      });
      return NextResponse.json({ success: true, product: updated });
    }

    if (target === "productFits" && typeof id === "string" && Array.isArray(data.fitIds)) {
      await prisma.productFit.deleteMany({
        where: { productId: id },
      });

      if (data.fitIds.length > 0) {
        await prisma.productFit.createMany({
          data: data.fitIds.map((fitId: string) => ({
            productId: id,
            fitId,
          })),
        });
      }
      return NextResponse.json({ success: true });
    }

    if (target === "fabric" && typeof id === "string") {
      const updated = await prisma.fabric.update({
        where: { id },
        data: {
          ...(typeof data.active === "boolean" ? { active: data.active } : {}),
          ...(typeof data.priceMinCents === "number" ? { priceMinCents: data.priceMinCents } : {}),
          ...(typeof data.priceMaxCents === "number" ? { priceMaxCents: data.priceMaxCents } : {}),
          ...(typeof data.setupFeeCents === "number" ? { setupFeeCents: data.setupFeeCents } : {}),
        },
      });
      return NextResponse.json({ success: true, fabric: updated });
    }

    return NextResponse.json({ error: "Invalid target or id" }, { status: 400 });
  } catch (error) {
    console.error("Failed to update catalog item", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await verifyAdminRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const target = searchParams.get("target");
    const id = searchParams.get("id");

    if (!target || !id) {
      return NextResponse.json({ error: "Target and id parameters are required." }, { status: 400 });
    }

    if (target === "category") {
      await prisma.category.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (target === "subcategory") {
      await prisma.subcategory.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (target === "product") {
      await prisma.productFit.deleteMany({ where: { productId: id } });
      await prisma.fabric.deleteMany({ where: { productId: id } });
      await prisma.product.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid target for deletion." }, { status: 400 });
  } catch (error) {
    console.error("Failed to delete catalog item", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
