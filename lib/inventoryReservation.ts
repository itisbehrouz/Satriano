import { prisma } from '@/lib/prisma';

export const StockReservationStatus = {
  ACTIVE: 'RESERVED',
  EXPIRED: 'EXPIRED',
  FULFILLED: 'FULFILLED',
  CANCELLED: 'CANCELLED',
} as const;

export async function reserveStockForOrder(orderId: string, skuId: string, quantity: number, expiresInHours: number = 24) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + expiresInHours);

  return await prisma.$transaction(async (tx) => {
    // 1. Get current stock
    const stock = await tx.wholesaleStock.findUnique({
      where: { id: skuId },
    });

    if (!stock) {
      throw new Error(`SKU ${skuId} not found`);
    }

    // 2. Get active reservations
    const activeReservations = await tx.stockReservation.aggregate({
      where: {
        skuId,
        status: StockReservationStatus.ACTIVE,
      },
      _sum: {
        quantity: true,
      },
    });

    const reservedQuantity = activeReservations._sum.quantity || 0;
    const availableQuantity = stock.quantity - reservedQuantity;

    if (availableQuantity < quantity) {
      throw new Error(`Insufficient stock for SKU ${skuId}. Available: ${availableQuantity}, Requested: ${quantity}`);
    }

    // 3. Create reservation
    const reservation = await tx.stockReservation.create({
      data: {
        skuId,
        orderId,
        quantity,
        expiresAt,
        status: StockReservationStatus.ACTIVE,
      },
    });

    return reservation;
  });
}

export async function releaseExpiredReservations() {
  const result = await prisma.stockReservation.updateMany({
    where: {
      status: StockReservationStatus.ACTIVE,
      expiresAt: {
        lt: new Date(),
      },
    },
    data: {
      status: StockReservationStatus.EXPIRED,
    },
  });

  return result;
}
