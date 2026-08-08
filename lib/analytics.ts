import { prisma } from "./prisma";
import { Prisma } from "@/app/generated/prisma/client";

/**
 * Revenue metrics for date range
 */
export async function getRevenueMetrics(startDate: Date, endDate: Date) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: "PAID",
    },
    select: {
      finalPriceCents: true,
      orderType: true,
      createdAt: true,
    },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.finalPriceCents || 0), 0);
  const m2oRevenue = orders
    .filter((o) => o.orderType === "M2O")
    .reduce((sum, o) => sum + (o.finalPriceCents || 0), 0);
  const wholesaleRevenue = orders
    .filter((o) => o.orderType === "WHOLESALE")
    .reduce((sum, o) => sum + (o.finalPriceCents || 0), 0);

  // Daily breakdown
  const dailyRevenue = new Map<string, number>();
  orders.forEach((o) => {
    const day = o.createdAt.toISOString().split("T")[0];
    dailyRevenue.set(day, (dailyRevenue.get(day) || 0) + (o.finalPriceCents || 0));
  });

  return {
    totalRevenue,
    totalRevenueCents: totalRevenue,
    m2oRevenue,
    wholesaleRevenue,
    orderCount: orders.length,
    averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
    dailyRevenue: Object.fromEntries(dailyRevenue),
  };
}

/**
 * Order metrics and funnel
 */
export async function getOrderMetrics(startDate: Date, endDate: Date) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
    select: {
      status: true,
      orderType: true,
      createdAt: true,
    },
  });

  // Status distribution
  const byStatus = new Map<string, number>();
  orders.forEach((o) => {
    byStatus.set(o.status, (byStatus.get(o.status) || 0) + 1);
  });

  // Success rate (paid / created)
  const paidCount = orders.filter((o) => o.status === "PAID").length;
  const successRate = orders.length > 0 ? (paidCount / orders.length) * 100 : 0;

  // By order type
  const m2oCount = orders.filter((o) => o.orderType === "M2O").length;
  const wholesaleCount = orders.filter((o) => o.orderType === "WHOLESALE").length;

  return {
    totalOrders: orders.length,
    statusDistribution: Object.fromEntries(byStatus),
    paidOrders: paidCount,
    successRate,
    m2oOrders: m2oCount,
    wholesaleOrders: wholesaleCount,
  };
}

/**
 * Material usage report
 */
export async function getMaterialUsageMetrics(startDate: Date, endDate: Date) {
  const lines = await prisma.orderLine.findMany({
    where: {
      order: {
        createdAt: { gte: startDate, lte: endDate },
        status: "PAID",
      },
    },
    include: {
      materials: {
        include: {
          material: true,
        },
      },
    },
  });

  const materialUsage = new Map<string, { quantity: number; orders: number }>();

  lines.forEach((line) => {
    line.materials.forEach((mat) => {
      const key = mat.material.name;
      const current = materialUsage.get(key) || { quantity: 0, orders: 0 };
      current.quantity += line.quantity;
      current.orders += 1;
      materialUsage.set(key, current);
    });
  });

  return {
    topMaterials: Array.from(materialUsage.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10),
    totalMaterialVariants: materialUsage.size,
  };
}

/**
 * Supplier performance metrics
 */
export async function getSupplierPerformanceMetrics(startDate: Date, endDate: Date) {
  const suppliers = await prisma.supplier.findMany({
    include: {
      wholesaleProducts: true,
    },
  });
  
  return {
    totalSuppliers: suppliers.length,
    suppliers: suppliers.map(s => ({
      name: s.firmName,
      poCount: 0,
      totalValue: 0,
      receivedCount: 0,
      lateCount: 0,
      avgLeadTime: 0,
      onTimeRate: 100, // Dummy until PO logic is added
      productCount: s.wholesaleProducts.length,
    })).sort((a, b) => b.productCount - a.productCount),
  };
}

/**
 * Dashboard Overview
 */
export async function getDashboardOverview(startDate: Date, endDate: Date) {
  const [revenue, orders, materials, suppliers] = await Promise.all([
    getRevenueMetrics(startDate, endDate),
    getOrderMetrics(startDate, endDate),
    getMaterialUsageMetrics(startDate, endDate),
    getSupplierPerformanceMetrics(startDate, endDate),
  ]);

  return {
    dateRange: { startDate, endDate },
    revenue,
    orders,
    materials,
    suppliers,
  };
}
