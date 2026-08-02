import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { ConfiguratorClient } from "@/components/configurator/ConfiguratorClient";
import { prisma } from "@/lib/prisma";
import { verifyCustomerToken } from "@/lib/customerAuth";

export const dynamic = "force-dynamic";

interface ProductConfiguratorPageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductConfiguratorPage({
  params,
}: ProductConfiguratorPageProps) {
  const { productId } = await params;

  // Check customer authentication state
  const cookieStore = await cookies();
  const token = cookieStore.get("sat_customer_token")?.value;
  const customerSession = token ? await verifyCustomerToken(token) : null;

  let initialCompanyName = "";
  let initialCompanyEmail = "";
  if (customerSession?.email) {
    initialCompanyEmail = customerSession.email;
    const company = await prisma.company.findFirst({
      where: { email: customerSession.email },
      select: { name: true },
    });
    initialCompanyName = company?.name || customerSession.email.split("@")[0].toUpperCase();
  }

  // Search product by ID or Slug
  let product = await prisma.product.findFirst({
    where: {
      active: true,
      OR: [{ id: productId }, { slug: productId }],
    },
    include: {
      fabrics: {
        where: { active: true },
        orderBy: { priceMinCents: "asc" },
      },
      fits: {
        include: {
          fit: true,
        },
        orderBy: { fit: { sortOrder: "asc" } },
      },
      subcategory: {
        include: {
          category: true,
          sizeSystems: {
            include: {
              sizeSystem: {
                include: {
                  options: {
                    orderBy: { sortOrder: "asc" },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // Backward compatibility fallback: if productId matches a subcategory slug, find its first active product
  if (!product) {
    const subcategory = await prisma.subcategory.findFirst({
      where: { OR: [{ id: productId }, { slug: productId }] },
      include: {
        products: {
          where: { active: true },
          include: {
            fabrics: { where: { active: true }, orderBy: { priceMinCents: "asc" } },
            fits: { include: { fit: true } },
          },
          take: 1,
        },
        category: true,
        sizeSystems: {
          include: {
            sizeSystem: {
              include: {
                options: { orderBy: { sortOrder: "asc" } },
              },
            },
          },
        },
      },
    });

    if (subcategory && subcategory.products[0]) {
      const firstProd = subcategory.products[0];
      product = {
        ...firstProd,
        subcategory: {
          id: subcategory.id,
          categoryId: subcategory.categoryId,
          name: subcategory.name,
          slug: subcategory.slug,
          description: subcategory.description,
          imageUrl: subcategory.imageUrl,
          leadTimeDays: subcategory.leadTimeDays,
          moq: subcategory.moq,
          active: subcategory.active,
          sortOrder: subcategory.sortOrder,
          createdAt: subcategory.createdAt,
          updatedAt: subcategory.updatedAt,
          category: subcategory.category,
          sizeSystems: subcategory.sizeSystems,
        },
      };
    }
  }

  if (!product) {
    notFound();
  }

  // Product-scoped fabrics, with global active fabric fallback if none specified
  let fabrics = product.fabrics.map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    imageUrl: f.imageUrl,
    priceMinCents: f.priceMinCents,
    priceMaxCents: f.priceMaxCents,
    setupFeeCents: f.setupFeeCents,
  }));

  if (fabrics.length === 0) {
    const globalFabrics = await prisma.fabric.findMany({
      where: { active: true },
      orderBy: { priceMinCents: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        priceMinCents: true,
        priceMaxCents: true,
        setupFeeCents: true,
      },
    });
    fabrics = globalFabrics;
  }

  // Exact linked product fits (empty array if excluded category)
  const fits = product.fits.map((pf) => ({
    id: pf.fit.id,
    name: pf.fit.name,
    code: pf.fit.code,
    description: pf.fit.description,
  }));

  const formattedSizeSystems = product.subcategory.sizeSystems.map((ss) => ({
    id: ss.sizeSystem.id,
    name: ss.sizeSystem.name,
    region: ss.sizeSystem.region,
    options: ss.sizeSystem.options.map((o) => ({
      id: o.id,
      label: o.label,
      sortOrder: o.sortOrder,
    })),
  }));

  // Product-scoped MOQ for gating and progress indicator
  const moqPerFabric = product.moqPerFabric;

  return (
    <>
      {customerSession ? (
        <PortalHeader initialCompanyName={initialCompanyName} />
      ) : (
        <SiteHeader />
      )}
      <ConfiguratorClient
        productId={product.id}
        fabrics={fabrics}
        fits={fits}
        subcategoryTitle={product.name}
        subcategoryDescription={product.description || ""}
        categoryTitle={`${product.subcategory.category.name} • ${product.subcategory.name}`}
        sizeSystems={formattedSizeSystems}
        moqPerFabric={moqPerFabric}
        isLoggedIn={!!customerSession}
        initialCompanyEmail={initialCompanyEmail}
        initialCompanyName={initialCompanyName}
      />
      <SiteFooter />
    </>
  );
}
