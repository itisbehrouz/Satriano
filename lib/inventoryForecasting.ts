import { prisma } from "./prisma";

export async function calculateInventoryForecast(): Promise<void> {
  const products = await prisma.wholesaleProduct.findMany({
    include: { stock: true },
  });

  for (const product of products) {
    for (const stock of product.stock) {
      const historicalOrders = await getHistoricalDemand(product.id, stock.size, 90);
      const dailyRate = historicalOrders / 90;
      
      const forecast30Days = Math.ceil(dailyRate * 30);
      const forecast90Days = Math.ceil(dailyRate * 90);

      await prisma.inventoryForecast.upsert({
        where: {
          productId_size: {
            productId: product.id,
            size: stock.size,
          },
        },
        update: {
          forecastedDemand30Days: forecast30Days,
          forecastedDemand90Days: forecast90Days,
          historicalMovementRate: dailyRate,
          lastUpdated: new Date(),
        },
        create: {
          productId: product.id,
          size: stock.size,
          forecastedDemand30Days: forecast30Days,
          forecastedDemand90Days: forecast90Days,
          historicalMovementRate: dailyRate,
        },
      });
    }
  }
}

async function getHistoricalDemand(
  productId: string,
  size: string,
  days: number
): Promise<number> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate },
      status: "PAID",
      lines: {
        some: {
          productId,
          size,
        },
      },
    },
    include: {
      lines: {
        where: { productId, size },
      },
    },
  });

  return orders.reduce((sum, o) => sum + (o.lines[0]?.quantity || 0), 0);
}

export async function checkReorderPoints(): Promise<Record<string, unknown>[]> {
  const policies = await prisma.inventoryPolicy.findMany({
    include: {
      product: {
        include: { stock: true },
      },
    },
  });
  
  const alerts = [];

  for (const policy of policies) {
    for (const stock of policy.product.stock) {
      if (stock.quantity <= policy.reorderPoint) {
        alerts.push({
          sku: policy.product.sku,
          size: stock.size,
          quantity: stock.quantity,
          reorderPoint: policy.reorderPoint,
        });
      }
    }
  }
  
  return alerts;
}
